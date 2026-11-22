"""
SIEM Analytics System - API Tests

Run with:
    cd backend
    python -m pytest tests/test_api.py -v

Tests cover:
  - Health check
  - User registration & login (JWT)
  - Event listing, stats, detail
  - Threat analytics endpoints
"""
import pytest
import uuid


# ═══════════════════════════════════════════
# SYSTEM ENDPOINTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_root(client):
    """GET / should return API info."""
    resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "SIEM Analytics API"
    assert data["status"] == "online"


@pytest.mark.asyncio
async def test_health(client):
    """GET /health should return healthy status."""
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "healthy"


# ═══════════════════════════════════════════
# AUTH ENDPOINTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_register_user(client):
    """POST /api/auth/register should create a new user."""
    uname = f"test_user_{uuid.uuid4().hex[:6]}"
    resp = await client.post("/api/auth/register", json={
        "username": uname,
        "password": "TestPass123",
        "org_name": f"Org {uname}",
        "org_slug": f"slug-{uname}",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["username"] == uname
    assert data["role"] == "admin"
    assert "id" in data


@pytest.mark.asyncio
async def test_register_duplicate(client):
    """POST /api/auth/register with existing username should return 409."""
    await client.post("/api/auth/register", json={
        "username": "dup_user_api",
        "password": "TestPass123",
        "org_name": "Org Dup One",
        "org_slug": "org-dup-one",
    })
    resp = await client.post("/api/auth/register", json={
        "username": "dup_user_api",
        "password": "TestPass456",
        "org_name": "Org Dup Two",
        "org_slug": "org-dup-two",
    })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    """POST /api/auth/login with correct creds should return JWT token."""
    await client.post("/api/auth/register", json={
        "username": "login_test_user",
        "password": "SecurePass123",
        "org_name": "Org Login Test",
        "org_slug": "org-login-test",
    })
    resp = await client.post("/api/auth/login", json={
        "username": "login_test_user",
        "password": "SecurePass123",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["username"] == "login_test_user"
    assert data["role"] == "admin"
    assert isinstance(data["org_id"], int)


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    """POST /api/auth/login with wrong password should return 401."""
    resp = await client.post("/api/auth/login", json={
        "username": "login_test_user",
        "password": "WrongPassword",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    """POST /api/auth/login with nonexistent user should return 401."""
    resp = await client.post("/api/auth/login", json={
        "username": "ghost_user_12345",
        "password": "anything",
    })
    assert resp.status_code == 401


# ═══════════════════════════════════════════
# EVENT ENDPOINTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_get_events(auth_client):
    """GET /api/events should return paginated response."""
    resp = await auth_client.get("/api/events")
    assert resp.status_code == 200
    data = resp.json()
    assert "events" in data
    assert "total" in data
    assert "page" in data


@pytest.mark.asyncio
async def test_get_events_with_filters(auth_client):
    """GET /api/events with severity filter should work."""
    resp = await auth_client.get("/api/events?severity=Critical&page_size=10")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data["events"], list)


@pytest.mark.asyncio
async def test_get_event_stats(auth_client):
    """GET /api/events/stats should return aggregate counts."""
    resp = await auth_client.get("/api/events/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_events" in data
    assert "critical" in data


@pytest.mark.asyncio
async def test_get_event_by_id_not_found(auth_client):
    """GET /api/events/99999 should return 404."""
    resp = await auth_client.get("/api/events/99999")
    assert resp.status_code == 404


# ═══════════════════════════════════════════
# THREAT ENDPOINTS
# ═══════════════════════════════════════════

@pytest.mark.asyncio
async def test_threats_by_severity(auth_client):
    """GET /api/threats/by-severity should return list."""
    resp = await auth_client.get("/api/threats/by-severity")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_threats_by_type(auth_client):
    """GET /api/threats/by-type should return list."""
    resp = await auth_client.get("/api/threats/by-type")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


@pytest.mark.asyncio
async def test_threats_top_ips(auth_client):
    """GET /api/threats/top-ips should return list."""
    resp = await auth_client.get("/api/threats/top-ips?limit=5")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)


@pytest.mark.asyncio
async def test_threats_timeline(auth_client):
    """GET /api/threats/timeline should return list."""
    resp = await auth_client.get("/api/threats/timeline?days=7")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
