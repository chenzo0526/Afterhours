#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== Afterhours demo runner =="

# Load env
set -a
source .env
set +a

# Start server if not running
if ! lsof -ti:3000 >/dev/null 2>&1; then
  echo "[demo] starting server on :3000 ..."
  nohup npm start >/tmp/afterhours_demo.log 2>&1 &
  sleep 2
fi

echo "[demo] sending manual dispatch..."
RESP="$(curl -s -X POST http://localhost:3000/api/dispatch/manual \
  -H "Content-Type: application/json" \
  -d '{
    "callData": {
      "callerPhone": "+19496774418",
      "twilioToNumber": "+19497968362",
      "issueSummary": "DEMO: customer called after hours (non-urgent test)",
      "transcript": "Caller: water heater quote. Wants callback tomorrow.",
      "emergencyLevel": "LOW"
    }
  }')"

echo "$RESP" | python3 -c 'import json,sys; d=json.load(sys.stdin); 
print("API success:", d.get("success")); 
r=d.get("result",{}); 
print("callId:", r.get("callId")); 
print("status:", r.get("status")); 
print("dispatchSuccess:", r.get("dispatchSuccess"))'

echo ""
echo "Next:"
echo "1) Check Airtable Calls table for the new callId"
echo "2) Check your inbox for the owner summary email"
echo "3) Twilio SMS may be blocked until A2P approval (30034)"
