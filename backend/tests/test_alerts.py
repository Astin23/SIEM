import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_alerts(auth_client: AsyncClient):
    response = await auth_client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data
    assert "total" in data

@pytest.mark.asyncio
async def test_create_alert(auth_client: AsyncClient):
    payload = {
        "title": "Test Alert",
        "description": "This is a test alert",
        "severity": "High",
        "priority": "P2"
    }
    response = await auth_client.post("/api/alerts", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["severity"] == payload["severity"]
    assert data["status"] == "new"

@pytest.mark.asyncio
async def test_update_alert_status(auth_client: AsyncClient):
    # Setup
    payload = {"title": "Update Me", "severity": "Medium", "priority": "P3"}
    resp = await auth_client.post("/api/alerts", json=payload)
    alert_id = resp.json()["id"]

    # Test update from "new" -> "acknowledged" (valid transition)
    update_resp = await auth_client.patch(f"/api/alerts/{alert_id}", json={"status": "acknowledged"})
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "acknowledged"

@pytest.mark.asyncio
async def test_add_comment(auth_client: AsyncClient):
    # Setup
    payload = {"title": "Comment Me", "severity": "Low", "priority": "P4"}
    resp = await auth_client.post("/api/alerts", json=payload)
    alert_id = resp.json()["id"]

    # Add comment
    comment_payload = {"content": "Test comment content"}
    c_resp = await auth_client.post(f"/api/alerts/{alert_id}/comments", json=comment_payload)
    assert c_resp.status_code == 201
    assert c_resp.json()["content"] == comment_payload["content"]

    # Verify comment in detail
    detail_resp = await auth_client.get(f"/api/alerts/{alert_id}")
    assert detail_resp.status_code == 200
    comments = detail_resp.json().get("comments", [])
    assert len(comments) > 0
    assert comments[0]["content"] == comment_payload["content"]

@pytest.mark.asyncio
async def test_alert_history_logged(auth_client: AsyncClient):
    # Setup
    payload = {"title": "History Check", "severity": "Medium", "priority": "P3"}
    resp = await auth_client.post("/api/alerts", json=payload)
    alert_id = resp.json()["id"]

    # Valid transition: new -> acknowledged
    update_resp = await auth_client.patch(f"/api/alerts/{alert_id}", json={"status": "acknowledged"})
    assert update_resp.status_code == 200

    # Check history
    hist_resp = await auth_client.get(f"/api/alerts/{alert_id}/history")
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) >= 2 # created, status_changed
    actions = [h["action"] for h in history]
    assert "created" in actions
    assert "status_changed" in actions
