## Ghost Run (Default)
- Calls are answered by Afterhours
- Emergencies continue through existing routing
- Owner receives summaries + transcripts
- No behavior change without explicit approval

# Afterhours — Ops Runbook

## Current known constraint
- SMS delivery blocked until A2P 10DLC is fully approved and number is registered (Twilio error 30034).

## Ghost Run Mode (works now)
- Log calls to Airtable
- Send owner summary email
- No SMS dependency

## Go-live checklist
- Twilio DID purchased
- A2P campaign approved
- Number attached to Messaging Service
- Retell agent wired to webhook
- Health endpoint returns 200
