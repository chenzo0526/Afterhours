 # Incident Operations (Support & Incident Ops)
 
 One-page field guide for keeping customers calm, support focused, and trust intact.
 
 ---
 
 ## Priority Ladder (P0 / P1 / P2)
 
**P0 — Active outage or safety-risk in production**
- Example: Call intake down; calls not being answered at all
- Example: Notifications failing and on-call never receives alerts
 - Example: Data loss or privacy issue impacting customers
 
 **P1 — Partial outage or severe degradation**
- Example: Call intake works for some businesses but not others
 - Example: SMS fails but email fallback still works
 - Example: Airtable writes intermittently failing, causing delays
 
 **P2 — Non-urgent bug or degraded experience with workaround**
- Example: Minor formatting issue in summaries, data still correct
- Example: Slow status updates, no impact on notifications
- Example: Non-critical webhook delay with retries succeeding
 
 ---
 
 ## Incident Runbook (One Page)
 
 **What to check first (in order)**
1. Is call intake actually failing or just slow? (recent logs / Airtable Calls)
2. Are webhooks arriving? (call provider → webhook logs)
3. Are outbound notifications going out? (Twilio send logs / errors)
 4. Is Airtable write failing? (Calls record creation logs)
 5. Is retry scheduler alive? (no restarts, retry logs present)
 
 **What to never say**
 - "It’s definitely fixed."
 - "No idea what happened."
 - "We didn’t get your call." (unless verified; use "We don’t see it yet")
 - "This can’t happen."
 - "We’ll make sure it never happens again."
 
 **What to communicate immediately (first message)**
 - Acknowledge impact in plain language
 - Current status (investigating / identified / mitigating)
- Customer-visible workaround (manual callback / fallback)
 - Next update time (specific and realistic)
 
 ---
 
 ## Customer-Facing Response Promises
 
 **Realistic**
 - P0: acknowledge within 10 minutes, update every 30 minutes
 - P1: acknowledge within 1 hour, update every 4 hours
 - P2: acknowledge within 1 business day, update daily
 
**Builds trust**
 - State what is known, what is unknown, what’s next
 - Give a time-boxed next update
- Offer a safe fallback when possible (manual callback by on-call)
 
 **Avoids overcommitment**
 - Do not promise ETAs you can’t control
 - Use "best estimate" language and give a range
 - Avoid absolutes like "never" and "guaranteed"
 
 ---
 
 ## Single Support Intake Path
 
**Channel**
- `support@afterhours.com` (single source of truth → ticketing)
 
 **Required info (auto-required in first reply)**
 - Business name + phone line
 - Incident start time (timezone)
 - Symptoms (what was expected vs what happened)
 - Example caller phone or call ID (if available)
 - Any workaround attempted
 
**Auto-triage logic**
- P0 if: no summaries/notifications for >10 minutes, multiple customers affected, or safety risk
 - P1 if: intermittent failures, partial business impact, fallback works
 - P2 if: cosmetic issues or non-urgent bugs with workaround
 - Add escalation tag if: high-value account, >3 reports, or after-hours
 
 ---
 
 ## Support Scripts (Copy/Paste)
 
 **Initial acknowledgement (P0/P1)**
- "We’re seeing an issue that can affect call intake and notifications. We’re actively investigating and will update you by <time>. If you have an urgent call now, please share the caller phone and issue summary so your on-call can follow up."
 
 **Status update (identified)**
- "We’ve identified the cause and are working on a fix. Notifications may be delayed for some calls. Next update by <time>. If needed, your on-call can place a manual callback."
 
 **Resolved**
- "This incident is resolved. Call intake and notifications are operating normally. If you notice any remaining issues, reply here and we’ll follow up."
 
 **When you can’t see their call**
 - "We don’t see that call in our system yet. We’re checking upstream logs now. If you can share the caller number and time, we’ll trace it immediately."
 
 ---
 
 ## Founder Stress Test
 
**Worst-case night scenario**
- Call webhooks are delayed, Twilio SMS is blocked, and the retry scheduler restarted. Multiple businesses miss urgent calls.
 
 **What breaks first**
 - Customer trust (missed urgent calls)
 - Support focus (multiple channels, conflicting updates)
 - Operational confidence (unclear ownership, no single source of truth)
 
**What saves the relationship**
- Immediate, clear acknowledgement with manual callback guidance
 - Consistent updates with specific next update times
 - Post-incident follow-up explaining impact and fix
 
 ---
 
 ## Readiness Verdict
 
**Status: Yellow**
- Strong runbook coverage exists for call intake + notification flow
 - Missing: single intake enforcement and standardized incident scripts in daily use
 - High-risk gap: retry scheduler persistence and fallback delivery health checks
