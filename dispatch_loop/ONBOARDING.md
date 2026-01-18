# Afterhours — Ghost Run Onboarding (MVP)

## What Ghost Run Means (Plain English)
Your customers still call your normal business number.
After-hours only, your phone system forwards calls to our agent.
We take the call, collect essential details, log it, and notify your on-call contact.
Afterhours answers after-hours and overflow calls, collects essential details, and notifies your on-call contact. We do not dispatch or promise arrival times.

This is not background listening.
We only help if the call is routed to us.

If a caller indicates a life-safety emergency, we instruct them to hang up and call 911.

---

## Required onboarding inputs (must be completed)
1) Spoken company name (exactly how callers should hear it):
2) Main business phone number (the one customers call):
3) Primary on-call contact (name, mobile, email):
4) Backup on-call contact (name, mobile, email):
5) After-hours definition + timezone:
   - Example: Mon–Fri 6pm–8am, Sat/Sun all day
6) Service area boundaries:
   - Cities/zip codes covered + any excluded areas
7) Emergency disclaimer acknowledgment:
   - Confirm we should direct life-safety emergencies to 911
8) Summary delivery preferences:
   - SMS, email, or both (carrier delivery applies)
9) Call recording preference:
   - On/off + retention expectation

---

## Forwarding setup options (choose ONE)
A) Carrier forwarding (fastest)
- You forward your main number after-hours to our Afterhours number.
- In the morning, you turn forwarding off.

B) Phone system schedule (best)
- Your phone system (RingCentral / Nextiva / Google Voice / etc.) forwards after-hours calls automatically.

C) After-hours line (no changes to main line)
- You add a dedicated after-hours number to your website/ads.

---

## Test Call + Go-Live Gate (mandatory)
- We run a test call after forwarding is configured.
- You confirm the spoken company name, questions, and summary format.
- Go-live only happens after the test call is approved and primary + backup contacts are verified.

---

## Notification fallback behavior (default)
- If SMS fails to deliver, we call the backup on-call.
- If the backup cannot be reached, we notify the owner contact.

---

## Proof & logging (every call)
- Call summary record (caller, issue, urgency, callback preference)
- Notification attempt record (timestamps, channels, delivery status)
- Recording link or reference when recording is enabled

---

## What you get during Ghost Run week
- Forwarded after-hours calls captured
- Summary per call (caller info, issue, urgency, requested callback window)
- Daily recap (optional)
- Weekly digest (call volume, urgency breakdown, notification outcomes)

---

## Escalation Rules (default)
LOW: log + summary
MEDIUM: log + summary + needs follow-up tomorrow
HIGH: prioritized notification to your escalation number + summary

---

## Cancellation
Ghost Run is 7 days. If you don’t want it, forwarding stops. Nothing else changes.
