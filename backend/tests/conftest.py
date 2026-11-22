# ---------------------------------------------------------------------------
# Database setup/teardown & Multi-tenant Test Fixtures
# ---------------------------------------------------------------------------
import os
import sys
import uuid
import pytest
from httpx import AsyncClient, ASGITransport

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Configure test database to use dedicated siem_test.db
test_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "siem_test.db"))
test_sqlite_url = f"sqlite+aiosqlite:///{test_db_path}"

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
import app.database as app_db

# Override engine and async_session in app.database for testing environment
app_db.engine = create_async_engine(
    test_sqlite_url,
    echo=False,
    connect_args={"check_same_thread": False},
)
app_db.async_session = async_sessionmaker(
    app_db.engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

from app.main import app as fastapi_app
from app.database import Base
from app.models import User, Organization, OrganizationMembership
from app.auth import hash_password


def verify_test_db():
    """HARD SAFETY GUARD: Ensures destructive ops run ONLY against a test DB."""
    url_str = str(app_db.engine.url)
    if "siem_test.db" not in url_str and "memory" not in url_str and "test" not in url_str.lower():
        raise RuntimeError(
            f"SAFETY GUARD TRIGGERED: Refusing destructive operation on non-test DB URL '{url_str}'. "
            "Tests must strictly run against siem_test.db or a memory test database!"
        )
    if "siem.db" in url_str and "siem_test.db" not in url_str:
        raise RuntimeError(
            "SAFETY GUARD TRIGGERED: Main development database 'siem.db' detected! ABORTING TEST SESSION."
        )


@pytest.fixture(scope="session", autouse=True)
async def setup_db():
    verify_test_db()
    async with app_db.engine.begin() as conn:
        await conn.exec_driver_sql("PRAGMA foreign_keys = OFF;")
        await conn.run_sync(Base.metadata.create_all)
    yield
    verify_test_db()
    async with app_db.engine.begin() as conn:
        await conn.exec_driver_sql("PRAGMA foreign_keys = OFF;")
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(autouse=True)
async def reset_db():
    """Clean all tables before each test function to guarantee isolation without DDL collisions."""
    verify_test_db()
    async with app_db.engine.begin() as conn:
        await conn.exec_driver_sql("PRAGMA foreign_keys = OFF;")
        for table in reversed(Base.metadata.sorted_tables):
            await conn.execute(table.delete())
        await conn.exec_driver_sql("PRAGMA foreign_keys = ON;")
    yield


@pytest.fixture
async def client():
    """Async HTTP client for FastAPI tests (unauthenticated)."""
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ---------------------------------------------------------------------------
# Organization & User Creation Helpers
# ---------------------------------------------------------------------------
async def _create_org(name: str, slug: str) -> Organization:
    async with app_db.async_session() as session:
        async with session.begin():
            org = Organization(name=name, slug=slug, status="active")
            session.add(org)
            await session.flush()
            await session.refresh(org)
            return org


async def _create_user_in_org(username: str, password: str, role: str, org: Organization) -> User:
    async with app_db.async_session() as session:
        async with session.begin():
            user = User(
                username=username,
                password_hash=hash_password(password),
                role=role,
            )
            session.add(user)
            await session.flush()

            membership = OrganizationMembership(
                user_id=user.id,
                org_id=org.id,
                role=role,
            )
            session.add(membership)
            await session.flush()
            await session.refresh(user)
            return user


# ---------------------------------------------------------------------------
# Organization Fixtures (Org A & Org B)
# ---------------------------------------------------------------------------
@pytest.fixture
async def org_a():
    return await _create_org("Organization A", f"org-a-{uuid.uuid4().hex[:6]}")


@pytest.fixture
async def org_b():
    return await _create_org("Organization B", f"org-b-{uuid.uuid4().hex[:6]}")


# Org A Users (SAME org instance)
@pytest.fixture
async def admin_a(org_a):
    uname = f"admin_a_{uuid.uuid4().hex[:6]}"
    return await _create_user_in_org(uname, "AdminPass123!", "admin", org_a)


@pytest.fixture
async def analyst_a(org_a):
    uname = f"analyst_a_{uuid.uuid4().hex[:6]}"
    return await _create_user_in_org(uname, "AnalystPass123!", "analyst", org_a)


@pytest.fixture
async def manager_a(org_a):
    uname = f"manager_a_{uuid.uuid4().hex[:6]}"
    return await _create_user_in_org(uname, "ManagerPass123!", "manager", org_a)


# Org B Users (SAME org instance)
@pytest.fixture
async def admin_b(org_b):
    uname = f"admin_b_{uuid.uuid4().hex[:6]}"
    return await _create_user_in_org(uname, "AdminPass123!", "admin", org_b)


@pytest.fixture
async def analyst_b(org_b):
    uname = f"analyst_b_{uuid.uuid4().hex[:6]}"
    return await _create_user_in_org(uname, "AnalystPass123!", "analyst", org_b)


# Legacy User Fixture Aliases
@pytest.fixture
async def admin_user(admin_a):
    return admin_a


@pytest.fixture
async def analyst_user(analyst_a):
    return analyst_a


@pytest.fixture
async def manager_user(manager_a):
    return manager_a


# ---------------------------------------------------------------------------
# Tokens obtained via real /api/auth/login endpoint
# ---------------------------------------------------------------------------
@pytest.fixture
async def admin_a_token(client: AsyncClient, admin_a: User) -> str:
    resp = await client.post(
        "/api/auth/login",
        json={"username": admin_a.username, "password": "AdminPass123!"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture
async def analyst_a_token(client: AsyncClient, analyst_a: User) -> str:
    resp = await client.post(
        "/api/auth/login",
        json={"username": analyst_a.username, "password": "AnalystPass123!"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture
async def manager_a_token(client: AsyncClient, manager_a: User) -> str:
    resp = await client.post(
        "/api/auth/login",
        json={"username": manager_a.username, "password": "ManagerPass123!"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture
async def admin_b_token(client: AsyncClient, admin_b: User) -> str:
    resp = await client.post(
        "/api/auth/login",
        json={"username": admin_b.username, "password": "AdminPass123!"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


@pytest.fixture
async def analyst_b_token(client: AsyncClient, analyst_b: User) -> str:
    resp = await client.post(
        "/api/auth/login",
        json={"username": analyst_b.username, "password": "AnalystPass123!"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.text}"
    return resp.json()["access_token"]


# Legacy Token Aliases
@pytest.fixture
def admin_token(admin_a_token):
    return admin_a_token


@pytest.fixture
def analyst_token(analyst_a_token):
    return analyst_a_token


@pytest.fixture
def manager_token(manager_a_token):
    return manager_a_token


# ---------------------------------------------------------------------------
# Headers & Authenticated Client Fixtures (Independent AsyncClients)
# ---------------------------------------------------------------------------
@pytest.fixture
def auth_headers(analyst_token: str):
    return {"Authorization": f"Bearer {analyst_token}"}


@pytest.fixture
def admin_auth_headers(admin_token: str):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def manager_auth_headers(manager_token: str):
    return {"Authorization": f"Bearer {manager_token}"}


@pytest.fixture
def analyst_b_headers(analyst_b_token: str):
    return {"Authorization": f"Bearer {analyst_b_token}"}


@pytest.fixture
def admin_b_headers(admin_b_token: str):
    return {"Authorization": f"Bearer {admin_b_token}"}


@pytest.fixture
def token_headers(auth_headers: dict):
    return auth_headers


@pytest.fixture
async def auth_client(auth_headers: dict):
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=auth_headers) as ac:
        yield ac


@pytest.fixture
async def admin_auth_client(admin_auth_headers: dict):
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=admin_auth_headers) as ac:
        yield ac


@pytest.fixture
async def manager_auth_client(manager_auth_headers: dict):
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=manager_auth_headers) as ac:
        yield ac


@pytest.fixture
async def analyst_b_client(analyst_b_headers: dict):
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=analyst_b_headers) as ac:
        yield ac


@pytest.fixture
async def admin_b_client(admin_b_headers: dict):
    transport = ASGITransport(app=fastapi_app)
    async with AsyncClient(transport=transport, base_url="http://test", headers=admin_b_headers) as ac:
        yield ac
