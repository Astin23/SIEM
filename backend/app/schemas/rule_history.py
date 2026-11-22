from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RuleExecutionHistoryResponse(BaseModel):
    id: int
    rule_id: int
    event_id: int
    execution_timestamp: datetime
    execution_time_ms: float
    matched: bool
    status: str
    failure_reason: Optional[str] = None

    model_config = {"from_attributes": True}

class RuleExecutionHistoryListResponse(BaseModel):
    items: List[RuleExecutionHistoryResponse]
    total: int
    page: int
    page_size: int
    total_pages: int

class RuleExecutionStatsResponse(BaseModel):
    rule_id: int
    total_executions: int
    total_matches: int
    match_rate: float
    average_execution_time_ms: float
    failed_executions: int
    skipped_executions: int
    last_execution: Optional[datetime] = None
