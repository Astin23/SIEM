"""
SIEM Analytics System - Event Routes

Endpoints:
  GET /api/events          → Paginated event list with filters
  GET /api/events/stats    → Aggregate event statistics
  GET /api/events/{id}     → Single event detail
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from datetime import datetime, timezone
import math
import logging

from app.database import get_db
from app.models import SecurityEvent
from app.schemas import SecurityEventResponse, EventListResponse, EventStatsResponse, SecurityEventCreate
from app.auth import get_current_user, require_role
from app.services.rule_engine import evaluate_event
from app.services.ml_service import predict_event
from app.services.risk_scoring import calculate_risk_score
from app.services.alert_engine import create_or_dedup_alert

router = APIRouter()
logger = logging.getLogger("siem.events")


@router.post(
    "",
    response_model=SecurityEventResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("analyst", "admin"))],
    summary="Ingest new security event",
    description="Accepts security event payload, evaluates detection rules, runs ML prediction model, calculates risk score, saves to database, and broadcasts to WebSocket clients.",
)
async def create_event(
    event_data: SecurityEventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    event_dict = event_data.model_dump()
    if not event_dict.get("timestamp"):
        event_dict["timestamp"] = datetime.now(timezone.utc)

    # 1. Rule Engine Evaluation
    triggered_rules = evaluate_event(event_dict)
    rule_triggered = None
    rule_severity = None
    rule_recommendation = None
    if triggered_rules:
        rule_triggered = ", ".join([r["name"] for r in triggered_rules])
        sevs = [r.get("severity", "Low") for r in triggered_rules]
        if "Critical" in sevs:
            rule_severity = "Critical"
        elif "High" in sevs:
            rule_severity = "High"
        elif "Medium" in sevs:
            rule_severity = "Medium"
        else:
            rule_severity = "Low"
        rule_recommendation = f"Investigate triggered rules: {rule_triggered}"

    # 2. ML Prediction
    ml_result = predict_event(event_dict)
    ml_pred = ml_result.get("prediction", "normal")
    ml_conf = ml_result.get("confidence", 0.5)

    # 3. Composite Risk Score Calculation
    calculated_risk = calculate_risk_score(
        event_dict,
        ml_prediction=ml_pred,
        ml_confidence=ml_conf,
    )

    # 4. Construct SecurityEvent ORM Instance
    new_event = SecurityEvent(
        org_id=current_user["org_id"],
        timestamp=event_dict["timestamp"],
        source_ip=event_dict["source_ip"],
        destination_ip=event_dict.get("destination_ip"),
        username=event_dict.get("username"),
        event_type=event_dict["event_type"],
        login_status=event_dict.get("login_status"),
        failed_attempts=event_dict.get("failed_attempts", 0),
        destination_port=event_dict.get("destination_port"),
        protocol=event_dict.get("protocol"),
        bytes_transferred=event_dict.get("bytes_transferred", 0),
        device_type=event_dict.get("device_type"),
        country=event_dict.get("country"),
        alert_type=event_dict.get("alert_type"),
        severity=event_dict.get("severity") or rule_severity or "Low",
        label=event_dict.get("label") or ("Malicious" if ml_pred == "malicious" else "Normal"),
        risk_score=calculated_risk,
        ml_prediction=ml_pred,
        ml_confidence=ml_conf,
        rule_triggered=rule_triggered,
        recommendation=rule_recommendation,
        escalation=bool(calculated_risk >= 70.0),
    )

    try:
        db.add(new_event)
        await db.commit()
        await db.refresh(new_event)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest security event: {str(e)}",
        )

    response_payload = SecurityEventResponse.model_validate(new_event)

    # 4.5 Auto-generate Alert if Severity is High or Critical (Legacy Logic)
    if new_event.severity in ["High", "Critical"]:
        try:
            alert_title = f"{new_event.label or new_event.event_type} detected"
            await create_or_dedup_alert(
                session=db,
                org_id=new_event.org_id,
                title=alert_title,
                description=f"Auto-generated alert from event #{new_event.id}: {new_event.recommendation or ''}",
                severity=new_event.severity,
                priority="P1" if new_event.severity == "Critical" else "P2",
                source="rule",
                event_id=new_event.id,
                source_ip=new_event.source_ip,
                destination_ip=new_event.destination_ip,
            )
            await db.commit()
            # We don't necessarily need to broadcast the alert here because the frontend might fetch it,
            # but we can optionally broadcast "NEW_ALERT". Let's broadcast the event for now.
        except Exception as alert_err:
            logger.error(f"Failed to auto-generate alert: {alert_err}")
            await db.rollback()

    # 4.6 Evaluate Dynamic Detection Rules (Phase 2)
    try:
        from app.services.rule_execution_engine import execute_rules_for_event
        await execute_rules_for_event(session=db, event=new_event)
    except Exception as exec_err:
        logger.error(f"Detection Rule Execution Engine failed: {exec_err}")
        # Not rolling back the event creation since the engine handles its own commits/rollbacks internally
        # but preventing an engine failure from killing the pipeline.

    # 5. Broadcast to connected WebSocket clients after DB commit succeeds
    try:
        from app.routes.websocket import broadcast_event
        await broadcast_event(response_payload.model_dump(mode="json"), org_id=current_user["org_id"])
    except Exception as broadcast_err:
        logger.error(f"Failed to broadcast ingested event over WebSocket: {broadcast_err}")

    return response_payload




@router.get(
    "",
    response_model=EventListResponse,
    dependencies=[Depends(require_role("analyst", "manager", "admin"))],
    summary="List security events",
    description="Returns paginated security events with optional filters for severity, event type, source IP, label, and date range.",
)
async def get_events(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
    severity: Optional[str] = Query(None, description="Filter by severity: Low, Medium, High, Critical"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    source_ip: Optional[str] = Query(None, description="Filter by source IP"),
    label: Optional[str] = Query(None, description="Filter by label (e.g. Brute Force, Port Scan)"),
    date_from: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    date_to: Optional[str] = Query(None, description="End date (ISO 8601)"),
    search: Optional[str] = Query(None, description="Search across username, source_ip, event_type"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Build filter conditions
    conditions = [SecurityEvent.org_id == current_user["org_id"]]

    if severity:
        conditions.append(SecurityEvent.severity == severity)
    if event_type:
        conditions.append(SecurityEvent.event_type == event_type)
    if source_ip:
        conditions.append(SecurityEvent.source_ip == source_ip)
    if label:
        conditions.append(SecurityEvent.label == label)
    if date_from:
        try:
            dt_from = datetime.fromisoformat(date_from)
            conditions.append(SecurityEvent.timestamp >= dt_from)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_from format. Use ISO 8601.")
    if date_to:
        try:
            dt_to = datetime.fromisoformat(date_to)
            conditions.append(SecurityEvent.timestamp <= dt_to)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_to format. Use ISO 8601.")
    if search:
        search_pattern = f"%{search}%"
        conditions.append(
            (SecurityEvent.username.ilike(search_pattern))
            | (SecurityEvent.source_ip.ilike(search_pattern))
            | (SecurityEvent.event_type.ilike(search_pattern))
        )

    # Count total matching records
    count_query = select(func.count(SecurityEvent.id))
    if conditions:
        count_query = count_query.where(and_(*conditions))
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Calculate pagination
    total_pages = max(1, math.ceil(total / page_size))
    offset = (page - 1) * page_size

    # Fetch events
    query = (
        select(SecurityEvent)
        .order_by(SecurityEvent.timestamp.desc())
        .offset(offset)
        .limit(page_size)
    )
    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(query)
    events = result.scalars().all()

    return EventListResponse(
        events=[SecurityEventResponse.model_validate(e) for e in events],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get(
    "/stats",
    response_model=EventStatsResponse,
    dependencies=[Depends(require_role("analyst", "manager", "admin"))],
    summary="Event aggregate statistics",
    description="Returns total event count, breakdown by severity, malicious count, and unique source IPs.",
)
async def get_event_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    org_filter = SecurityEvent.org_id == current_user["org_id"]

    # Total events
    total_result = await db.execute(select(func.count(SecurityEvent.id)).where(org_filter))
    total_events = total_result.scalar() or 0

    # Count by severity
    severity_counts = {}
    for sev in ["Critical", "High", "Medium", "Low"]:
        result = await db.execute(
            select(func.count(SecurityEvent.id)).where(
                and_(SecurityEvent.severity == sev, org_filter)
            )
        )
        severity_counts[sev.lower()] = result.scalar() or 0

    # Malicious count (ML prediction)
    mal_result = await db.execute(
        select(func.count(SecurityEvent.id)).where(
            and_(SecurityEvent.ml_prediction == "malicious", org_filter)
        )
    )
    malicious_count = mal_result.scalar() or 0

    # Unique source IPs
    ip_result = await db.execute(
        select(func.count(func.distinct(SecurityEvent.source_ip))).where(org_filter)
    )
    unique_ips = ip_result.scalar() or 0

    return EventStatsResponse(
        total_events=total_events,
        critical=severity_counts.get("critical", 0),
        high=severity_counts.get("high", 0),
        medium=severity_counts.get("medium", 0),
        low=severity_counts.get("low", 0),
        malicious_count=malicious_count,
        unique_source_ips=unique_ips,
    )


@router.get(
    "/{event_id}",
    response_model=SecurityEventResponse,
    dependencies=[Depends(require_role("analyst", "manager", "admin"))],
    summary="Get single event by ID",
    description="Returns full details of a specific security event.",
)
async def get_event_by_id(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(SecurityEvent).where(
            and_(SecurityEvent.id == event_id, SecurityEvent.org_id == current_user["org_id"])
        )
    )
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id={event_id} not found",
        )

    return SecurityEventResponse.model_validate(event)
