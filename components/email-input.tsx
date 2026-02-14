"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

const sampleEmails = {
  flight: `Subject: Flight Confirmation - AC123 Toronto to Vancouver

Dear John Smith,

Your flight booking is confirmed.

Booking Reference: ABC123
Airline: Air Canada

Flight: AC123
Date: Monday, October 23, 2026
Depart: Toronto Pearson (YYZ) at 08:00 AM (Terminal 1)
Arrive: Vancouver Int'l (YVR) at 10:15 AM (Main Terminal)
Duration: 5h 15m
Class: Economy (K)
Seat: 12A

Passenger: John Smith
Ticket Number: 0142345678901

Cost Breakdown:
Base Fare: $450.00 CAD
Taxes & Fees: $125.50 CAD
Total Paid: $575.50 CAD

Baggage Allowance: 1 Carry-on, 1 Checked Bag (23kg)

Manage your booking at aircanada.com`,
  hotel: `Subject: Hotel Reservation Confirmed - Marriott Downtown Toronto

Hi John,

Thanks for booking with Marriott! We look forward to seeing you.

Confirmation Number: 99887766
Hotel: Marriott Downtown Toronto
Address: 525 Bay Street, Toronto, ON M5G 2L2
Phone: +1 416-597-9200

Check-in: Monday, October 23, 2026 (3:00 PM)
Check-out: Friday, October 27, 2026 (12:00 PM)
Nights: 4
Guests: 1 Adult

Room Type: Deluxe King, City View
Rate: $289.00 CAD / night

Summary of Charges:
Room Rate: $1,156.00
Taxes: $150.28
Total Estimated Cost: $1,306.28 CAD

Cancellation Policy: Cancel by 6:00 PM on Oct 22 to avoid penalty.`,
  rental: `Subject: Car Rental Confirmation - Enterprise

Your car is reserved.

Confirmation Number: E12345678
Renter: John Smith
Vehicle: Intermediate SUV (Toyota RAV4 or similar)

Pick-up:
Location: Toronto Pearson Airport (YYZ)
Date: Monday, October 23, 2026
Time: 11:00 AM

Return:
Location: Toronto Pearson Airport (YYZ)
Date: Friday, October 27, 2026
Time: 9:00 AM

Estimated Total: $425.50 CAD
Includes: Unlimited Kilometers, Collision Damage Waiver

Counter Location: In Terminal
Open 24 Hours`,
  dinner: `Subject: Reservation Confirmed for Dinner at The Keg

Dear John Smith,

Your table is reserved! We look forward to serving you.

Restaurant: The Keg Steakhouse + Bar - York Street
Address: 165 York St, Toronto, ON M5H 3R8

Date: Tuesday, October 24, 2026
Time: 7:30 PM
Guests: 2

Confirmation #: 554433
Occasion: Business Dinner
Seating Preference: Booth (Subject to availability)

Please note: We hold reservations for 15 minutes.
To modify or cancel, please call (416) 367-0685.`,
  musical: `Subject: Confirmation: Your tickets for Hamilton at the Victoria Palace Theatre

Hello Corey,

Get ready for an unforgettable night! Your tickets for Hamilton are confirmed.

Show Date: October 25, 2026
Show Time: 07:30 PM
Location: Victoria Palace Theatre, Victoria St, London SW1E 5EA, UK
Seats: Stalls, Row G, Seats 14-15
Confirmation Number: HAM-8822910

Please arrive at least 30 minutes before the performance.`,
  spa: `Subject: Booking Confirmed: Your Appointment at Blue Lagoon

Dear Guest,

We are delighted to confirm your wellness journey.

Treatment: In-Water Massage (60 min)
Date: October 26, 2026
Time: 02:00 PM
Location: Blue Lagoon, Grindavik 240, Iceland
Check-in: 01:30 PM
Confirmation Code: BL-99331`,
  sports: `Subject: Your Tickets: Toronto Raptors vs. Boston Celtics

Ticketmaster Order: 12-8821/YYZ

Event: Raptors vs. Celtics
Date: October 27, 2026
Tip-off: 08:00 PM
Venue: Scotiabank Arena, 40 Bay St., Toronto, ON M5J 2X2
Section: 108, Row 12, Seat 5
Order ID: TM-RAPS-4402`,
  tour: `Subject: Reservation Confirmed: Ultimate Scottish Highlands Tour

Hi there,

Tour Name: Isle of Skye & Eilean Donan Castle Day Trip
Date: October 28, 2026
Meeting Time: 07:45 AM
Departure Time: 08:00 AM
Meeting Point: 190 High St, Edinburgh EH1 1RW
Booking Ref: SCOT-TOUR-771
Provider: Rabbie's Trail Burners`,
  transit: `Subject: E-Ticket: Your Eurostar Booking to Paris

Booking Reference: EURO-9911XC

Train: ES 9024
From: London St Pancras Int'l
To: Paris Nord
Date: October 30, 2026
Departure: 10:24 AM
Arrival: 01:47 PM
Coach: 08, Seat 61
Check-in Deadline: 09:30 AM (Strict)`,
};

const sampleButtons = [
  { label: "Flight", key: "flight" as const, icon: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" },
  { label: "Hotel", key: "hotel" as const, icon: "M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM9 14a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" },
  { label: "Rental", key: "rental" as const, icon: "M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.4A2 2 0 0 0 13.7 6H6.3a2 2 0 0 0-1.6.9L2 10l-2.5 1.1C-.7 11.3-1 12.1-1 13v3c0 .6.4 1 1 1h2M7 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
  { label: "Musical", key: "musical" as const, icon: "M2 18 22 2M2 6l20 16M22 6 2 22M9 3v1h6V3l-3-2-3 2z" },
  { label: "Spa", key: "spa" as const, icon: "M12 3c-1.1 0-2.1.4-2.8 1.2L8 5.4c-.6.6-.9 1.4-.9 2.3v1c0 .6.4 1 1 1h7.8c.6 0 1-.4 1-1v-1c0-.9-.3-1.7-.9-2.3L14.8 4.2C14.1 3.4 13.1 3 12 3zM7.1 11c-.6 0-1 .4-1 1v7c0 1.1.9 2 2 2h7.8c1.1 0 2-.9 2-2v-7c0-.6-.4-1-1-1H7.1z" },
  { label: "Sports", key: "sports" as const, icon: "M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34c3.11-.27 5.5-2.85 5.5-5.96h-13c0 3.11 2.39 5.69 5.5 5.96z" },
  { label: "Tour", key: "tour" as const, icon: "m12 1-6.5 11.5L4 14l1 1 1 1 1.5-.5L12 14l4.5 3 1.5.5 1-1 1-1-1.5-1.5L12 1zM8.5 11l-.5 4.5L11 20l1 3 1-3 3-4.5-.5-4.5L12 8.5 8.5 11z" },
  { label: "Transit", key: "transit" as const, icon: "M7 22c1.1 0 2-.9 2-2H8c-1.1 0-2 .9-2 2zM17 22c1.1 0 2-.9 2-2h-1c-1.1 0-2 .9-2 2zM4 11V4c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v7M4 15h16M4 11h16" },
];

const MASTER_PROMPT = `You are a specialized Travel Confirmation Data Extraction Engine. Your sole purpose is to analyze travel-related emails and extract structured data in JSON format.

CRITICAL: You MUST output ONLY valid JSON. No explanations, no markdown, no code blocks - just pure JSON.

Extract all travel details from the email and output them according to this structure:

{
  "generated_trip_title": "Concise title",
  "extraction_metadata": {
    "extracted_at": "[ISO 8601 timestamp]",
    "email_subject": "[subject line]",
    "confidence_score": [0.0-1.0],
    "is_travel_related": [true/false],
    "parser_version": "1.0"
  },
  "events": [
    {
      "event_type": "flight | train | bus | ferry | car_rental | public_transit | taxi | hotel | vacation_rental | hostel | cruise | camping | restaurant | bar | food_tour | tour | attraction | performance | wellness | border_control | health | meeting | note | other",
      "status": "confirmed | cancelled | delayed | modified",
      "timing": {
        "start_datetime": "ISO 8601 UTC string",
        "end_datetime": "ISO 8601 UTC string",
        "timezone": "IANA timezone string"
      },
      "location": {
        "name": "Full Name",
        "address": "Full physical address",
        "phone": "Phone number if available",
        "sub_location": {
          "terminal": "string",
          "gate": "string",
          "platform": "string",
          "room": "string",
          "table": "string"
        }
      },
      "confirmation": {
        "confirmation_code": "string",
        "ticket_number": "string",
        "pnr": "string"
      },
      "milestones": [
        { "label": "string", "datetime": "ISO 8601 UTC string" }
      ],
      "provider": { 
        "name": "Company Name",
        "website": "URL if available"
      },
      "operational_info": {
        "party_size": number,
        "notes": "string",
        "check_in_window": "string",
        "items": ["list of items"]
      },
      "cost": {
        "subtotal": number,
        "tax": number,
        "tip": number,
        "total_amount": number,
        "currency": "USD | CAD | EUR | etc",
        "payment_status": "paid | guaranteed | unpaid"
      }
    }
  ]
}

Rules:
- Transportation: flight, train, bus, ferry, car_rental, public_transit, taxi.
- Lodging: hotel, vacation_rental, hostel, cruise, camping.
- Culinary: restaurant, bar, food_tour, dining_reservation (includes ALL Reservations and Receipts).
- Activities: tour, attraction, performance, wellness.
- Admin: border_control, health, meeting, note.
- Naming Rules:
   - generated_trip_title MUST be clean and concise.
   - NEVER use the raw email subject if it is a placeholder (e.g., 'Test 11', '123', 'My Email').
   - NEVER use raw subjects containing 'Fwd:', 'Confirmation', or 'Receipt'.
   - ALWAYS build a title from the location/event (e.g. 'Dinner at The Keg', 'Car Rental at Toronto Pearson').
   - If event is 'other', use the location or purpose to create a title (e.g. 'Coffee with Sarah').
- Milestones: Extract critical markers:
   - Lodging: Check-in Start, Late Arrival info, Check-out Deadline.
   - Transportation: Boarding Time, Gate Closing Time, Departure, Arrival.
   - Culinary: Reservation time, Table hold duration, Cancellation window.
   - General: Any "Must do by" or "Ends at" times found in the content.
- Output ONLY the JSON, nothing else
- If multiple events are found, list them all.
`;

export function EmailInput() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ base64: string; mimeType: string; name: string } | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const { toast } = useToast()

  const handleParse = async () => {
    if (!supabase) {
      toast({ title: "Configuration Error", description: "Supabase is not configured. Please check your .env.local file.", variant: "destructive" })
      return
    }
    if (!input && !selectedFile) {
      toast({ title: "Error", description: "Please paste an email or upload a PDF", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const payload = {
        prompt: MASTER_PROMPT + "\n\nEmail/Document Content:\n" + (input || "Extract data from the attached document."),
        fileData: selectedFile?.base64,
        mimeType: selectedFile?.mimeType
      }

      const response = await fetch("/api/parse-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || "Server Error")
      }

      const data = await response.json()
      const aiResponse = data.candidates[0].content.parts[0].text
      let jsonText = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const tripData = JSON.parse(jsonText)

      const saveRepo = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ tripData })
      })

      if (saveRepo.ok) {
        toast({ title: "Success", description: "Trip parsed and saved!" })
        window.dispatchEvent(new CustomEvent("refresh-trips"))
        setInput("")
        setSelectedFile(null)
      }
    } catch (e: any) {
      toast({ title: "Parsing Error", description: e.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setSelectedFile({
        base64: (ev.target?.result as string).split(",")[1],
        mimeType: file.type,
        name: file.name
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
          </div>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-card-foreground">Manual Input</h2>
        </div>
        <div className="flex items-center gap-4">
          {!isCollapsed && (
            <div className="flex gap-2">
              <input type="file" id="file-upload" className="hidden" accept="application/pdf" onChange={handleFile} />
              <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()} className="w-32 h-8 text-xs">
                {selectedFile ? "Change PDF" : "Upload PDF"}
              </Button>
              <Button onClick={handleParse} disabled={loading} className="w-32 h-8 text-xs">
                {loading ? "Parsing..." : "Parse Email"}
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
          </Button>
        </div>
      </div>
      {!isCollapsed && (
        <div className="animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="border-b border-border bg-secondary/50 px-6 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-muted-foreground">Samples:</span>
              {sampleButtons.map((btn) => (
                <button key={btn.label} type="button" onClick={() => setInput(sampleEmails[btn.key])} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-card-foreground transition-colors hover:bg-secondary">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d={btn.icon} /></svg>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-6">
            {selectedFile && (
              <div className="mb-4 flex items-center justify-between rounded-lg bg-primary/5 p-3 text-sm border border-primary/10">
                <span className="font-medium">Paper clipped: {selectedFile.name}</span>
                <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-destructive">×</button>
              </div>
            )}
            <textarea rows={8} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Paste your travel confirmation email here..." className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
      )}
    </section>
  );
}
