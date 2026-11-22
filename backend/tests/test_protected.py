import pytest
import uuid
from httpx import AsyncClient

# This test suite validates authentication enforcement on protected REST endpoints
# and public registration contract.

@pytest.mark.asyncio
async def test_events_endpoint_unauthenticated(client: AsyncClient):
    """GET /api/events without a token should return 401/403 Unauthorized"""
    resp = await client.get("/api/events")
    assert resp.status_code in (401, 403)


@pytest.mark.asyncio
async def test_events_endpoint_analyst_authenticated(auth_client: AsyncClient):
    """GET /api/events with analyst token should succeed (200)"""
    resp = await auth_client.get("/api/events")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_public_registration_allowed_without_token(client: AsyncClient):
    """POST /api/auth/register is public and does not require an auth token."""
    new_user = {
        "username": f"public_user_{uuid.uuid4().hex[:6]}",
        "password": "Pass123!Secure",
        "org_name": "Public Enterprise",
        "org_slug": f"public-org-{uuid.uuid4().hex[:6]}",
    }
    resp = await client.post("/api/auth/register", json=new_user)
    assert resp.status_code == 201
    assert resp.json()["role"] == "admin"
