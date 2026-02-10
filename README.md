# Travel Itinerary 5000 - Email-to-Itinerary Parser

Transform messy travel confirmation emails into structured, beautiful itineraries.

## 🎯 Project Overview

TravelHax solves the problem of managing multiple travel confirmations across different providers by automatically parsing emails and creating a unified itinerary.

## 📁 Project Structure

```
TravelHax/
├── schema.json                    # Complete JSON schema for travel events
├── prompts/
│   ├── master-parser-prompt.md    # Main AI parser instructions
│   ├── flight-specific-prompt.md  # Flight email parsing
│   └── hotel-specific-prompt.md   # Hotel email parsing
├── parser-prototype.html          # Interactive testing interface
├── styles.css                     # Prototype styling
└── parser.js                      # Prototype logic
```

## 🚀 Quick Start

1. **Test the Parser Prototype**
   - Open `parser-prototype.html` in your browser
   - Click "Sample Flight", "Sample Hotel", or "Sample Rental"
   - Click "Parse Email" to see the structured output

2. **Review the Schema**
   - Open `schema.json` to see the complete data structure
   - All fields are documented with descriptions
   - Includes timezone handling, confidence scores, and multi-event support

3. **Understand the AI Prompts**
   - `prompts/master-parser-prompt.md` - Core parsing instructions
   - `prompts/flight-specific-prompt.md` - Flight-specific handling
   - `prompts/hotel-specific-prompt.md` - Hotel-specific handling

## 🔑 Key Features

### JSON Schema
- **Timezone support** - IANA timezone identifiers for accurate time handling
- **Confidence scoring** - Track extraction accuracy (0.0-1.0)
- **Multi-event linking** - Connect related bookings (round trips, connecting flights)
- **Status tracking** - Confirmed, cancelled, delayed, modified
- **Comprehensive fields** - Flights, hotels, rentals, activities, and more

### AI Parser Prompts
- **Type-specific parsing** - Specialized prompts for different email types
- **Error handling** - Graceful degradation for missing/ambiguous data
- **Update detection** - Identify cancellations, delays, and modifications
- **Attachment awareness** - Track PDFs, boarding passes, calendar files

### Interactive Prototype
- **Sample emails** - Pre-loaded examples for testing
- **Visual output** - JSON and formatted views
- **Real-time parsing** - Simulates AI processing

## 📋 Next Steps

### Phase 1: Core Engine (Current)
- [x] Define JSON schema
- [x] Create AI parser prompts
- [x] Build testing prototype
- [ ] Test with real travel emails
- [ ] Refine prompts based on results

### Phase 2: AI Integration
- [ ] Set up AI API (Gemini/Claude/GPT-4)
- [ ] Implement actual parsing logic
- [ ] Add confidence scoring
- [ ] Build update matching system

### Phase 3: Email Ingestion
- [ ] Choose ingestion method (Make.com vs SendGrid)
- [ ] Set up unique email addresses per user
- [ ] Implement email forwarding
- [ ] Add non-travel email filtering

### Phase 4: Storage & UI
- [ ] Set up database (Airtable/Supabase)
- [ ] Build itinerary display interface
- [ ] Add calendar export (Google/Apple)
- [ ] Implement sharing features

## 🧪 Testing the Parser

### Using the Prototype
1. Open `parser-prototype.html`
2. Paste a real travel confirmation email
3. Select email type (or use Auto-Detect)
4. Click "Parse Email"
5. Review the JSON output and confidence scores

### Using AI Directly
1. Copy the content from `prompts/master-parser-prompt.md`
2. Add your email text at the bottom
3. Paste into Claude 3.5 Sonnet or Gemini 1.5 Pro
4. Review the JSON output

## 🎨 Schema Highlights

### Event Types Supported
- ✈️ Flights (including multi-leg and connecting)
- 🏨 Hotels & Airbnb
- 🚗 Car Rentals
- 🎭 Activities & Tours
- 🍽️ Restaurant Reservations
- 🚆 Train/Bus/Ferry
- 🅿️ Parking

### Critical Fields
- `confirmation_code` - Booking reference
- `timing.start_datetime` - ISO 8601 with timezone
- `timing.timezone` - IANA identifier
- `status` - confirmed/cancelled/delayed/modified
- `confidence` - Extraction accuracy score

## 💡 Tips for Success

1. **Start with 5 real emails** - Test the prompts with actual confirmations
2. **Focus on timezone accuracy** - This is where most apps fail
3. **Build the filter early** - Prevent non-travel emails from burning API credits
4. **Track confidence scores** - Flag low-confidence extractions for manual review
5. **Test edge cases** - Cancellations, delays, multi-city trips

## 🔗 Resources

- [Gemini API](https://ai.google.dev/)
- [Claude API](https://www.anthropic.com/api)
- [Make.com](https://www.make.com/) - No-code email automation
- [SendGrid Inbound Parse](https://sendgrid.com/solutions/inbound-parse-webhook/)

## 📝 License

This is a personal project. Use and modify as needed.
