#!/usr/bin/env python3
"""
simulate_call.py — Afterhours Call Simulator (clean demo mode)

Goal:
- Produce a realistic "after-hours receptionist" transcript
- Output a clean owner summary even if collected fields are raw
- Save a JSON session to voice_agent/out/
"""

import argparse
import json
import os
import re
from datetime import datetime
from typing import Dict, Any, List

from voice_agent.call_flows import CallType, CallState, get_flow_for_call_type
from voice_agent.state_machine import VoiceAgentStateMachine


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


def ensure_out_dir() -> str:
    out_dir = os.path.join(os.path.dirname(__file__), "out")
    os.makedirs(out_dir, exist_ok=True)
    return out_dir


def scenario_script(scenario: str) -> List[str]:
    """
    IMPORTANT:
    This script is tuned to match MissedCallFlow's data collection order:
    1) city + issue
    2) urgency
    3) callback window + text ok
    4) name
    """
    scenario = scenario.lower().strip()

    if scenario == "missed_call":
        return [
            "I’m in Irvine — my AC stopped and the house is getting hot.",
            "Pretty urgent. No AC tonight and we’ve got kids in the house.",
            "Tomorrow 9–11am is best. Yes, texting is fine if you can’t reach me.",
            "Jake",
        ]

    if scenario == "demo_request":
        return [
            "I saw your demo — I want this for my business.",
            "We’re a plumbing company and we miss calls after 6pm.",
            "I’m the owner. Next week works to get started. Email me the details.",
        ]

    # inbound default
    return [
        "Hi, I need a quote for a new install.",
        "It’s for a small office. I want something energy efficient.",
        "My email is jake@example.com.",
    ]


def map_scenario_to_call_type(scenario: str) -> CallType:
    scenario = scenario.lower().strip()
    if scenario == "missed_call":
        return CallType.MISSED
    if scenario == "demo_request":
        return CallType.DEMO_REQUEST
    return CallType.INBOUND


def best_city_from_text(text: str) -> str:
    if not text:
        return ""
    m = re.search(r"\b(i'm in|im in|in|at)\s+([A-Za-z]+(?:\s[A-Za-z]+)*)", text)
    if not m:
        return ""
    cand = m.group(2).strip()
    cand = re.split(r"[,.!?]", cand)[0].strip()
    # keep it short-ish
    if 2 <= len(cand) <= 30:
        return cand
    return ""


def normalize_missed_fields(data: Dict[str, Any]) -> Dict[str, str]:
    """
    Because MVP stores raw text, we normalize for a clean owner summary.
    """
    issue = str(data.get("issue") or "").strip()
    urgency = str(data.get("urgency") or "").strip()

    # callback window: some versions store it under callback_window; others store the whole response
    callback_raw = str(
        data.get("callback_window") or data.get("callback_window_raw") or ""
    ).strip()

    name = str(data.get("contact_name") or "").strip()

    # location may be blank or polluted; derive from whichever text has "in <city>"
    location = str(data.get("location") or "").strip()
    if not location or len(location) > 40:
        location = best_city_from_text(issue) or best_city_from_text(urgency) or best_city_from_text(callback_raw)

    # If issue is empty, steal from location field (some earlier versions stored it there)
    if not issue and location and len(location) > 10:
        issue = location

    # --- Parse callback window compactly ---
    lower = callback_raw.lower()
    window = ""
    if callback_raw:
        # time range like 9-11am / 9–11am / 9 to 11
        tm = re.search(r"(tomorrow\s*)?\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?", lower)
        if tm:
            window = tm.group(0).strip()
        else:
            # fallback: first sentence
            window = callback_raw.split(".")[0].strip()
    else:
        window = ""

    # --- Parse text_ok to yes/no ---
    text_ok = str(data.get("text_ok") or "").strip()
    # If text_ok is polluted (full sentence), infer from callback_raw instead
    blob = (text_ok + " " + callback_raw).lower()

    if any(x in blob for x in ["no text", "dont text", "don't text", "do not text", "no sms", "no texting", "no texts"]):
        text_ok_clean = "no"
    elif any(x in blob for x in ["texting is fine", "text is fine", "you can text", "text ok", "text okay", "sms is fine", "yes, texting", "yes texting"]):
        text_ok_clean = "yes"
    else:
        # default yes for missed-call triage
        text_ok_clean = "yes"

    return {
        "contact_name": name,
        "location": location,
        "issue": issue,
        "urgency": urgency,
        "callback_window": window or callback_raw,
        "text_ok": text_ok_clean,
    }


def build_owner_summary(call_type: CallType, call_id: str, caller_phone: str, result: Dict[str, Any]) -> str:
    data = result.get("data_collected", {}) or {}
    intent = result.get("intent", "unknown")
    state = result.get("state", "unknown")

    if call_type == CallType.MISSED:
        norm = normalize_missed_fields(data)
        name = norm["contact_name"] or "(unknown)"
        location = norm["location"] or "(unknown)"
        issue = norm["issue"] or "(unknown)"
        urgency = norm["urgency"] or "(unknown)"
        window = norm["callback_window"] or "(unknown)"
        text_ok = norm["text_ok"] or "yes"

        lines = [
            f"[Afterhours] Missed call summary — {call_id}",
            f"Caller: {name}   Phone: {caller_phone}",
            f"Location: {location}",
            f"Issue: {issue}",
            f"Urgency: {urgency}",
            f"Callback window: {window}   Text OK: {text_ok}",
            f"Intent: {intent}   State: {state}",
            "Recommended next step: Call back in the window; confirm address; assign if needed; share timing update if available.",
            f"Logged: {now_iso()}",
        ]
        return "\n".join(lines)

    # fallback summary for other call types
    name = data.get("contact_name") or data.get("name") or "(unknown)"
    lines = [
        f"[Afterhours] Call summary — {call_type.value.upper()} — {call_id}",
        f"Caller: {name}   Phone: {caller_phone}",
        f"Intent: {intent}   State: {state}",
        f"Data keys: {', '.join(sorted(list(data.keys())))}",
        f"Logged: {now_iso()}",
    ]
    return "\n".join(lines)


def run_simulation(scenario: str, caller_phone: str) -> Dict[str, Any]:
    call_type = map_scenario_to_call_type(scenario)
    call_id = f"session_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"

    sm = VoiceAgentStateMachine()

    context = sm.start_call(
        call_id=call_id,
        call_type=call_type,
        initial_context={"contact_phone": caller_phone}
    )
    flow = get_flow_for_call_type(call_type)

    transcript: List[Dict[str, str]] = []

    greeting = flow.get_next_prompt(context.current_state, context)

    print("\n==============================")
    print(f"SIMULATION — {scenario.upper()} — call_type={call_type.value}")
    print("==============================\n")

    transcript.append({"speaker": "agent", "text": greeting})
    print(f"AGENT: {greeting}\n")

    last_result: Dict[str, Any] = {}

    for caller_text in scenario_script(scenario):
        transcript.append({"speaker": "caller", "text": caller_text})
        print(f"CALLER: {caller_text}")

        result = sm.process_user_input(call_id, caller_text)
        last_result = result

        agent_text = result.get("prompt", "")
        transcript.append({"speaker": "agent", "text": agent_text})
        print(f"AGENT: {agent_text}\n")

        if result.get("should_end"):
            break

    owner_summary = build_owner_summary(call_type, call_id, caller_phone, last_result)

    session = {
        "session_id": call_id,
        "started_at": now_iso(),
        "scenario": scenario,
        "call_type": call_type.value,
        "caller_phone": caller_phone,
        "transcript": transcript,
        "last_state": last_result.get("state"),
        "last_intent": last_result.get("intent"),
        "data_collected": last_result.get("data_collected", {}),
        "missing_fields": last_result.get("missing_fields", []),
        "owner_summary": owner_summary,
    }

    print("---------- OWNER SUMMARY ----------")
    print(owner_summary)
    print("-----------------------------------\n")

    out_dir = ensure_out_dir()
    out_path = os.path.join(out_dir, f"{call_id}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(session, f, indent=2, ensure_ascii=False)

    print(f"Saved session log: {out_path}\n")
    return session


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--scenario", default="missed_call", choices=["missed_call", "inbound", "demo_request"])
    parser.add_argument("--caller_phone", default="+19495550123")
    args = parser.parse_args()

    run_simulation(args.scenario, args.caller_phone)


if __name__ == "__main__":
    main()
