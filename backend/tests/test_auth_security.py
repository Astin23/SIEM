"""
SIEM Analytics System - Authentication & Security Contract Tests

Verifies JWT claim contract, token validation errors, RBAC enforcement,
OrganizationMembership authority over User.role, and client-supplied org_id mass assignment protection.
"""
import pytest
from httpx import AsyncClient

from app.database import async_session
from app.models import User, Organization, OrganizationMembership, SecurityEvent, Alert, DetectionRule
from app.auth import create_access_token, hash_password


# ---------------------------------------------------------------------------
# 1. JWT Claim & Malformed Token Contract Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_missing_auth_header_rejected(client: AsyncClient):
    """Protected endpoint without Authorization header returns 401 or 403."""
    resp = await client.get("/api/events")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_malformed_token_rejected(client: AsyncClient):
    """Malformed or invalid JWT token returns 401."""
    headers = {"Authorization": "Bearer not.a.valid.jwt.token"}
    resp = await client.get("/api/events", headers=headers)
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_jwt_missing_sub_rejected(client: AsyncClient, org_a):
    """JWT missing 'sub' claim returns 401."""
    token = create_access_token({"user_id": 1, "org_id": org_a.id, "role": "admin"})
    resp = await client.get("/api/events", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_jwt_missing_user_id_rejected(client: AsyncClient, org_a):
    """JWT missing 'user_id' claim returns 401."""
    token = create_access_token({"sub": "admin_user", "org_id": org_a.id, "role": "admin"})
    resp = await client.get("/api/events", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_jwt_missing_org_id_rejected(client: AsyncClient):
    """JWT missing 'org_id' claim returns 401 (strict tenant requirement)."""
    token = create_access_token({"sub": "admin_user", "user_id": 1, "role": "admin"})
    resp = await client.get("/api/events", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_jwt_missing_role_rejected(client: AsyncClient, org_a):
    """JWT missing 'role' claim returns 401."""
    token = create_access_token({"sub": "admin_user", "user_id": 1, "org_id": org_a.id})
    resp = await client.get("/api/events", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


# ---------------------------------------------------------------------------
# 2. Login Membership & Organization Membership Authority Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_user_with_zero_memberships_login_rejected(client: AsyncClient):
    """User with no organization memberships cannot log in (401)."""
    async with async_session() as session:
        async with session.begin():
            orphaned_user = User(
                username="orphaned_user",
                password_hash=hash_password("Password123!"),
                role="analyst"
            )
            session.add(orphaned_user)

    resp = await client.post("/api/auth/login", json={"username": "orphaned_user", "password": "Password123!"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_user_with_multiple_memberships_login_returns_400(client: AsyncClient, org_a, org_b):
    """User belonging to >1 organizations receives 400 requiring org selection."""
    async with async_session() as session:
        async with session.begin():
            multi_user = User(
                username="multi_org_user",
                password_hash=hash_password("Password123!"),
                role="analyst"
            )
            session.add(multi_user)
            await session.flush()

            session.add(OrganizationMembership(user_id=multi_user.id, org_id=org_a.id, role="analyst"))
            session.add(OrganizationMembership(user_id=multi_user.id, org_id=org_b.id, role="manager"))

    resp = await client.post("/api/auth/login", json={"username": "multi_org_user", "password": "Password123!"})
    assert resp.status_code == 400
    assert "multiple organizations" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_membership_role_overrides_legacy_user_role(client: AsyncClient, org_a):
    """JWT role is derived strictly from OrganizationMembership.role, NOT User.role."""
    async with async_session() as session:
        async with session.begin():
            user = User(
                username="mismatched_role_user",
                password_hash=hash_password("Password123!"),
                role="analyst"  # Legacy column says analyst
            )
            session.add(user)
            await session.flush()

            membership = OrganizationMembership(
                user_id=user.id,
                org_id=org_a.id,
                role="admin"  # Authoritative membership role is admin!
            )
            session.add(membership)

    login_resp = await client.post("/api/auth/login", json={"username": "mismatched_role_user", "password": "Password123!"})
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Use token to perform an admin-only action (create detection rule)
    rule_resp = await client.post(
        "/api/rules",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Admin Action Granted",
            "severity": "Low",
            "category": "Test",
            "enabled": True,
            "conditions": {"field": "test", "operator": "==", "value": "test"}
        }
    )
    assert rule_resp.status_code == 201  # Allowed because membership role is admin!


@pytest.mark.asyncio
async def test_rbac_insufficient_role_returns_403(client: AsyncClient, analyst_a_token: str):
    """Analyst attempting admin-only action (e.g. creating a detection rule) receives 403."""
    headers = {"Authorization": f"Bearer {analyst_a_token}"}
    resp = await client.post(
        "/api/rules",
        headers=headers,
        json={
            "name": "Forbidden Rule Attempt",
            "severity": "High",
            "category": "Security",
            "enabled": True,
            "conditions": {"field": "port", "operator": "==", "value": 22}
        }
    )
    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# 3. Client-Supplied org_id Mass Assignment Protection Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_mass_assignment_org_id_override_alerts(client: AsyncClient, admin_a_token: str, org_a, org_b):
    """Malicious org_id in alert creation payload is overridden by JWT tenant context."""
    headers = {"Authorization": f"Bearer {admin_a_token}"}
    payload = {
        "org_id": org_b.id,  # Spoofing Org B
        "title": "Spoofed Org B Alert Attempt",
        "severity": "High",
        "priority": "P1"
    }
    resp = await client.post("/api/alerts", headers=headers, json=payload)
    assert resp.status_code == 201
    alert_id = resp.json()["id"]

    async with async_session() as session:
        alert = await session.get(Alert, alert_id)
        assert alert.org_id == org_a.id  # Must be forced to Org A!
