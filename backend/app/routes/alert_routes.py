from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, or_
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.auth import get_current_user, require_role
from app.models.alert import Alert, AlertComment, AlertHistory
from app.models import User
from app.schemas.alert import (
    AlertCreate, AlertUpdate, AlertAssign, AlertResponse,
    AlertDetailResponse, AlertListResponse, AlertStatsResponse,
    AlertCommentCreate, AlertCommentResponse, AlertHistoryResponse
)
from app.services.alert_engine import (
    create_or_dedup_alert, change_alert_status, assign_alert, add_alert_comment, get_alert
)
from app.utils.pagination import paginate
# Using websocket for broadcasting real-time updates
from app.routes.websocket import broadcast_event

router = APIRouter()

@router.get("", response_model=AlertListResponse)
async def list_alerts(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    assigned_to: Optional[int] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    query = select(Alert).where(Alert.org_id == current_user["org_id"]).order_by(desc(Alert.created_at))
    
    if status:
        query = query.where(Alert.status == status)
    if severity:
        query = query.where(Alert.severity == severity)
    if assigned_to:
        query = query.where(Alert.assigned_to == assigned_to)
    if search:
        query = query.where(
            or_(
                Alert.title.ilike(f"%{search}%"),
                Alert.source_ip.ilike(f"%{search}%")
            )
        )
        
    items, total, total_pages = await paginate(db, query, page, page_size)
    
    # We should populate assigned_to_username, but for simplicity, 
    # we can do it via a quick join or load. We'll do it manually here.
    user_ids = {a.assigned_to for a in items if a.assigned_to}
    users_dict = {}
    if user_ids:
        users = await db.execute(select(User).where(User.id.in_(user_ids)))
        users_dict = {u.id: u.username for u in users.scalars().all()}
        
    result_alerts = []
    for alert in items:
        alert_dict = alert.__dict__.copy()
        if alert.assigned_to in users_dict:
            alert_dict["assigned_to_username"] = users_dict[alert.assigned_to]
        result_alerts.append(AlertResponse(**alert_dict))
        
    return AlertListResponse(
        alerts=result_alerts,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )

@router.get("/stats", response_model=AlertStatsResponse)
async def get_alert_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    org_filter = Alert.org_id == current_user["org_id"]
    # Get total
    total = await db.scalar(select(func.count(Alert.id)).where(org_filter)) or 0
    
    # Get status counts
    status_query = await db.execute(select(Alert.status, func.count(Alert.id)).where(org_filter).group_by(Alert.status))
    status_counts = dict(status_query.all())
    
    # Get severity counts
    sev_query = await db.execute(select(Alert.severity, func.count(Alert.id)).where(org_filter).group_by(Alert.severity))
    sev_counts = dict(sev_query.all())
    
    return AlertStatsResponse(
        total_alerts=total,
        new=status_counts.get("new", 0),
        acknowledged=status_counts.get("acknowledged", 0),
        investigating=status_counts.get("investigating", 0),
        escalated=status_counts.get("escalated", 0),
        resolved=status_counts.get("resolved", 0),
        critical=sev_counts.get("Critical", 0),
        high=sev_counts.get("High", 0),
        medium=sev_counts.get("Medium", 0),
        low=sev_counts.get("Low", 0)
    )

@router.get("/{alert_id}", response_model=AlertDetailResponse)
async def get_alert_detail(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    # Get comments with users
    comments_query = await db.execute(
        select(AlertComment, User.username)
        .join(User, AlertComment.author_id == User.id)
        .where(AlertComment.alert_id == alert_id)
        .order_by(desc(AlertComment.created_at))
    )
    comments = []
    for c, username in comments_query.all():
        cdict = c.__dict__.copy()
        cdict["author_username"] = username
        comments.append(AlertCommentResponse(**cdict))
        
    # Get history with users (LEFT JOIN to include system-generated entries where actor_id is NULL)
    history_query = await db.execute(
        select(AlertHistory, User.username)
        .join(User, AlertHistory.actor_id == User.id, isouter=True)
        .where(AlertHistory.alert_id == alert_id)
        .order_by(desc(AlertHistory.created_at))
    )
    history = []
    for h, username in history_query.all():
        hdict = h.__dict__.copy()
        hdict["actor_username"] = username or "System"
        history.append(AlertHistoryResponse(**hdict))
        
    # Assigned user
    alert_dict = alert.__dict__.copy()
    if alert.assigned_to:
        user = await db.scalar(select(User).where(User.id == alert.assigned_to))
        if user:
            alert_dict["assigned_to_username"] = user.username
            
    alert_dict["comments"] = comments
    alert_dict["history"] = history
    return AlertDetailResponse(**alert_dict)

@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
async def create_alert(
    data: AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    alert = await create_or_dedup_alert(
        session=db,
        org_id=current_user["org_id"],
        title=data.title,
        description=data.description,
        severity=data.severity,
        priority=data.priority,
        source="manual",
        source_ip=data.source_ip,
        event_id=data.event_id,
        actor_id=current_user["user_id"]
    )
    await db.commit()
    await db.refresh(alert)
    await broadcast_event({"type": "NEW_ALERT", "data": alert.id}, org_id=current_user["org_id"])
    return alert

@router.patch("/{alert_id}", response_model=AlertResponse)
async def update_alert(
    alert_id: int,
    data: AlertUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    if data.title is not None: alert.title = data.title
    if data.description is not None: alert.description = data.description
    if data.severity is not None: alert.severity = data.severity
    if data.priority is not None: alert.priority = data.priority
    if data.status is not None:
        await change_alert_status(db, alert, data.status, current_user["user_id"], "Manual update")
        
    await db.commit()
    await db.refresh(alert)
    await broadcast_event({"type": "ALERT_UPDATED", "data": alert.id}, org_id=current_user["org_id"])
    return alert

@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    await change_alert_status(db, alert, "acknowledged", current_user["user_id"])
    await db.commit()
    await db.refresh(alert)
    await broadcast_event({"type": "ALERT_UPDATED", "data": alert.id}, org_id=current_user["org_id"])
    return alert

@router.post("/{alert_id}/assign", response_model=AlertResponse)
async def assign_alert_endpoint(
    alert_id: int,
    data: AlertAssign,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("manager", "admin")) # Analysts cannot assign
):
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    user = await db.scalar(select(User).where(User.id == data.user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    await assign_alert(db, alert, data.user_id, current_user["user_id"])
    await db.commit()
    await db.refresh(alert)
    await broadcast_event({"type": "ALERT_UPDATED", "data": alert.id}, org_id=current_user["org_id"])
    return alert

@router.post("/{alert_id}/escalate", response_model=AlertResponse)
async def escalate_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    await change_alert_status(db, alert, "escalated", current_user["user_id"])
    await db.commit()
    await db.refresh(alert)
    await broadcast_event({"type": "ALERT_UPDATED", "data": alert.id}, org_id=current_user["org_id"])
    return alert

@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    await change_alert_status(db, alert, "resolved", current_user["user_id"])
    await db.commit()
    await db.refresh(alert)
    await broadcast_event({"type": "ALERT_UPDATED", "data": alert.id}, org_id=current_user["org_id"])
    return alert

@router.post("/{alert_id}/close", response_model=AlertResponse)
async def close_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("manager", "admin"))
):
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    await change_alert_status(db, alert, "closed", current_user["user_id"])
    await db.commit()
    await db.refresh(alert)
    await broadcast_event({"type": "ALERT_UPDATED", "data": alert.id}, org_id=current_user["org_id"])
    return alert

@router.get("/{alert_id}/comments", response_model=List[AlertCommentResponse])
async def get_comments(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    # First verify alert belongs to org
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    comments_query = await db.execute(
        select(AlertComment, User.username)
        .join(User, AlertComment.author_id == User.id)
        .where(AlertComment.alert_id == alert_id)
        .order_by(desc(AlertComment.created_at))
    )
    comments = []
    for c, username in comments_query.all():
        cdict = c.__dict__.copy()
        cdict["author_username"] = username
        comments.append(AlertCommentResponse(**cdict))
    return comments

@router.post("/{alert_id}/comments", response_model=AlertCommentResponse, status_code=status.HTTP_201_CREATED)
async def create_comment(
    alert_id: int,
    data: AlertCommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    comment = await add_alert_comment(db, alert_id, current_user["user_id"], data.content)
    await db.commit()
    await db.refresh(comment)

    cdict = comment.__dict__.copy()
    cdict["author_username"] = current_user.get("sub", "unknown")

    await broadcast_event({"type": "ALERT_UPDATED", "data": alert.id}, org_id=current_user["org_id"])
    return AlertCommentResponse(**cdict)

@router.get("/{alert_id}/history", response_model=List[AlertHistoryResponse])
async def get_history(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_role("analyst", "manager", "admin"))
):
    # First verify alert belongs to org
    alert = await get_alert(db, alert_id, current_user["org_id"])
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    history_query = await db.execute(
        select(AlertHistory, User.username)
        .join(User, AlertHistory.actor_id == User.id, isouter=True)
        .where(AlertHistory.alert_id == alert_id)
        .order_by(desc(AlertHistory.created_at))
    )
    history = []
    for h, username in history_query.all():
        hdict = h.__dict__.copy()
        hdict["actor_username"] = username or "System"
        history.append(AlertHistoryResponse(**hdict))
    return history
