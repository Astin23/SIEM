from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class RuleExecutionHistory(Base):
    """Immutable audit trail for detection rule evaluations."""
    __tablename__ = "rule_execution_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    rule_id = Column(Integer, ForeignKey("detection_rules.id"), nullable=False, index=True)
    event_id = Column(Integer, ForeignKey("security_events.id"), nullable=False, index=True)
    
    execution_timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    execution_time_ms = Column(Float, nullable=False)
    
    matched = Column(Boolean, nullable=False, index=True)
    status = Column(String(20), nullable=False, index=True)  # success, skipped, failed
    failure_reason = Column(String(255), nullable=True)

    # Relationships
    rule = relationship("DetectionRule", foreign_keys=[rule_id])
    event = relationship("SecurityEvent", foreign_keys=[event_id])

    __table_args__ = (
        Index("ix_rule_history_rule_status", "rule_id", "status"),
        Index("ix_rule_history_rule_matched", "rule_id", "matched"),
    )

    def __repr__(self):
        return f"<RuleExecutionHistory(rule_id={self.rule_id}, event_id={self.event_id}, status='{self.status}')>"
