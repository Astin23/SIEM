import time
from typing import Any, Dict, List, Tuple
from fastapi import HTTPException, status

from app.models import SecurityEvent
from app.services.rule_execution_engine import evaluate_condition, validate_logic_structure

def trace_logic(event: SecurityEvent, logic: Dict[str, Any]) -> Tuple[bool, List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Recursively evaluates logic and returns a trace of the execution without modifying the core execution engine.
    Returns: (is_match, matched_conditions, failed_conditions, evaluation_trace)
    """
    operator = logic.get("operator", "and").lower()
    rules = logic.get("rules", [])
    
    matched = []
    failed = []
    trace = []
    
    # Base case: Flat condition
    if not rules:
        if "field" in logic:
            # We pass rule_id=0 for testing
            is_match = evaluate_condition(event, logic, rule_id=0)
            trace.append({"condition": logic, "matched": is_match})
            if is_match:
                matched.append(logic)
            else:
                failed.append(logic)
            return is_match, matched, failed, trace
        return False, [], [], [{"error": "Empty condition"}]

    if operator == "and":
        is_and_match = True
        for rule in rules:
            r_match, r_matched, r_failed, r_trace = trace_logic(event, rule)
            matched.extend(r_matched)
            failed.extend(r_failed)
            trace.append({"operator": "and_clause", "matched": r_match, "trace": r_trace})
            if not r_match:
                is_and_match = False
                # Continue tracing to collect all failed conditions for a complete picture, 
                # even though short-circuiting would normally happen here in execution.
        return is_and_match, matched, failed, trace

    elif operator == "or":
        is_or_match = False
        for rule in rules:
            r_match, r_matched, r_failed, r_trace = trace_logic(event, rule)
            matched.extend(r_matched)
            failed.extend(r_failed)
            trace.append({"operator": "or_clause", "matched": r_match, "trace": r_trace})
            if r_match:
                is_or_match = True
                # Continue tracing to provide comprehensive feedback
        return is_or_match, matched, failed, trace

    trace.append({"error": f"Unsupported logical operator: {operator}"})
    return False, matched, failed, trace


def simulate_rule(rule_logic: Dict[str, Any], event_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Test a detection rule against a mock event payload without database persistence.
    """
    start_time = time.perf_counter()

    if not validate_logic_structure(rule_logic):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Malformed rule JSON. Must contain valid operator and rules, or field and operator."
        )

    # Create an ephemeral SecurityEvent object (not tied to a database session)
    try:
        # Strip fields that shouldn't be overridden or are irrelevant to the logic
        safe_payload = {k: v for k, v in event_payload.items() if hasattr(SecurityEvent, k)}
        mock_event = SecurityEvent(**safe_payload)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse event payload: {str(e)}"
        )

    is_match, matched_conds, failed_conds, trace = trace_logic(mock_event, rule_logic)

    end_time = time.perf_counter()
    execution_time_ms = (end_time - start_time) * 1000

    return {
        "matched": is_match,
        "execution_time_ms": execution_time_ms,
        "matched_conditions": matched_conds,
        "failed_conditions": failed_conds,
        "evaluation_trace": trace
    }
