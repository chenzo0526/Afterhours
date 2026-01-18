# Afterhours Autonomy Scope (Source of Truth)

This file defines the ONLY surfaces the Autonomy Orchestrator is allowed to read or modify.
If a surface is not listed here, do not edit it unless creating a missing required template.

---

## 1) Website (customer-facing)
- Homepage / Hero: src/app/page.tsx
- Pricing page: src/app/pricing/page.tsx
- Trial page: src/app/trial/page.tsx

### Shared UI copy
- Header / Nav: src/components/Header.tsx
- Footer: src/components/Footer.tsx
- CTA components: src/components/CTA.tsx
- Copy constants: src/lib/copy.ts

---

## 2) Trial Flow Messaging
- Trial confirmation email: templates/email/trial_confirmation.md
- Trial confirmation SMS: templates/sms/trial_confirmation.txt

---

## 3) Agent Script (Retell)
- Primary agent prompt: agents/retell/afterhours_agent_prompt.md
- Guardrails / disclaimers: agents/retell/guardrails.md

---

## 4) Onboarding
- Setup checklist: docs/onboarding/setup_checklist.md
- Test call instructions: docs/onboarding/test_call.md
- Go-live gate: docs/onboarding/go_live_gate.md

---

## 5) Proof & Accountability
- Call record format: docs/proof/call_record.md
- Notification record format: docs/proof/notification_record.md
- Weekly digest email: templates/email/weekly_digest.md

---

## 6) Support & Incident Ops
- Ops runbook: docs/ops/runbook.md
- Priority definitions: docs/ops/priorities.md
- Support intake instructions: docs/ops/support_intake.md

---

## Guardrails (non-negotiable)
- Afterhours does NOT dispatch, promise ETAs, or guarantee outcomes.
- No “AI” language anywhere.
- Tone must remain calm, neutral, and operational.
- Optimize for 2am failure scenarios.

