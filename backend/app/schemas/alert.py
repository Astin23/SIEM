from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class AlertCommentCreate(BaseModel):
    content: str = Field(..., min_length=1)

class AlertCommentResponse(BaseModel):
    id: int
    alert_id: int
    author_id: int
    author_username: Optional[str] = None
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertHistoryResponse(BaseModel):
    id: int
    alert_id: int
    actor_id: Optional[int] = None
    actor_username: Optional[str] = None
    action: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    severity: str = Field(..., description="Critical, High, Medium, Low, Informational")
    priority: str = Field("P3", description="P1 to P5")
    source_ip: Optional[str] = None
    event_id: Optional[int] = None

class AlertAssign(BaseModel):
    user_id: int

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class AlertResponse(BaseModel):
    id: int
    org_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    severity: str
    priority: str
    status: str
    source: str
    rule_id: Optional[int] = None
    event_id: Optional[int] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    assigned_to: Optional[int] = None
    assigned_to_username: Optional[str] = None
    
    assigned_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    
    dedup_key: Optional[str] = None
    dedup_count: int = 1
    
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class AlertDetailResponse(AlertResponse):
    comments: List[AlertCommentResponse] = Field(default_factory=list)
    history: List[AlertHistoryResponse] = Field(default_factory=list)

class AlertListResponse(BaseModel):
    alerts: List[AlertResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class AlertStatsResponse(BaseModel):
    total_alerts: int
    new: int
    acknowledged: int
    investigating: int
    escalated: int
    resolved: int
    critical: int
    high: int
    medium: int
    low: int
