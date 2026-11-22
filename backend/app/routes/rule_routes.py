from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, asc, or_
from typing import Optional
from datetime import datetime, timezone

from app.database import get_db
from app.auth import require_role
from app.models.detection_rule import DetectionRule
from app.schemas.detection_rule import (
    DetectionRuleCreate, DetectionRuleUpdate, DetectionRuleResponse,
    DetectionRuleListResponse, RuleTestRequest, RuleTestResponse
)
from app.models.rule_history import RuleExecutionHistory
from app.schemas.rule_history import (
    RuleExecutionHistoryResponse, RuleExecutionHistoryListResponse, RuleExecutionStatsResponse
)
from app.utils.pagination import paginate
from sqlalchemy import func

router = APIRouter()

async def ensure_default_rules(db: AsyncSession, org_id: int):
    count_res = await db.execute(select(func.count(DetectionRule.id)).where(DetectionRule.org_id == org_id))
    if (count_res.scalar() or 0) == 0:
        default_rules = [
            DetectionRule(
                org_id=org_id,
                name=f"SSH Brute Force Detection (Org #{org_id})",
                description="Detects multiple failed SSH authentication attempts from a single source IP within a short timeframe.",
                severity="Critical",
                priority="P1",
                category="Authentication",
                enabled=True,
                conditions={"event_type": "ssh_brute_force", "failed_attempts": 5},
                mitre_tactic="Initial Access",
                mitre_technique="T1078",
                created_at=datetime.now(timezone.utc)
            ),
            DetectionRule(
                org_id=org_id,
                name=f"Port Scanning Sweep (Org #{org_id})",
                description="Flags rapid network port probes targeting consecutive destination ports on internal servers.",
                severity="High",
                priority="P2",
                category="Reconnaissance",
                enabled=True,
                conditions={"event_type": "port_scan"},
                mitre_tactic="Reconnaissance",
                mitre_technique="T1046",
                created_at=datetime.now(timezone.utc)
            ),
            DetectionRule(
                org_id=org_id,
                name=f"Data Exfiltration Burst (Org #{org_id})",
                description="Monitors unusually large outbound data transfers (>50MB) to external non-standard IP destinations.",
                severity="Critical",
                priority="P1",
                category="Data Loss Prevention",
                enabled=True,
                conditions={"event_type": "data_exfiltration", "bytes_transferred": 50000000},
                mitre_tactic="Exfiltration",
                mitre_technique="T1048",
                created_at=datetime.now(timezone.utc)
            ),
            DetectionRule(
                org_id=org_id,
                name=f"Privilege Escalation Attempt (Org #{org_id})",
                description="Detects unauthorized administrative credential escalation and sudo command misuse.",
                severity="Critical",
                priority="P1",
                category="Privilege Escalation",
                enabled=True,
                conditions={"event_type": "privilege_escalation"},
                mitre_tactic="Privilege Escalation",
                mitre_technique="T1548",
                created_at=datetime.now(timezone.utc)
            ),
            DetectionRule(
                org_id=org_id,
                name=f"High-Risk Geography Access (Org #{org_id})",
                description="Triggers an anomaly alert on authentication requests originating from sanctioned or high-risk threat nations.",
                severity="Medium",
                priority="P3",
                category="Anomaly",
                enabled=True,
                conditions={"country_in": ["RU", "CN", "IR", "KP"]},
                mitre_tactic="Initial Access",
                mitre_technique="T1078",
                created_at=datetime.now(timezone.utc)
            ),
        ]
        db.add_all(default_rules)
        try:
            await db.commit()
        except Exception as e:
            await db.rollback()


@router.get(
    "", 
    response_model=DetectionRuleListResponse,
    summary="List Detection Rules",
    description="Retrieve a paginated list of detection rules with optional filtering, searching, and sorting. Analysts, managers, and admins can view rules.",
    response_description="A paginated list of detection rules matching the specified criteria."
)
async def list_rules(
    enabled: Optional[bool] = Query(None, description="Filter by active status"),
    severity: Optional[str] = Query(None, description="Filter by severity level (Critical, High, Medium, Low, Informational)"),
    category: Optional[str] = Query(None, description="Filter by rule category (e.g., Network, Auth, Endpoint)"),
    priority: Optional[str] = Query(None, description="Filter by priority (P1 to P5)"),
    search: Optional[str] = Query(None, description="Search across rule name, description, and category"),
    sort_by: str = Query("created_at", description="Field to sort by (created_at, name, severity, priority)"),
    sort_desc: bool = Query(True, description="Sort in descending order"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    await ensure_default_rules(db, current_user["org_id"])
    query = select(DetectionRule).where(DetectionRule.org_id == current_user["org_id"])
    
    # Filtering
    if enabled is not None:
        query = query.where(DetectionRule.enabled == enabled)
    if severity:
        query = query.where(DetectionRule.severity == severity)
    if category:
        query = query.where(DetectionRule.category == category)
    if priority:
        query = query.where(DetectionRule.priority == priority)
        
    # Enhanced Search
    if search:
        search_term = f"%{search}%"
        query = query.where(
            or_(
                DetectionRule.name.ilike(search_term),
                DetectionRule.description.ilike(search_term),
                DetectionRule.category.ilike(search_term)
            )
        )
        
    # Sorting
    sort_column = getattr(DetectionRule, sort_by, DetectionRule.created_at)
    if sort_desc:
        query = query.order_by(desc(sort_column))
    else:
        query = query.order_by(asc(sort_column))
        
    items, total, total_pages = await paginate(db, query, page, page_size)
    
    return DetectionRuleListResponse(
        rules=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get(
    "/history",
    response_model=RuleExecutionHistoryListResponse,
    summary="Get Global Rule Execution History",
    description="Retrieve execution history across all detection rules with filtering and pagination."
)
async def list_global_history(
    rule_id: Optional[int] = Query(None, description="Filter by a specific rule"),
    status: Optional[str] = Query(None, description="Filter by execution status (success, skipped, failed)"),
    matched: Optional[bool] = Query(None, description="Filter by matched status"),
    start_date: Optional[datetime] = Query(None, description="Filter executions after this date"),
    end_date: Optional[datetime] = Query(None, description="Filter executions before this date"),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    query = select(RuleExecutionHistory).where(RuleExecutionHistory.org_id == current_user["org_id"]).order_by(desc(RuleExecutionHistory.execution_timestamp))
    
    if rule_id:
        query = query.where(RuleExecutionHistory.rule_id == rule_id)
    if status:
        query = query.where(RuleExecutionHistory.status == status)
    if matched is not None:
        query = query.where(RuleExecutionHistory.matched == matched)
    if start_date:
        query = query.where(RuleExecutionHistory.execution_timestamp >= start_date)
    if end_date:
        query = query.where(RuleExecutionHistory.execution_timestamp <= end_date)
        
    items, total, total_pages = await paginate(db, query, page, page_size)
    
    return RuleExecutionHistoryListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get(
    "/{rule_id}/history",
    response_model=RuleExecutionHistoryListResponse,
    summary="Get Specific Rule Execution History",
    description="Retrieve execution history for a specific detection rule."
)
async def list_rule_history(
    rule_id: int,
    status: Optional[str] = Query(None),
    matched: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    query = select(RuleExecutionHistory).where(
        RuleExecutionHistory.rule_id == rule_id,
        RuleExecutionHistory.org_id == current_user["org_id"]
    ).order_by(desc(RuleExecutionHistory.execution_timestamp))
    
    if status:
        query = query.where(RuleExecutionHistory.status == status)
    if matched is not None:
        query = query.where(RuleExecutionHistory.matched == matched)
        
    items, total, total_pages = await paginate(db, query, page, page_size)
    
    return RuleExecutionHistoryListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get(
    "/{rule_id}/stats",
    response_model=RuleExecutionStatsResponse,
    summary="Get Rule Execution Statistics",
    description="Retrieve execution statistics and analytics for a specific detection rule."
)
async def get_rule_stats(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    # Ensure rule exists
    rule = await db.scalar(
        select(DetectionRule).where(
            DetectionRule.id == rule_id,
            DetectionRule.org_id == current_user["org_id"]
        )
    )
    if not rule:
        raise HTTPException(status_code=404, detail="Detection rule not found")

    # Aggregate stats
    stats_query = select(
        func.count(RuleExecutionHistory.id).label("total_executions"),
        func.sum(func.cast(RuleExecutionHistory.matched, Integer)).label("total_matches"),
        func.avg(RuleExecutionHistory.execution_time_ms).label("avg_time"),
        func.sum(func.cast(RuleExecutionHistory.status == 'failed', Integer)).label("total_failed"),
        func.sum(func.cast(RuleExecutionHistory.status == 'skipped', Integer)).label("total_skipped"),
        func.max(RuleExecutionHistory.execution_timestamp).label("last_exec")
    ).where(RuleExecutionHistory.rule_id == rule_id)
    
    result = await db.execute(stats_query)
    row = result.first()
    
    total_exec = row.total_executions or 0
    total_match = int(row.total_matches or 0)
    avg_time = float(row.avg_time or 0.0)
    failed = int(row.total_failed or 0)
    skipped = int(row.total_skipped or 0)
    
    match_rate = (total_match / total_exec) if total_exec > 0 else 0.0
    
    return RuleExecutionStatsResponse(
        rule_id=rule_id,
        total_executions=total_exec,
        total_matches=total_match,
        match_rate=match_rate,
        average_execution_time_ms=avg_time,
        failed_executions=failed,
        skipped_executions=skipped,
        last_execution=row.last_exec
    )

@router.get(
    "/{rule_id}", 
    response_model=DetectionRuleResponse,
    summary="Get Detection Rule",
    description="Retrieve a specific detection rule by its unique ID. Analysts, managers, and admins can view rules.",
    response_description="The details of the requested detection rule."
)
async def get_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    rule = await db.scalar(
        select(DetectionRule).where(
            DetectionRule.id == rule_id,
            DetectionRule.org_id == current_user["org_id"]
        )
    )
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection rule not found"
        )
    return rule

@router.post(
    "/test", 
    response_model=RuleTestResponse,
    summary="Simulate Detection Rule",
    description="Test a detection rule's JSON logic against a mock SecurityEvent payload. Returns evaluation trace without persisting any data or alerts. Only administrators can test rules.",
    response_description="A trace of the rule's execution against the event."
)
async def test_rule(
    test_req: RuleTestRequest,
    current_user: dict = Depends(require_role("admin"))
):
    from app.services.rule_testing_engine import simulate_rule
    result = simulate_rule(test_req.rule_logic, test_req.event_payload)
    return RuleTestResponse(**result)

@router.post(
    "",  
    response_model=DetectionRuleResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Create Detection Rule",
    description="Create a new detection rule. Only administrators can create rules.",
    response_description="The newly created detection rule."
)
async def create_rule(
    rule_in: DetectionRuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    # Check for duplicate name in org
    existing = await db.scalar(
        select(DetectionRule).where(
            DetectionRule.name == rule_in.name,
            DetectionRule.org_id == current_user["org_id"]
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A detection rule with this name already exists"
        )
        
    rule = DetectionRule(
        org_id=current_user["org_id"],
        **rule_in.model_dump(),
        created_by=current_user["user_id"]
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)
    return rule

@router.put(
    "/{rule_id}", 
    response_model=DetectionRuleResponse,
    summary="Update Detection Rule",
    description="Update an existing detection rule. Only administrators can update rules.",
    response_description="The updated detection rule."
)
async def update_rule(
    rule_id: int,
    rule_update: DetectionRuleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    rule = await db.scalar(
        select(DetectionRule).where(
            DetectionRule.id == rule_id,
            DetectionRule.org_id == current_user["org_id"]
        )
    )
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection rule not found"
        )
        
    update_data = rule_update.model_dump(exclude_unset=True)
    
    # If name is being changed, check for duplicates
    if "name" in update_data and update_data["name"] != rule.name:
        existing = await db.scalar(
            select(DetectionRule).where(
                DetectionRule.name == update_data["name"],
                DetectionRule.org_id == current_user["org_id"]
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A detection rule with this name already exists"
            )
    
    for key, value in update_data.items():
        setattr(rule, key, value)
        
    rule.updated_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(rule)
    return rule

@router.delete(
    "/{rule_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Detection Rule",
    description="Delete a detection rule permanently. Only administrators can delete rules.",
    response_description="No content upon successful deletion."
)
async def delete_rule(
    rule_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("admin"))
):
    """
    Note on Delete Strategy:
    Currently implementing a hard delete per project standards to maintain database hygiene.
    
    In future iterations, a soft delete (e.g., `is_deleted = True`) may be preferable if
    we want to preserve the audit trail for alerts that were generated by this rule.
    Currently, alerts track `rule_id` loosely as an Integer, so a hard delete will
    orphan the rule_id reference but won't cascade delete the alerts themselves.
    """
    rule = await db.scalar(
        select(DetectionRule).where(
            DetectionRule.id == rule_id,
            DetectionRule.org_id == current_user["org_id"]
        )
    )
    if not rule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection rule not found"
        )
        
    await db.delete(rule)
    await db.commit()
    return None
