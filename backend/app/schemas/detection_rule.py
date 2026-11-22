from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime

class DetectionRuleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    enabled: bool = True
    severity: Literal["Critical", "High", "Medium", "Low", "Informational"] = Field(
        ..., description="Standard SIEM severity level"
    )
    priority: Literal["P1", "P2", "P3", "P4", "P5"] = Field(
        "P3", description="P1 (highest) to P5 (lowest)"
    )
    category: Optional[str] = None
    conditions: Dict[str, Any] = Field(
        ..., 
        description="JSON logic for the rule. Should contain at least a 'type' and 'parameters'."
    )
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None

class DetectionRuleUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    enabled: Optional[bool] = None
    severity: Optional[Literal["Critical", "High", "Medium", "Low", "Informational"]] = None
    priority: Optional[Literal["P1", "P2", "P3", "P4", "P5"]] = None
    category: Optional[str] = None
    conditions: Optional[Dict[str, Any]] = Field(
        None,
        description="JSON logic for the rule. Should contain at least a 'type' and 'parameters'."
    )
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None

class DetectionRuleResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    enabled: bool
    severity: Literal["Critical", "High", "Medium", "Low", "Informational"]
    priority: Literal["P1", "P2", "P3", "P4", "P5"]
    category: Optional[str] = None
    conditions: Dict[str, Any]
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class DetectionRuleListResponse(BaseModel):
    rules: List[DetectionRuleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class RuleTestRequest(BaseModel):
    rule_logic: Dict[str, Any] = Field(..., description="JSON logic for the rule")
    event_payload: Dict[str, Any] = Field(..., description="Sample SecurityEvent fields to evaluate against")

class RuleTestResponse(BaseModel):
    matched: bool
    execution_time_ms: float
    matched_conditions: List[Dict[str, Any]] = Field(default_factory=list)
    failed_conditions: List[Dict[str, Any]] = Field(default_factory=list)
    evaluation_trace: Optional[List[Dict[str, Any]]] = None
