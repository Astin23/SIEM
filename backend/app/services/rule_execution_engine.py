import logging
from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import SecurityEvent, DetectionRule, RuleExecutionHistory
import time
from app.services.alert_engine import create_or_dedup_alert

logger = logging.getLogger("siem.rule_execution")

# Whitelist of valid SecurityEvent fields that rules can inspect
VALID_EVENT_FIELDS = {
    "source_ip", "destination_ip", "username", "event_type", 
    "login_status", "failed_attempts", "destination_port", 
    "protocol", "bytes_transferred", "device_type", 
    "country", "alert_type", "severity", "label", 
    "risk_score", "ml_prediction", "ml_confidence"
}

def validate_condition_structure(condition: Dict[str, Any]) -> bool:
    """Check if a single leaf condition is structurally valid."""
    if not isinstance(condition, dict):
        return False
    if "field" not in condition or "operator" not in condition:
        return False
    return True

def validate_logic_structure(logic: Dict[str, Any]) -> bool:
    """Validate the rule's JSON conditions structure to prevent runtime crashes."""
    if not isinstance(logic, dict):
        return False
        
    operator = logic.get("operator", "and").lower()
    rules = logic.get("rules", [])
    
    if not rules:
        # Check if it's a flat leaf condition
        return validate_condition_structure(logic)
        
    if not isinstance(rules, list):
        return False
        
    if operator not in ["and", "or"]:
        return False
        
    # Recursively validate nested rules
    for rule in rules:
        if not validate_logic_structure(rule):
            return False
            
    return True

def evaluate_condition(event: SecurityEvent, condition: Dict[str, Any], rule_id: int) -> bool:
    """
    Evaluate a single condition leaf against an event.
    """
    field = condition.get("field")
    operator = condition.get("operator")
    expected_value = condition.get("value")

    if field not in VALID_EVENT_FIELDS:
        logger.warning(f"[Rule {rule_id}] Unsupported field '{field}' requested. Evaluation skipped.")
        return False

    actual_value = getattr(event, field, None)

    if operator == "equals":
        return actual_value == expected_value
    elif operator == "not_equals":
        return actual_value != expected_value
    elif operator == "greater_than":
        try:
            return actual_value is not None and float(actual_value) > float(expected_value)
        except (ValueError, TypeError):
            return False
    elif operator == "less_than":
        try:
            return actual_value is not None and float(actual_value) < float(expected_value)
        except (ValueError, TypeError):
            return False
    elif operator == "contains":
        if actual_value is None or expected_value is None:
            return False
        return str(expected_value).lower() in str(actual_value).lower()
    elif operator == "in":
        if not isinstance(expected_value, list):
            return False
        return actual_value in expected_value
    else:
        logger.warning(f"[Rule {rule_id}] Unsupported operator '{operator}'. Evaluation skipped.")
        return False

def evaluate_logic(event: SecurityEvent, logic: Dict[str, Any], rule_id: int) -> bool:
    """
    Recursively evaluate a logic block (AND/OR and nested rules).
    """
    operator = logic.get("operator", "and").lower()
    rules = logic.get("rules", [])

    if not rules:
        # If it's a flat condition
        if "field" in logic:
            return evaluate_condition(event, logic, rule_id)
        return False

    if operator == "and":
        for rule in rules:
            if not evaluate_logic(event, rule, rule_id):
                return False
        return True
    elif operator == "or":
        for rule in rules:
            if evaluate_logic(event, rule, rule_id):
                return True
        return False
    
    return False


async def execute_rules_for_event(session: AsyncSession, event: SecurityEvent):
    """
    Fetch all active detection rules, validate them, evaluate them against the given event,
    and generate alerts for any matching rules in a single batched database transaction.
    """
    # Fetch only enabled rules
    query = select(DetectionRule).where(DetectionRule.enabled == True)
    result = await session.execute(query)
    active_rules = result.scalars().all()

    if not active_rules:
        logger.debug(f"No active detection rules to evaluate for event #{event.id}.")
        return

    logger.info(f"Evaluating {len(active_rules)} active rules for event #{event.id}")
    
    stats = {
        "total": len(active_rules),
        "matched": 0,
        "skipped": 0,
        "failed": 0
    }
    
    alerts_generated = False

    for rule in active_rules:
        # 1. Structural Validation
        if not validate_logic_structure(rule.conditions):
            logger.warning(f"[Rule {rule.id}] Skipping malformed rule '{rule.name}'. Invalid conditions JSON.")
            stats["skipped"] += 1
            
            history_record = RuleExecutionHistory(
                rule_id=rule.id,
                event_id=event.id,
                execution_time_ms=0.0,
                matched=False,
                status="skipped",
                failure_reason="Invalid conditions JSON"
            )
            session.add(history_record)
            continue
            
        # 2. Evaluation
        start_time = time.perf_counter()
        try:
            is_match = evaluate_logic(event, rule.conditions, rule.id)
            
            if is_match:
                logger.info(f"[MATCH] Rule '{rule.name}' (ID: {rule.id}) matched event #{event.id}")
                stats["matched"] += 1
                
                # Generate an alert (this performs an internal session.flush() and log history)
                alert_title = f"Rule Match: {rule.name}"
                description = f"Event #{event.id} matched detection rule '{rule.name}'.\n\nRule Description: {rule.description or 'N/A'}"
                
                await create_or_dedup_alert(
                    session=session,
                    title=alert_title,
                    description=description,
                    severity=rule.severity,
                    priority=rule.priority,
                    source="rule",
                    rule_id=rule.id,
                    event_id=event.id,
                    source_ip=event.source_ip,
                    destination_ip=event.destination_ip
                )
                alerts_generated = True
                
            
            end_time = time.perf_counter()
            exec_ms = (end_time - start_time) * 1000
            
            history_record = RuleExecutionHistory(
                rule_id=rule.id,
                event_id=event.id,
                execution_time_ms=exec_ms,
                matched=is_match,
                status="success"
            )
            session.add(history_record)
                
        except Exception as e:
            end_time = time.perf_counter()
            exec_ms = (end_time - start_time) * 1000
            # Catch unexpected evaluation errors to prevent one bad rule from tanking the rest
            logger.error(f"[ERROR] Engine exception evaluating Rule '{rule.name}' (ID: {rule.id}) for event #{event.id}: {e}")
            stats["failed"] += 1
            
            history_record = RuleExecutionHistory(
                rule_id=rule.id,
                event_id=event.id,
                execution_time_ms=exec_ms,
                matched=False,
                status="failed",
                failure_reason=str(e)[:250]
            )
            session.add(history_record)
            # Do NOT rollback here so previous matches in this batch are preserved

    # 3. Batch Commit (Always commit to save history and alerts)
    try:
        await session.commit()
        logger.debug(f"Successfully committed alerts and history for event #{event.id}.")
    except Exception as commit_err:
        logger.error(f"Failed to commit rule evaluation batch for event #{event.id}: {commit_err}")
        await session.rollback()

    logger.info(f"Rule Engine Execution Complete for event #{event.id}: {stats['total']} evaluated, {stats['matched']} matched, {stats['skipped']} skipped, {stats['failed']} failed.")
