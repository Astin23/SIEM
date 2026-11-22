from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Index, JSON
)
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class DetectionRule(Base):
    """Detection rules used to evaluate security events and generate alerts."""
    __tablename__ = "detection_rules"

    id = Column(Integer, primary_key=True, autoincrement=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    enabled = Column(Boolean, default=True, nullable=False, index=True)
    severity = Column(String(20), nullable=False, index=True) # Critical, High, Medium, Low, Informational
    priority = Column(String(5), default="P3", index=True)
    category = Column(String(50), nullable=True, index=True) # e.g., Network, Auth, Endpoint
    conditions = Column(JSON, nullable=False) # JSON logic for the rule
    
    mitre_tactic = Column(String(100), nullable=True)
    mitre_technique = Column(String(100), nullable=True)
    
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    author = relationship("User", foreign_keys=[created_by])

    __table_args__ = (
        Index("ix_detection_rules_enabled_severity", "enabled", "severity"),
        Index("ix_detection_rules_category_enabled", "category", "enabled"),
    )

    def __repr__(self):
        return f"<DetectionRule(id={self.id}, name='{self.name}', enabled={self.enabled})>"
