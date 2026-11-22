from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Alert(Base):
    """Actionable alerts generated from security events or manually."""
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), nullable=False, index=True)
    priority = Column(String(5), default="P3")
    status = Column(String(20), nullable=False, default="new", index=True)
    source = Column(String(20), nullable=False, default="rule")
    
    # rule_id = Column(Integer, ForeignKey("detection_rules.id"), nullable=True) # Phase 2
    rule_id = Column(Integer, nullable=True) # Place-holder for Phase 2
    
    event_id = Column(Integer, ForeignKey("security_events.id"), nullable=True)
    source_ip = Column(String(45), nullable=True, index=True)
    destination_ip = Column(String(45), nullable=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    assigned_at = Column(DateTime, nullable=True)
    acknowledged_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    mitre_tactic = Column(String(100), nullable=True)
    mitre_technique = Column(String(100), nullable=True)
    
    dedup_key = Column(String(255), nullable=True, index=True)
    dedup_count = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    comments = relationship("AlertComment", back_populates="alert", cascade="all, delete-orphan")
    history = relationship("AlertHistory", back_populates="alert", cascade="all, delete-orphan")
    
    # Optional relationships to link back to users/events
    assignee = relationship("User", foreign_keys=[assigned_to])
    event = relationship("SecurityEvent", foreign_keys=[event_id])

    __table_args__ = (
        Index("ix_alerts_status_severity", "status", "severity"),
        Index("ix_alerts_assigned", "assigned_to", "status"),
        Index("ix_alerts_created", "created_at"),
    )

    def __repr__(self):
        return f"<Alert(id={self.id}, title='{self.title}', status='{self.status}', severity='{self.severity}')>"


class AlertComment(Base):
    """Investigation notes added by analysts to alerts."""
    __tablename__ = "alert_comments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    alert = relationship("Alert", back_populates="comments")
    author = relationship("User", foreign_keys=[author_id])

    def __repr__(self):
        return f"<AlertComment(id={self.id}, alert_id={self.alert_id})>"


class AlertHistory(Base):
    """Immutable audit trail for alert lifecycle state changes."""
    __tablename__ = "alert_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    alert_id = Column(Integer, ForeignKey("alerts.id"), nullable=False, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for system-generated actions
    action = Column(String(50), nullable=False)
    old_value = Column(String(100), nullable=True)
    new_value = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    alert = relationship("Alert", back_populates="history")
    actor = relationship("User", foreign_keys=[actor_id])

    def __repr__(self):
        return f"<AlertHistory(alert_id={self.alert_id}, action='{self.action}')>"
