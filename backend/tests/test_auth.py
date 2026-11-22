# Authentication and Authorization Test Suite

import pytest
import json
from starlette.testclient import TestClient
from app.main import app
from app.database import async_session
from app.models import OrganizationMembership


# ---------- Protected REST Endpoint Tests ----------

@pytest.mark.asyncio
async def test_events_endpoint_unauthenticated(client):
    """Accessing protected /api/events without token should return 401 or 403."""
    resp = await client.get("/api/events")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_events_endpoint_authenticated(auth_client):
    """Authenticated request should succeed and return events list."""
    resp = await auth_client.get("/api/events")
    assert resp.status_code == 200
    data = resp.json()
    assert "events" in data
    assert isinstance(data["events"], list)


# ---------- Public Registration Tests ----------

@pytest.mark.asyncio
async def test_register_success(client):
    """Public registration creates user, organization, and admin membership."""
    resp = await client.post(
        "/api/auth/register",
        json={
            "username": "new_admin_user",
            "password": "SecurePassword123!",
            "org_name": "New Enterprise Org",
            "org_slug": "new-enterprise-org",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == "new_admin_user"
    assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_register_duplicate_username(client):
    """Registering with an existing username should return 409 Conflict."""
    payload = {
        "username": "dup_user",
        "password": "Password123!",
        "org_name": "Org One",
        "org_slug": "org-one",
    }
    resp1 = await client.post("/api/auth/register", json=payload)
    assert resp1.status_code == 201

    payload_dup = {
        "username": "dup_user",
        "password": "Password123!",
        "org_name": "Org Two",
        "org_slug": "org-two",
    }
    resp2 = await client.post("/api/auth/register", json=payload_dup)
    assert resp2.status_code == 409


@pytest.mark.asyncio
async def test_register_duplicate_org_slug(client):
    """Registering with an existing organization slug should return 409 Conflict."""
    payload1 = {
        "username": "user1_unique",
        "password": "Password123!",
        "org_name": "Org Unique 1",
        "org_slug": "shared-slug",
    }
    resp1 = await client.post("/api/auth/register", json=payload1)
    assert resp1.status_code == 201

    payload2 = {
        "username": "user2_unique",
        "password": "Password123!",
        "org_name": "Org Unique 2",
        "org_slug": "shared-slug",
    }
    resp2 = await client.post("/api/auth/register", json=payload2)
    assert resp2.status_code == 409


@pytest.mark.asyncio
async def test_register_missing_org_name(client):
    """Omitting org_name in registration should fail validation with 422."""
    resp = await client.post(
        "/api/auth/register",
        json={
            "username": "incomplete_user1",
            "password": "Password123!",
            "org_slug": "incomplete-slug-1",
        },
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_missing_org_slug(client):
    """Omitting org_slug in registration should fail validation with 422."""
    resp = await client.post(
        "/api/auth/register",
        json={
            "username": "incomplete_user2",
            "password": "Password123!",
            "org_name": "Incomplete Org Name",
        },
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_legacy_role_ignored(client):
    """Legacy client providing role='analyst' must be IGNORED; membership role is still 'admin'."""
    resp = await client.post(
        "/api/auth/register",
        json={
            "username": "legacy_client_user",
            "password": "Password123!",
            "role": "analyst",
            "org_name": "Legacy Corp",
            "org_slug": "legacy-corp",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["role"] == "admin"

    # Authenticate and confirm token claims
    login_resp = await client.post(
        "/api/auth/login",
        json={"username": "legacy_client_user", "password": "Password123!"},
    )
    assert login_resp.status_code == 200
    token_data = login_resp.json()
    assert token_data["role"] == "admin"
    assert isinstance(token_data["org_id"], int)


@pytest.mark.asyncio
async def test_login_multiple_memberships_returns_400(client, analyst_a, org_b):
    """Users belonging to multiple organizations should be rejected with 400 requiring org selection."""
    async with async_session() as session:
        async with session.begin():
            extra_membership = OrganizationMembership(
                user_id=analyst_a.id,
                org_id=org_b.id,
                role="analyst",
            )
            session.add(extra_membership)

    resp = await client.post(
        "/api/auth/login",
        json={"username": analyst_a.username, "password": "AnalystPass123!"},
    )
    assert resp.status_code == 400
    assert "multiple organizations" in resp.json()["detail"].lower()


# ---------- WebSocket Authentication Tests ----------

def test_websocket_authenticated_success(analyst_token):
    """Connect to WebSocket with valid token using TestClient."""
    with TestClient(app) as test_client:
        with test_client.websocket_connect(f"/ws/events?token={analyst_token}") as ws:
            data = ws.receive_json()
            assert isinstance(data, dict)


def test_websocket_missing_token():
    """WebSocket connection without token should be rejected."""
    with TestClient(app) as test_client:
        with pytest.raises(Exception):
            with test_client.websocket_connect("/ws/events"):
                pass
