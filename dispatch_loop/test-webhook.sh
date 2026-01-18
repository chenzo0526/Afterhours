#!/bin/bash

echo "Testing debug endpoint..."
curl -X POST http://localhost:3000/debug/send-test-sms
echo -e "\n\n"

echo "Testing Retell webhook..."
curl -X POST http://localhost:3000/webhooks/retell/call-ended \
  -H "Content-Type: application/json" \
  -d '{
    "call": {
      "call_id": "test_123",
      "variables": {
        "customer_name": "John Doe",
        "issue_type": "Burst pipe",
        "service_address": "123 Main St",
        "callback_number": "+15551234567"
      }
    }
  }'
echo -e "\n"

