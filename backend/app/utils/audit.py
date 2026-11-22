from sqlalchemy.ext.asyncio import AsyncSession
from app.models.alert import AlertHistory
from typing import Optional

def log_alert_action(
    session: AsyncSession,
    alert_id: int,
    actor_id: Optional[int],
    action: str,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    details: Optional[str] = None,
):
    """
    Log an action in the alert history audit trail.
    Note: The session.add() is called, but session.commit() should be handled by the caller.
    """
    history_entry = AlertHistory(
        alert_id=alert_id,
        actor_id=actor_id,
        action=action,
        old_value=old_value,
        new_value=new_value,
        details=details
    )
    session.add(history_entry)
    return history_entry
