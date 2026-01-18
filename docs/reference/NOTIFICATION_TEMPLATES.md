# Afterhours Notification Templates

Canonical expectation line (use verbatim when needed):
Afterhours answers after-hours and overflow calls, collects essential details, and notifies your on-call contact. We do not dispatch or promise arrival times.

---

## Trial confirmation (email)
Subject: Your Afterhours live trial is ready

Body:
Hi {{first_name}},

Thanks for starting your live trial. Afterhours answers after-hours and overflow calls, collects essential details, and notifies your on-call contact. We do not dispatch or promise arrival times.

Next steps:
- Forwarding setup time: {{scheduled_time}}
- Test call: required before go-live
- Primary + backup on-call verified

If a caller indicates a life-safety emergency, we instruct them to hang up and call 911.

Support: support@afterhours.com

---

## Call summary (SMS)
Afterhours summary for {{business_name}}:
- Issue: {{issue}}
- Urgency: {{urgency}}
- Caller: {{caller_name}} ({{caller_phone}})
- Address: {{address}}
- Callback: {{callback_preference}}
Record: {{summary_record_id}}

---

## Call summary (email)
Subject: Afterhours call summary — {{caller_name}} ({{urgency}})

Body:
Business: {{business_name}}
Call time: {{call_time}}

Summary:
- Issue: {{issue}}
- Urgency: {{urgency}}
- Caller: {{caller_name}} ({{caller_phone}})
- Address: {{address}}
- Access notes: {{access_notes}}
- Callback preference: {{callback_preference}}

Proof:
- Call summary record: {{summary_record_id}}
- Notification attempt record: {{notification_record_id}}
- Recording link/reference: {{recording_link_or_reference}}

---

## Fallback notification (owner)
Subject: Afterhours notification fallback triggered

Body:
We were unable to reach the primary on-call via SMS and have called the backup. Please confirm receipt.

Call summary record: {{summary_record_id}}
Notification attempt record: {{notification_record_id}}

---

## Weekly digest (email)
Subject: Afterhours weekly digest — {{week_range}}

Body:
Business: {{business_name}}

Totals:
- Calls handled: {{calls_total}}
- Urgency breakdown: {{urgent}} high / {{medium}} medium / {{low}} low
- Notification outcomes: {{delivered}} delivered / {{failed}} failed / {{pending}} pending

Notable calls:
{{notable_calls_list}}

Records:
- Call summary records: {{summary_record_list}}
- Notification attempt records: {{notification_record_list}}
- Recording references: {{recording_reference_list}}

