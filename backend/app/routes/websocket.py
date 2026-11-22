"""
SIEM Analytics System - WebSocket Event Stream

Endpoint:
  WS /ws/events  → Streams security events to connected clients in real-time

How it works:
  1. Client connects via WebSocket
  2. Server sends a new event every 2-4 seconds from the database
  3. If no events in DB, it generates a synthetic event on-the-fly
  4. Multiple clients can connect simultaneously

Frontend usage:
  const ws = new WebSocket("ws://localhost:8000/ws/events");
  ws.onmessage = (e) => { const event = JSON.parse(e.data); ... };
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select, func
import asyncio
import json
import random
import logging
from datetime import datetime, timezone

from app.database import async_session
from app.models import SecurityEvent
from app.auth import decode_access_token

router = APIRouter()
logger = logging.getLogger("siem.websocket")

# Track all connected WebSocket clients: mapping of WebSocket -> org_id
connected_clients: dict[WebSocket, int] = {}


def generate_live_event() -> dict:
    """Generate a synthetic security event for real-time streaming when DB is empty."""
    event_types = [
        "login_failure", "login_success", "file_access", "network_connection",
        "system_alert", "privilege_change", "data_transfer",
    ]
    severities = ["Low", "Medium", "High", "Critical"]
    severity_weights = [0.40, 0.30, 0.20, 0.10]
    labels = [
        "Normal", "Brute Force", "Port Scan", "Malware",
        "Data Exfiltration", "Suspicious Login", "Privilege Escalation",
    ]
    protocols = ["TCP", "UDP", "SSH", "HTTP", "HTTPS", "DNS", "SMB", "RDP"]
    usernames = [
        "john.doe", "sarah.chen", "mike.wilson", "admin", "root",
        "svc_backup", "alex.kumar", "lisa.park", "devops_bot", "db_admin",
    ]
    countries = ["US", "CN", "RU", "DE", "BR", "IN", "GB", "KR", "JP", "AU"]

    severity = random.choices(severities, weights=severity_weights, k=1)[0]
    risk_score = {
        "Low": random.uniform(5, 29),
        "Medium": random.uniform(30, 59),
        "High": random.uniform(60, 79),
        "Critical": random.uniform(80, 100),
    }[severity]

    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source_ip": f"{random.choice([10, 172, 192])}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
        "destination_ip": f"192.168.{random.randint(1,10)}.{random.randint(1,254)}",
        "username": random.choice(usernames),
        "event_type": random.choice(event_types),
        "severity": severity,
        "label": random.choice(labels),
        "risk_score": round(risk_score, 1),
        "protocol": random.choice(protocols),
        "destination_port": random.choice([22, 80, 443, 3389, 445, 53, 8080, 3306, 5432]),
        "bytes_transferred": random.randint(64, 5_000_000),
        "country": random.choice(countries),
        "ml_prediction": "malicious" if risk_score > 50 else "normal",
        "ml_confidence": round(random.uniform(0.6, 0.99), 3),
    }


async def get_random_db_event(org_id: int) -> dict | None:
    """Fetch a random event from the database for streaming, filtered by org_id."""
    try:
        async with async_session() as session:
            count_result = await session.execute(
                select(func.count(SecurityEvent.id))
                .where(SecurityEvent.org_id == org_id)
            )
            total = count_result.scalar() or 0

            if total == 0:
                return None

            offset = random.randint(0, total - 1)
            result = await session.execute(
                select(SecurityEvent)
                .where(SecurityEvent.org_id == org_id)
                .offset(offset).limit(1)
            )
            event = result.scalar_one_or_none()

            if not event:
                return None

            return {
                "id": event.id,
                "timestamp": event.timestamp.isoformat() if event.timestamp else datetime.now(timezone.utc).isoformat(),
                "source_ip": event.source_ip,
                "destination_ip": event.destination_ip,
                "username": event.username,
                "event_type": event.event_type,
                "severity": event.severity,
                "label": event.label,
                "risk_score": event.risk_score,
                "protocol": event.protocol,
                "destination_port": event.destination_port,
                "bytes_transferred": event.bytes_transferred,
                "country": event.country,
                "ml_prediction": event.ml_prediction,
                "ml_confidence": event.ml_confidence,
            }
    except Exception as e:
        logger.warning(f"DB event fetch failed, using synthetic: {e}")
        return None


@router.websocket("/events")
async def websocket_event_stream(websocket: WebSocket):
    """
    WebSocket endpoint that streams security events to authenticated clients.
    Authenticates JWT token before accepting the connection.
    Sends one event every 2-4 seconds.
    """
    # 1. Extract token from query param or Authorization header
    token = websocket.query_params.get("token")
    if not token:
        auth_header = websocket.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    # 2. Reject if token missing
    if not token:
        logger.warning("WebSocket connection rejected: Missing authentication token")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing authentication token")
        return

    # 3. Validate JWT token using app.auth.decode_access_token
    try:
        payload = decode_access_token(token)
        username = payload.get("sub")
        org_id = payload.get("org_id")
        if not username:
            raise HTTPException(status_code=401, detail="Token payload missing 'sub' claim")
        if org_id is None:
            raise HTTPException(status_code=401, detail="Token payload missing 'org_id' claim")
    except HTTPException as exc:
        logger.warning(f"WebSocket connection rejected: {exc.detail}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason=str(exc.detail))
        return
    except Exception as err:
        logger.warning(f"WebSocket connection rejected: {err}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid authentication token")
        return

    # 4. Accept connection after successful authentication
    await websocket.accept()
    connected_clients[websocket] = org_id
    client_id = id(websocket)
    logger.info(f"WebSocket client authenticated & connected: {username} ({client_id}, org: {org_id}, total: {len(connected_clients)})")

    try:
        while True:
            event_data = await get_random_db_event(org_id)
            if event_data is None:
                event_data = generate_live_event()

            await websocket.send_text(json.dumps(event_data))
            await asyncio.sleep(random.uniform(2.0, 4.0))

    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected: {username} ({client_id})")
    except Exception as e:
        logger.error(f"WebSocket error for client {username} ({client_id}): {e}")
    finally:
        if websocket in connected_clients:
            del connected_clients[websocket]
        logger.info(f"Active WebSocket clients: {len(connected_clients)}")


async def broadcast_event(event_data: dict, org_id: int = None):
    """
    Broadcast an event to all connected WebSocket clients matching the org_id.
    Call this when a new event is inserted into the database.
    """
    if not connected_clients:
        return

    message = json.dumps(event_data)
    disconnected = []

    for client, client_org in connected_clients.items():
        if org_id is not None and client_org != org_id:
            continue
        try:
            await client.send_text(message)
        except Exception:
            disconnected.append(client)

    for client in disconnected:
        if client in connected_clients:
            del connected_clients[client]
