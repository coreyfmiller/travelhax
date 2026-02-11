import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Configure Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  console.log("📨 Received inbound email webhook");

  try {
    // Parse multipart/form-data
    const formData = await req.formData();
    const from = formData.get("from") as string;
    const subject = formData.get("subject") as string;
    const html = formData.get("html") as string;
    const text = formData.get("text") as string;

    console.log(`📧 From: ${from}, Subject: ${subject}`);

    if (!from) {
      return NextResponse.json({ error: "Missing 'from' field" }, { status: 400 });
    }

    // 1. Verify Sender
    // specific sender matching logic: Extract email from "Name <email@domain.com>" format
    const emailMatch = from.match(/<(.+)>/);
    const senderEmail = (emailMatch ? emailMatch[1] : from).trim().toLowerCase();

    console.log(`🔍 Checking authorized sender: ${senderEmail}`);

    // Check for service role key
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // Create admin client
    const { createClient } = require('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY
    );

    // Case-insensitive lookup using ilike
    const { data: senderData, error: senderError } = await supabaseAdmin
      .from("user_email_senders")
      .select("user_id")
      .ilike("email_address", senderEmail)
      .single();

    if (senderError || !senderData) {
      console.log(`⚠️ Sender not found or verified: ${senderEmail}. Error: ${senderError?.message}`);
      return NextResponse.json({ error: "Sender not authorized" }, { status: 403 });
    }

    const userId = senderData.user_id;
    console.log(`✅ Identified User ID: ${userId}`);

    // 2. Parse Email Content with Gemini
    const contentToParse = html || text;

    const geminiKey = process.env.GEMINI_API_KEY;
    const geminiModel = 'gemini-flash-latest';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

    console.log(`🤖 Calling Gemini for extraction...`);

    const prompt = `
        You are a specialized Travel Confirmation Data Extraction Engine. Extract structured travel details from this email.
        Return a JSON object with this structure:
        {
          "generated_trip_title": "Concise, user-friendly title based on BOTH subject and content (e.g. 'Dinner at The Keg', 'Boat Cruise in Miami', 'Amtrak to Boston', 'Meeting with Client').",
          "events": [
            {
              "event_type": "flight" | "train" | "bus" | "ferry" | "car_rental" | "public_transit" | "taxi" | "hotel" | "vacation_rental" | "hostel" | "cruise" | "camping" | "restaurant" | "bar" | "food_tour" | "tour" | "attraction" | "performance" | "wellness" | "border_control" | "health" | "meeting" | "note" | "other",
              "status": "confirmed" | "cancelled" | "delayed" | "modified",
              "timing": {
                "start_datetime": "ISO 8601 UTC string (YYYY-MM-DDTHH:mm:ssZ)",
                "end_datetime": "ISO 8601 UTC string",
                "timezone": "IANA timezone string (e.g. America/New_York)"
              },
              "location": {
                "name": "Full Name of Airport/Hotel/Restaurant/etc",
                "address": "Full physical address",
                "phone": "Phone number if available",
                "sub_location": {
                  "terminal": "string",
                  "gate": "string",
                  "platform": "string",
                  "room": "string",
                  "table": "string"
                },
                "geo_coordinates": { "lat": number, "lng": number } (optional)
              },
              "confirmation": {
                "confirmation_code": "string",
                "ticket_number": "string",
                "pnr": "string"
              },
              "milestones": [
                { "label": "Check-in Start | Check-out Deadline | Boarding Time | Gate Closes | Departure | Arrival | Table Held Until | Cancellation Deadline", "datetime": "ISO 8601 UTC string" }
              ],
              "provider": { 
                "name": "Company Name",
                "website": "URL if available"
              },
              "operational_info": {
                "party_size": number,
                "notes": "e.g., Anniversary, Dress code: Formal, Window seat",
                "check_in_window": "string",
                "items": ["list", "of", "items", "if", "receipt"]
              },
              "cost": {
                "subtotal": number,
                "tax": number,
                "tip": number,
                "total_amount": number,
                "currency": "USD" | "CAD" | "EUR" | etc,
                "payment_status": "paid" | "guaranteed" | "unpaid"
              }
            }
          ]
        }
        
        Rules:
        - Transportation: Includes flight, train, bus, ferry, car_rental, public_transit, taxi.
        - Lodging: Includes hotel, vacation_rental, hostel, cruise, camping.
        - Culinary: restaurant, bar, food_tour, dining (includes ALL Reservations and Receipts).
        - Activities: tour, attraction, performance, wellness.
        - Admin: border_control, health, meeting, note.
        - Naming Rules:
           - generated_trip_title MUST be clean and concise.
           - NEVER use the raw email subject if it contains codes, 'Fwd:', or 'Confirmation'.
           - Example: If subject is 'Fwd: Your Amtrak ticket for Tomorrow', title should be 'Amtrak to [City]'.
           - If category is 'other', generate a title based on the context (e.g. 'Visit to Museum').
        - Temporal/Milestones: Extract critical markers:
           - Lodging: Check-in Start, Late Arrival info, Check-out Deadline.
           - Transportation: Boarding Time, Gate Closing Time, Departure, Arrival.
           - Culinary: Reservation time, Table hold duration, Cancellation window.
           - General: Any "Must do by" or "Ends at" times found in the content.
        - Temporal: Use ISO 8601. Detect local timezone.
        - Financials: Extract total, tax, tip, currency.
        - Verification: Pull PNR, ticket numbers, and confirmation codes.
        - Logic: If multiple events are found, list them all.
        
        Email Content:
        ${contentToParse.substring(0, 20000)}
        `;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API Error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response");
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // 3. Save to Database
    // We need duplicate check logic here too, similar to manual add
    // For simplicity, we'll just insert for now and let the key constraints handle it if implemented, 
    // or just add it (user can delete dupes).

    // Helper to format trip name
    const firstEvent = parsedData.events?.[0] || {};
    let tripName = (parsedData.generated_trip_title && parsedData.generated_trip_title.trim().length > 0)
      ? parsedData.generated_trip_title
      : subject;
    const type = (firstEvent.event_type || "").toLowerCase();

    // Clean up "Test" subjects if they are clearly placeholders
    const isTestSubject = subject.toLowerCase().startsWith("test") || /^[0-9]+$/.test(subject.trim());

    // Only apply fallback formatting if the AI didn't generate a specific name
    if (!parsedData.generated_trip_title || parsedData.generated_trip_title.trim().length === 0) {
      if (type === "flight") {
        tripName = `Flight to ${firstEvent.location?.name || firstEvent.flight_details?.arrival_airport || 'Destination'}`;
      } else if (['hotel', 'vacation_rental', 'hostel', 'camping', 'cruise', 'lodging'].includes(type)) {
        tripName = `Stay at ${firstEvent.location?.name || firstEvent.provider?.name || 'Lodging'}`;
      } else if (['dining', 'restaurant', 'bar', 'food_tour', 'dining_reservation'].includes(type)) {
        tripName = `Dining at ${firstEvent.location?.name || firstEvent.provider?.name || 'Restaurant'}`;
      } else if (type === "train") {
        tripName = `Train to ${firstEvent.location?.name || "Destination"}`;
      } else if (type === "bus") {
        tripName = `Bus to ${firstEvent.location?.name || "Destination"}`;
      } else if (type === "car_rental") {
        tripName = `Car Rental from ${firstEvent.provider?.name || firstEvent.location?.name || "Company"}`;
      } else if (['tour', 'attraction', 'performance', 'wellness'].includes(type)) {
        tripName = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${firstEvent.location?.name || firstEvent.provider?.name || "Activity"}`;
      } else if (type === "taxi" || type === "public_transit") {
        tripName = `${type === 'taxi' ? 'Taxi' : 'Transit'} to ${firstEvent.location?.name || 'Destination'}`;
      } else if (['border_control', 'health', 'meeting', 'note'].includes(type)) {
        tripName = `${type.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: ${firstEvent.location?.name || firstEvent.provider?.name || subject}`;
      } else {
        // SMART FALLBACK: If nothing matches but we have a location, use it.
        // Especially if the current subject is just "Test 11"
        if (firstEvent.location?.name || firstEvent.provider?.name) {
          tripName = `${firstEvent.location?.name || firstEvent.provider?.name}`;
        }
      }
    }

    const { data: trip, error: tripError } = await supabaseAdmin
      .from("trips")
      .insert([{
        user_id: userId,
        trip_name: tripName,
        parsed_data: {
          ...parsedData,
          extraction_metadata: {
            source: "email_forward",
            email_subject: subject,
            sender: senderEmail,
            extracted_at: new Date().toISOString()
          }
        }
      }])
      .select();

    if (tripError) {
      console.error("Failed to insert trip:", tripError);
      throw tripError;
    }

    console.log(`🎉 Trip saved successfully: ${trip[0].id} for User: ${userId}`);
    return NextResponse.json({ success: true, tripId: trip[0].id });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
