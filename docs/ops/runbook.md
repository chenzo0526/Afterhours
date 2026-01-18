# Ops Runbook (One Page)

Purpose:
Keep customers calm and keep the on-call informed when issues occur.

First checks (in order):
1) Are calls reaching the intake flow?
2) Are summaries being generated?
3) Are notifications sending?
4) Are failures isolated or widespread?
5) Is fallback reaching backup or owner?

What to never say:
- "It is definitely fixed."
- "We guarantee a resolution."
- "We will be there in X minutes."

What to say:
- "We are investigating and will update you by <time>."
- "Notifications may be delayed; your on-call can place a manual callback if needed."

Fallback behavior:
- If SMS fails, call the backup on-call.
- If backup cannot be reached, notify the owner contact.

Reminder:
Afterhours does not dispatch or promise arrival times.
