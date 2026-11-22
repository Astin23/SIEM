"""
SIEM Analytics System - Compliance Routes

Endpoints:
  GET /api/compliance/violations  → List compliance violations
  GET /api/compliance/summary     → Summary statistics by status & policy
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional

from app.database import get_db
from app.models import ComplianceViolation, SecurityEvent
from app.schemas import ComplianceViolationResponse, ComplianceSummaryResponse, ComplianceStatusUpdate
from app.services.compliance import evaluate_compliance
from app.auth import get_current_user, require_role

router = APIRouter()



@router.get(
    "/violations",
    response_model=List[ComplianceViolationResponse],
    dependencies=[Depends(require_role("analyst", "manager", "admin"))],
    summary="List compliance violations",
    description="Returns recorded regulatory compliance policy breaches.",
)
async def get_compliance_violations(
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status: open, investigating, resolved"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    query = select(ComplianceViolation).where(ComplianceViolation.org_id == current_user["org_id"]).order_by(ComplianceViolation.timestamp.desc())
    if status_filter:
        query = query.where(ComplianceViolation.status == status_filter.lower())

    query = query.limit(limit)
    result = await db.execute(query)
    violations = result.scalars().all()

    return [ComplianceViolationResponse.model_validate(v) for v in violations]


@router.get(
    "/summary",
    response_model=ComplianceSummaryResponse,
    dependencies=[Depends(require_role("analyst", "manager", "admin"))],
    summary="Get compliance summary statistics",
    description="Returns aggregate counts of open, investigating, and resolved compliance violations.",
)
async def get_compliance_summary(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    org_filter = ComplianceViolation.org_id == current_user["org_id"]

    total_res = await db.execute(select(func.count(ComplianceViolation.id)).where(org_filter))
    total = total_res.scalar() or 0

    open_res = await db.execute(
        select(func.count(ComplianceViolation.id)).where(
            ComplianceViolation.status == "open", org_filter
        )
    )
    open_cnt = open_res.scalar() or 0

    inv_res = await db.execute(
        select(func.count(ComplianceViolation.id)).where(
            ComplianceViolation.status == "investigating", org_filter
        )
    )
    inv_cnt = inv_res.scalar() or 0

    res_cnt = total - (open_cnt + inv_cnt)

    # Group by violation type
    type_res = await db.execute(
        select(ComplianceViolation.violation_type, func.count(ComplianceViolation.id))
        .where(org_filter)
        .group_by(ComplianceViolation.violation_type)
    )
    by_type = dict(type_res.all())

    return ComplianceSummaryResponse(
        total=total,
        open=open_cnt,
        investigating=inv_cnt,
        resolved=max(0, res_cnt),
        by_type=by_type,
    )


@router.patch(
    "/violations/{violation_id}",
    response_model=ComplianceViolationResponse,
    dependencies=[Depends(require_role("manager", "admin"))],
    summary="Update compliance violation status",
    description="Updates status of a compliance violation (open, investigating, resolved).",
)
async def update_compliance_violation_status(
    violation_id: int,
    status_update: ComplianceStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    allowed = {"open", "investigating", "resolved"}
    new_status = status_update.status.lower()
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{status_update.status}'. Allowed: {', '.join(allowed)}",
        )

    result = await db.execute(
        select(ComplianceViolation).where(
            ComplianceViolation.id == violation_id,
            ComplianceViolation.org_id == current_user["org_id"]
        )
    )
    violation = result.scalar_one_or_none()

    if not violation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Compliance violation with id={violation_id} not found",
        )

    violation.status = new_status
    try:
        await db.commit()
        await db.refresh(violation)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update compliance violation status: {str(e)}",
        )

    return ComplianceViolationResponse.model_validate(violation)


@router.post(
    "/evaluate",
    response_model=List[ComplianceViolationResponse],
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_role("admin"))],
    summary="Evaluate security events for compliance breaches",
    description="Evaluates recent security events against compliance policies and records detected violations.",
)
async def trigger_compliance_evaluation(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Fetch security events
    evt_res = await db.execute(
        select(SecurityEvent)
        .where(SecurityEvent.org_id == current_user["org_id"])
        .order_by(SecurityEvent.timestamp.desc())
        .limit(200)
    )
    events = evt_res.scalars().all()

    new_violations = []
    for evt in events:
        evt_dict = {
            "protocol": evt.protocol,
            "bytes_transferred": evt.bytes_transferred,
            "failed_attempts": evt.failed_attempts,
            "event_type": evt.event_type,
            "username": evt.username,
        }
        found_violations = evaluate_compliance(evt_dict)
        for v_data in found_violations:
            viol = ComplianceViolation(
                org_id=current_user["org_id"],
                timestamp=evt.timestamp,
                violation_type=v_data["violation_type"],
                username=evt.username,
                source_ip=evt.source_ip,
                description=v_data["description"],
                policy=v_data["policy"],
                severity=v_data["severity"],
                status="open",
            )
            db.add(viol)
            new_violations.append(viol)

    try:
        await db.commit()
        for v in new_violations:
            await db.refresh(v)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save compliance violations: {str(e)}",
        )

    return [ComplianceViolationResponse.model_validate(v) for v in new_violations]

