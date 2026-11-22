"""
SIEM Analytics System - Multi-Tenant Isolation Tests (Comprehensive Security Suite)

Verifies complete data, read/write, aggregate, and WebSocket isolation between distinct tenants (Org A vs Org B).
"""
import pytest
import asyncio
import json
from httpx import AsyncClient
from datetime import datetime, timezone
from starlette.testclient import TestClient

from app.database import async_session
from app.models import (
    SecurityEvent, Alert, DetectionRule, AttackChain, AttackChainStage,
    ComplianceViolation, IncidentRecommendation
)
from app.auth import create_access_token
from app.main import app as fastapi_app
from app.routes.websocket import broadcast_event, connected_clients


# ---------------------------------------------------------------------------
# 1. Event & Alert Isolation Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_cross_tenant_event_read_isolation(auth_client: AsyncClient, analyst_b_client: AsyncClient, org_a, org_b):
    """Events created in Org A must be invisible to Org B."""
    async with async_session() as session:
        async with session.begin():
            event_a = SecurityEvent(
                org_id=org_a.id,
                timestamp=datetime.now(timezone.utc),
                source_ip="192.168.1.100",
                event_type="unauthorized_access",
                severity="High",
            )
            session.add(event_a)

    # Org A reads events -> sees the event
    resp_a = await auth_client.get("/api/events")
    assert resp_a.status_code == 200
    events_a = resp_a.json()["events"]
    assert len(events_a) >= 1
    assert any(e["source_ip"] == "192.168.1.100" for e in events_a)

    # Org B reads events -> must NOT see Org A event
    resp_b = await analyst_b_client.get("/api/events")
    assert resp_b.status_code == 200
    events_b = resp_b.json()["events"]
    assert not any(e["source_ip"] == "192.168.1.100" for e in events_b)


@pytest.mark.asyncio
async def test_cross_tenant_event_ingestion_override(auth_client: AsyncClient, org_a, org_b):
    """Client-supplied org_id in request body cannot override JWT tenant context."""
    payload = {
        "org_id": org_b.id,  # Malicious client attempts to spoof org_id
        "source_ip": "10.0.0.99",
        "event_type": "brute_force",
        "severity": "Critical",
    }
    resp = await auth_client.post("/api/events", json=payload)
    assert resp.status_code in (200, 201)
    created_event = resp.json()
    event_id = created_event["id"]
    async with async_session() as session:
        db_event = await session.get(SecurityEvent, event_id)
        assert db_event.org_id == org_a.id  # Must be forced to Org A!


@pytest.mark.asyncio
async def test_aggregate_stats_isolation(auth_client: AsyncClient, analyst_b_client: AsyncClient, org_a):
    """Aggregate statistics endpoints calculate metrics using ONLY the authenticated tenant."""
    async with async_session() as session:
        async with session.begin():
            for i in range(5):
                event_a = SecurityEvent(
                    org_id=org_a.id,
                    timestamp=datetime.now(timezone.utc),
                    source_ip=f"172.16.0.{i+1}",
                    event_type="exfiltration",
                    severity="Critical",
                )
                session.add(event_a)

    stats_a = (await auth_client.get("/api/events/stats")).json()
    assert stats_a["critical"] >= 5

    stats_b = (await analyst_b_client.get("/api/events/stats")).json()
    assert stats_b["critical"] == 0
    assert stats_b["total_events"] == 0


@pytest.mark.asyncio
async def test_alert_cross_tenant_isolation(auth_client: AsyncClient, analyst_b_client: AsyncClient):
    """Alert created by Org A cannot be read or modified by Org B."""
    create_resp = await auth_client.post("/api/alerts", json={
        "title": "Confidential Org A Alert",
        "description": "Org A incident details",
        "severity": "High",
        "priority": "P1"
    })
    assert create_resp.status_code == 201
    alert_id = create_resp.json()["id"]

    # Org B attempts to read Org A alert detail -> 404 Not Found
    get_resp = await analyst_b_client.get(f"/api/alerts/{alert_id}")
    assert get_resp.status_code == 404

    # Org B attempts to update Org A alert -> 404 Not Found
    patch_resp = await analyst_b_client.patch(f"/api/alerts/{alert_id}", json={"status": "resolved"})
    assert patch_resp.status_code == 404


# ---------------------------------------------------------------------------
# 2. Detection Rules Isolation Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_detection_rule_cross_tenant_isolation(admin_auth_client: AsyncClient, admin_b_client: AsyncClient, analyst_b_client: AsyncClient, org_a, org_b):
    """Detection rules created in Org A must be isolated from Org B for list, GET, PATCH, and DELETE."""
    # Org A Admin creates a rule
    rule_payload = {
        "name": "Org A Confidential Rule",
        "description": "Rules for Org A perimeter",
        "severity": "High",
        "category": "Auth",
        "enabled": True,
        "conditions": {"field": "failed_attempts", "operator": ">=", "value": 5}
    }
    create_resp = await admin_auth_client.post("/api/rules", json=rule_payload)
    assert create_resp.status_code == 201
    rule_id = create_resp.json()["id"]

    # Org B Admin lists rules -> Org A rule absent
    list_b = await admin_b_client.get("/api/rules")
    assert list_b.status_code == 200
    rule_names_b = [r["name"] for r in list_b.json()["rules"]]
    assert "Org A Confidential Rule" not in rule_names_b

    # Org B Admin attempts to read Org A rule by ID -> 404
    get_b = await admin_b_client.get(f"/api/rules/{rule_id}")
    assert get_b.status_code == 404

    # Org B Admin attempts to update Org A rule -> 404
    put_b = await admin_b_client.put(f"/api/rules/{rule_id}", json={"name": "Hijacked Rule Name"})
    assert put_b.status_code == 404

    # Org B Admin attempts to delete Org A rule -> 404
    del_b = await admin_b_client.delete(f"/api/rules/{rule_id}")
    assert del_b.status_code == 404


@pytest.mark.asyncio
async def test_rule_creation_org_id_override_protection(admin_auth_client: AsyncClient, org_a, org_b):
    """Client-supplied org_id in rule creation body cannot assign rule to Org B."""
    payload = {
        "org_id": org_b.id,  # Spoof attempt
        "name": "Spoofed Rule Attempt",
        "severity": "Medium",
        "category": "Network",
        "enabled": True,
        "conditions": {"field": "bytes", "operator": ">", "value": 1000}
    }
    resp = await admin_auth_client.post("/api/rules", json=payload)
    assert resp.status_code in (200, 201)
    rule_id = resp.json()["id"]

    async with async_session() as session:
        db_rule = await session.get(DetectionRule, rule_id)
        assert db_rule.org_id == org_a.id  # Forced to Org A!


# ---------------------------------------------------------------------------
# 3. Attack Chains Isolation Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_attack_chain_cross_tenant_isolation(admin_auth_client: AsyncClient, analyst_b_client: AsyncClient, org_a, org_b):
    """Attack chains created in Org A are invisible to Org B and cannot be modified by Org B."""
    async with async_session() as session:
        async with session.begin():
            chain_a = AttackChain(
                org_id=org_a.id,
                name="Org A Multi-Stage Threat",
                source_ip="198.51.100.45",
                target_system="10.0.1.5",
                severity="Critical",
                risk_score=92.0,
                status="active"
            )
            session.add(chain_a)

    # Org B lists attack chains -> empty / Org A chain absent
    list_b = await analyst_b_client.get("/api/attack-chains")
    assert list_b.status_code == 200
    chain_ids_b = [c["id"] for c in list_b.json()["chains"]]
    assert chain_a.id not in chain_ids_b

    # Org B attempts to read Org A chain by ID -> 404
    get_b = await analyst_b_client.get(f"/api/attack-chains/{chain_a.id}")
    assert get_b.status_code == 404

    # Org B Admin attempts status update -> 404
    patch_b = await analyst_b_client.patch(f"/api/attack-chains/{chain_a.id}/status", json={"status": "resolved"})
    assert patch_b.status_code in (403, 404)


@pytest.mark.asyncio
async def test_attack_chain_correlation_tenant_isolation(admin_auth_client: AsyncClient, admin_b_client: AsyncClient, org_a, org_b):
    """POST /api/attack-chains/correlate only correlates events belonging to the authenticated tenant."""
    async with async_session() as session:
        async with session.begin():
            # Org A non-normal event
            evt_a = SecurityEvent(
                org_id=org_a.id,
                timestamp=datetime.now(timezone.utc),
                source_ip="203.0.113.10",
                event_type="login_failure",
                severity="High",
                label="Brute Force",
                failed_attempts=10
            )
            session.add(evt_a)

    # Org B triggers correlation -> Org A event is ignored
    corr_b = await admin_b_client.post("/api/attack-chains/correlate")
    assert corr_b.status_code == 201
    chains_b = corr_b.json()["chains"]
    for c in chains_b:
        assert c["source_ip"] != "203.0.113.10"


# ---------------------------------------------------------------------------
# 4. Compliance & Recommendation Isolation Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_compliance_cross_tenant_isolation(auth_client: AsyncClient, analyst_b_client: AsyncClient, admin_b_client: AsyncClient, org_a):
    """Compliance violations and summary metrics are strictly tenant-isolated."""
    async with async_session() as session:
        async with session.begin():
            viol_a = ComplianceViolation(
                org_id=org_a.id,
                timestamp=datetime.now(timezone.utc),
                violation_type="Unencrypted Data Transfer",
                username="org_a_user",
                source_ip="10.0.0.1",
                description="FTP protocol detected",
                policy="PCI-DSS 4.1",
                severity="High",
                status="open"
            )
            session.add(viol_a)

    # Org B lists violations -> Org A violation absent
    viol_b = await analyst_b_client.get("/api/compliance/violations")
    assert viol_b.status_code == 200
    assert not any(v["username"] == "org_a_user" for v in viol_b.json())

    # Org B gets summary -> total = 0
    sum_b = await analyst_b_client.get("/api/compliance/summary")
    assert sum_b.status_code == 200
    assert sum_b.json()["total"] == 0

    # Org B Admin attempts to update Org A violation status -> 404
    patch_b = await admin_b_client.patch(f"/api/compliance/violations/{viol_a.id}", json={"status": "resolved"})
    assert patch_b.status_code == 404


@pytest.mark.asyncio
async def test_recommendation_cross_tenant_isolation(auth_client: AsyncClient, analyst_b_client: AsyncClient, admin_b_client: AsyncClient, org_a):
    """Incident recommendations are tenant-isolated for list and update endpoints."""
    async with async_session() as session:
        async with session.begin():
            rec_a = IncidentRecommendation(
                org_id=org_a.id,
                event_id=None,
                risk_score=85.0,
                escalation_level="Isolate",
                recommendation="Block Egress on Firewall",
                status="pending"
            )
            session.add(rec_a)

    # Org B lists recommendations -> Rec A absent
    list_b = await analyst_b_client.get("/api/recommendations")
    assert list_b.status_code == 200
    assert not any(r["recommendation"] == "Block Egress on Firewall" for r in list_b.json())

    # Org B Admin attempts update -> 404
    patch_b = await admin_b_client.patch(f"/api/recommendations/{rec_a.id}", json={"status": "completed"})
    assert patch_b.status_code == 404


# ---------------------------------------------------------------------------
# 5. Risk & Threat Analytics Isolation Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_risk_and_threat_analytics_isolation(auth_client: AsyncClient, analyst_b_client: AsyncClient, org_a):
    """Risk scores and threat analytics metrics reflect only the authenticated tenant's data."""
    async with async_session() as session:
        async with session.begin():
            evt = SecurityEvent(
                org_id=org_a.id,
                timestamp=datetime.now(timezone.utc),
                source_ip="198.51.100.99",
                event_type="exfiltration",
                severity="Critical",
                risk_score=95.0,
                country="RU",
                destination_port=4444
            )
            session.add(evt)

    # Risk scores list & summary
    risk_b = await analyst_b_client.get("/api/risk-scores")
    assert risk_b.status_code == 200
    assert not any(e["source_ip"] == "198.51.100.99" for e in risk_b.json())

    risk_sum_b = await analyst_b_client.get("/api/risk-scores/summary")
    assert risk_sum_b.status_code == 200
    assert risk_sum_b.json()["high_risk_count"] == 0

    # Threat analytics endpoints
    top_ips_b = await analyst_b_client.get("/api/threats/top-ips")
    assert top_ips_b.status_code == 200
    assert not any(item["ip"] == "198.51.100.99" for item in top_ips_b.json())


# ---------------------------------------------------------------------------
# 6. WebSocket Cross-Tenant Stream Isolation Tests
# ---------------------------------------------------------------------------
from unittest.mock import AsyncMock


@pytest.fixture(autouse=True)
def reset_websocket_registry():
    """Ensure connected_clients registry is clean before and after every test."""
    connected_clients.clear()
    yield
    connected_clients.clear()


@pytest.mark.asyncio
async def test_websocket_broadcast_tenant_routing():
    """
    Deterministic unit test of broadcast_event tenant recipient scoping.
    Directly verifies that broadcast_event(payload, org_id) invokes send_text
    ONLY on connections registered under matching org_id.
    """
    mock_ws_a = AsyncMock()
    mock_ws_b = AsyncMock()

    # Register fake WebSocket objects with distinct tenant IDs
    connected_clients[mock_ws_a] = 101  # Org A
    connected_clients[mock_ws_b] = 202  # Org B

    # 1. Broadcast targeting Org A
    payload_a = {"event": "CRITICAL_ORG_A_ALERT", "tenant": "ORG_A"}
    await broadcast_event(payload_a, org_id=101)

    # Org A connection must receive payload; Org B connection must receive NOTHING
    mock_ws_a.send_text.assert_called_once_with(json.dumps(payload_a))
    mock_ws_b.send_text.assert_not_called()

    # Reset mocks
    mock_ws_a.reset_mock()
    mock_ws_b.reset_mock()

    # 2. Broadcast targeting Org B
    payload_b = {"event": "CRITICAL_ORG_B_ALERT", "tenant": "ORG_B"}
    await broadcast_event(payload_b, org_id=202)

    # Org B connection must receive payload; Org A connection must receive NOTHING
    mock_ws_b.send_text.assert_called_once_with(json.dumps(payload_b))
    mock_ws_a.send_text.assert_not_called()


def test_websocket_positive_event_delivery(admin_a, org_a):
    """
    Integration test for real WebSocket client positive event delivery:
    1. Authenticates & registers connection under Org A
    2. Receives targeted broadcast event matching Org A
    """
    token_a = create_access_token({"sub": admin_a.username, "user_id": admin_a.id, "org_id": org_a.id, "role": "admin"})

    with TestClient(fastapi_app) as client:
        with client.websocket_connect(f"/ws/events?token={token_a}") as ws_a:
            # Verify socket is registered under org_a.id
            assert len(connected_clients) == 1
            assert list(connected_clients.values())[0] == org_a.id

            # Broadcast explicit test payload
            test_payload = {"event": "POSITIVE_DELIVERY_TEST", "org": org_a.id}
            asyncio.run(broadcast_event(test_payload, org_id=org_a.id))

            # Read frame
            received = ws_a.receive_json()
            if received.get("event") != "POSITIVE_DELIVERY_TEST":
                received = ws_a.receive_json()

            assert received.get("event") == "POSITIVE_DELIVERY_TEST"
            assert received.get("org") == org_a.id


def test_websocket_connection_cleanup(admin_a, org_a):
    """
    Verifies WebSocket connection registry cleanup:
    1. Pre-condition: connected_clients is empty
    2. Connection open: socket entry & tenant metadata added
    3. Connection exit: socket entry & tenant metadata completely purged
    """
    token_a = create_access_token({"sub": admin_a.username, "user_id": admin_a.id, "org_id": org_a.id, "role": "admin"})

    # Pre-condition: registry empty
    assert len(connected_clients) == 0

    with TestClient(fastapi_app) as client:
        with client.websocket_connect(f"/ws/events?token={token_a}") as ws:
            # Active connection: registry contains socket mapped to org_a.id
            assert len(connected_clients) == 1
            assert list(connected_clients.values())[0] == org_a.id
            ws.close()

    # Post-condition: disconnect & TestClient shutdown removes socket and tenant metadata
    assert len(connected_clients) == 0
