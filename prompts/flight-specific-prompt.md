# Flight Confirmation Parser Prompt

## Specialized Instructions for Flight Emails

You are parsing a flight confirmation email. Pay special attention to:

### Critical Flight Data Points

**Flight Identification:**
- Airline name (e.g., "Air Canada", "WestJet")
- Flight number (e.g., "AC123", "WS456")
- Confirmation code / PNR (6-character alphanumeric)
- Ticket number (13-digit number)

**Airports:**
- Departure airport code (IATA 3-letter code)
- Arrival airport code
- Full airport names
- Terminal numbers
- Gate numbers (may be assigned later)

**Timing:**
- Departure date and time WITH TIMEZONE
- Arrival date and time WITH TIMEZONE
- ⚠️ **CRITICAL:** Arrival time is in the DESTINATION timezone, not departure timezone
- Duration (if stated)

**Passenger Information:**
- All passenger names (Last/First format common)
- Passenger types (Adult/Child/Infant)
- Frequent flyer numbers

**Seat & Class:**
- Seat assignments (e.g., "12A", "23F")
- Cabin class (Economy, Premium Economy, Business, First)
- Fare class code (if shown)

**Baggage:**
- Checked baggage allowance
- Carry-on allowance
- Special baggage notes

### Common Flight Email Patterns

**Multi-City / Connecting Flights:**
```
Flight 1: YYZ → YVR (AC123)
Flight 2: YVR → LAX (AC456)
```
Create TWO separate events, link with `related_event_ids`, set `is_connecting_flight: true`

**Round Trip:**
```
Outbound: YYZ → LAX
Return: LAX → YYZ
```
Create TWO separate events, link them as related

**Group Booking:**
```
Passenger 1: SMITH/JOHN
Passenger 2: SMITH/JANE
Passenger 3: SMITH/TIMMY
```
Extract all three into `passengers` array

### Timezone Handling for Flights

**Example:**
```
Depart: Toronto (YYZ) 3:00 PM EST → Arrive: Los Angeles (LAX) 6:00 PM PST
```

**Correct JSON:**
```json
{
  "timing": {
    "start_datetime": "2026-03-15T15:00:00-05:00",
    "timezone": "America/Toronto"
  },
  "flight_details": {
    "departure_airport": {
      "code": "YYZ",
      "name": "Toronto Pearson International Airport"
    },
    "arrival_airport": {
      "code": "LAX", 
      "name": "Los Angeles International Airport"
    }
  }
}
```

**Create a SECOND event for arrival:**
```json
{
  "event_type": "flight",
  "timing": {
    "start_datetime": "2026-03-15T18:00:00-08:00",
    "timezone": "America/Los_Angeles"
  }
}
```

### Important Notes to Extract

Look for:
- "Check-in opens 24 hours before departure"
- "Arrive at airport 2 hours before international flights"
- "Government-issued photo ID required"
- "Passport required for international travel"
- "TSA PreCheck / NEXUS / Global Entry" eligibility
- "Seat selection available for a fee"
- "Upgrade available"
- COVID-19 testing requirements
- Visa requirements

### Status Keywords

- "Confirmed" → `"status": "confirmed"`
- "Cancelled" / "Canceled" → `"status": "cancelled"`
- "Delayed" → `"status": "delayed"`
- "Gate changed" → `"status": "modified"`
- "Time changed" → `"status": "modified"`

### Common Airline Email Formats

**Air Canada:**
- PNR is 6 characters
- Ticket number is 13 digits starting with "014"
- Uses "Depart" and "Arrive" labels

**WestJet:**
- Confirmation code is 6 characters
- Uses "Departure" and "Arrival" labels
- Often includes "WestJet Rewards" number

**United:**
- Confirmation code is 6 characters
- Uses "Departs" and "Arrives"
- Often shows "Economy" vs "Basic Economy"

### Example Output

```json
{
  "extraction_metadata": {
    "extracted_at": "2026-02-09T15:44:23-04:00",
    "email_subject": "Flight Confirmation - AC123 Toronto to Los Angeles",
    "confidence_score": 0.95,
    "is_travel_related": true,
    "parser_version": "1.0"
  },
  "events": [
    {
      "event_id": "flight_ac123_20260315",
      "event_type": "flight",
      "status": "confirmed",
      "provider": {
        "name": "Air Canada",
        "support_phone": "1-888-247-2262",
        "website": "https://www.aircanada.com"
      },
      "confirmation": {
        "confirmation_code": "ABC123",
        "pnr": "ABC123",
        "ticket_number": "0142345678901",
        "confidence": 1.0
      },
      "timing": {
        "start_datetime": "2026-03-15T15:00:00-05:00",
        "end_datetime": "2026-03-15T18:00:00-08:00",
        "timezone": "America/Toronto",
        "duration_minutes": 300
      },
      "flight_details": {
        "airline": "Air Canada",
        "flight_number": "AC123",
        "departure_airport": {
          "code": "YYZ",
          "name": "Toronto Pearson International Airport",
          "terminal": "1"
        },
        "arrival_airport": {
          "code": "LAX",
          "name": "Los Angeles International Airport",
          "terminal": "B"
        },
        "seat": "12A",
        "class": "economy",
        "baggage_allowance": "1 checked bag (23kg), 1 carry-on"
      },
      "passengers": [
        {
          "name": "SMITH/JOHN",
          "type": "adult"
        }
      ],
      "important_notes": [
        "Check-in opens 24 hours before departure",
        "Arrive 2 hours before international departure",
        "Government-issued photo ID required"
      ]
    }
  ]
}
```

---

## Now parse this flight email:

[PASTE FLIGHT EMAIL HERE]
