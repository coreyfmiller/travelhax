# Hotel/Accommodation Parser Prompt

## Specialized Instructions for Hotel & Airbnb Emails

You are parsing a hotel or short-term rental confirmation. Pay special attention to:

### Critical Hotel Data Points

**Property Information:**
- Hotel/property name
- Full address (street, city, state/province, postal code, country)
- Phone number
- Website

**Booking Details:**
- Confirmation number (varies by provider)
- Guest name (primary booker)
- Number of guests
- Room type (e.g., "Deluxe King", "Two Queen Beds")

**Timing:**
- Check-in date and TIME (usually 3:00 PM or 4:00 PM)
- Check-out date and TIME (usually 11:00 AM or 12:00 PM)
- Number of nights (calculate if not stated)
- ⚠️ **CRITICAL:** Use the property's LOCAL timezone

**Pricing:**
- Total cost
- Currency
- Breakdown (room rate, taxes, resort fees, etc.)
- Payment method
- Deposit/prepayment status

### Common Hotel Email Patterns

**Marriott/Hilton/IHG:**
- Confirmation number is typically 10-12 digits
- Shows "Arrival" and "Departure" dates
- Lists check-in/check-out times separately
- Often includes loyalty program number

**Airbnb:**
- Confirmation code is alphanumeric (e.g., "HMABCD1234")
- Shows host name
- Includes check-in instructions (lockbox code, key pickup)
- May have house rules

**Booking.com:**
- PIN code for check-in
- Property contact information
- Cancellation policy details

### Timezone Handling for Hotels

**Example:**
```
Check-in: March 15, 2026 at 3:00 PM
Property: Marriott Downtown Toronto
```

**Correct JSON:**
```json
{
  "timing": {
    "start_datetime": "2026-03-15T15:00:00-05:00",
    "end_datetime": "2026-03-17T11:00:00-05:00",
    "timezone": "America/Toronto"
  },
  "accommodation_details": {
    "check_in": "2026-03-15T15:00:00-05:00",
    "check_out": "2026-03-17T11:00:00-05:00",
    "number_of_nights": 2
  }
}
```

### Important Notes to Extract

Look for:
- "Early check-in available upon request"
- "Late check-out subject to availability"
- "Photo ID and credit card required at check-in"
- "Resort fee of $X per night"
- "Parking: $X per day" or "Free parking"
- "Breakfast included" or "Breakfast available for purchase"
- "Pet-friendly" or "No pets allowed"
- "Non-smoking room"
- "Accessible room features"
- Cancellation policy
- WiFi information
- Pool/gym hours

### Amenities Extraction

Common amenities to look for:
- Free WiFi / High-speed internet
- Breakfast included
- Pool / Hot tub
- Fitness center / Gym
- Parking (free/paid)
- Airport shuttle
- Pet-friendly
- Kitchen / Kitchenette
- Laundry facilities
- Business center
- Room service

### Example Output

```json
{
  "extraction_metadata": {
    "extracted_at": "2026-02-09T15:44:23-04:00",
    "email_subject": "Booking Confirmation - Marriott Downtown Toronto",
    "confidence_score": 0.95,
    "is_travel_related": true,
    "parser_version": "1.0"
  },
  "events": [
    {
      "event_id": "hotel_marriott_20260315",
      "event_type": "hotel",
      "status": "confirmed",
      "provider": {
        "name": "Marriott Hotels",
        "support_phone": "1-800-228-9290",
        "website": "https://www.marriott.com"
      },
      "confirmation": {
        "confirmation_code": "1234567890",
        "confidence": 1.0
      },
      "timing": {
        "start_datetime": "2026-03-15T15:00:00-05:00",
        "end_datetime": "2026-03-17T11:00:00-05:00",
        "timezone": "America/Toronto"
      },
      "location": {
        "name": "Marriott Downtown Toronto",
        "address": {
          "street": "525 Bay Street",
          "city": "Toronto",
          "state_province": "ON",
          "postal_code": "M5G 2L2",
          "country": "Canada",
          "full_address": "525 Bay Street, Toronto, ON M5G 2L2, Canada"
        }
      },
      "accommodation_details": {
        "check_in": "2026-03-15T15:00:00-05:00",
        "check_out": "2026-03-17T11:00:00-05:00",
        "room_type": "Deluxe King Room",
        "guest_name": "John Smith",
        "number_of_guests": 2,
        "number_of_nights": 2,
        "amenities": [
          "Free WiFi",
          "Fitness center",
          "Indoor pool",
          "Business center",
          "Parking available ($25/day)"
        ]
      },
      "cost": {
        "total": 450.00,
        "currency": "CAD",
        "breakdown": {
          "base_price": 350.00,
          "taxes": 100.00
        }
      },
      "important_notes": [
        "Photo ID and credit card required at check-in",
        "Check-in time: 3:00 PM",
        "Check-out time: 11:00 AM",
        "Parking available for $25 per day",
        "Non-smoking room"
      ]
    }
  ]
}
```

### Special Cases

**Airbnb Check-in Instructions:**
If the email contains specific check-in instructions (lockbox codes, key locations), add them to `important_notes` but DO NOT include sensitive codes in the JSON if possible. Instead note:
```json
"important_notes": [
  "Check-in instructions provided separately",
  "Contact host for access details"
]
```

**Multi-Room Bookings:**
If booking multiple rooms, create separate events for each room or consolidate into one event with adjusted `number_of_guests`.

---

## Now parse this hotel email:

[PASTE HOTEL EMAIL HERE]
