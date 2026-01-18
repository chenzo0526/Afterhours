# Afterhours — Call Routing Setup (v1)

This document defines the ONLY supported setup paths for Afterhours Ghost Run.

Customers answer ONE question:
“What handles your calls today?”

From that answer, setup is deterministic.

---

## OPTION A — Cell Phone / Carrier (Most Small Businesses)

Used when:
- Owner’s cell phone is the main business number
- Calls ring directly to a phone
- No phone system dashboard

### How Ghost Run Works
- Calls forward to Afterhours ONLY after-hours
- Daytime calls remain unchanged

### Carrier Forwarding Codes

#### Verizon
- Turn ON after-hours forwarding:
  *72 + Afterhours Number → Call
- Turn OFF forwarding:
  *73 → Call

#### AT&T
- Turn ON:
  *72 + Afterhours Number → Call
- Turn OFF:
  *73 → Call

#### T-Mobile
- Turn ON:
  **21*AfterhoursNumber# → Call
- Turn OFF:
  ##21# → Call

⚠️ These can be scheduled manually or toggled nightly.

---

## OPTION B — Phone System (RingCentral, Nextiva, etc.)

Used when:
- Business has an admin dashboard
- They already use “business hours”
- They have voicemail rules

### How Ghost Run Works
- Add Afterhours as the after-hours destination
- No changes to daytime routing

### Generic Steps
1. Log into phone system admin panel
2. Go to Call Handling / Business Hours
3. Set “After-Hours Destination” to:
   → Forward to Afterhours Number
4. Save

### Known Platforms
- RingCentral
- Nextiva
- Zoom Phone
- Dialpad
- Google Voice (business)

---

## WHAT WE DO NOT SUPPORT (v1)
- Partial routing
- Voicemail interception
- Background listening
- Parallel call flows
- Call recording-only setups

---

## How We Explain It to Owners (Plain English)

“After-hours, calls are forwarded to us instead of voicemail.
During the day, nothing changes.”

That’s it.
