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

    // Use the same prompt logic as the manual parse, but simplified for backend
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
        Extract travel details from this email.
        Return a JSON object with this structure:
        {
          "events": [
            {
              "event_type": "flight" | "hotel" | "car_rental" | "train" | "other",
              "timing": {
                "start_datetime": "ISO 8601 UTC string (YYYY-MM-DDTHH:mm:ssZ)",
                "end_datetime": "ISO 8601 UTC string"
              },
              "location": {
                "name": "Airport/Hotel Name",
                "address": "Full address if available",
                "geo_coordinates": { "lat": number, "lng": number } (optional)
              },
              "confirmation": {
                "confirmation_code": "string",
                "ticket_number": "string"
              },
              "provider": { "name": "Airline/Hotel Chain" },
              "flight_details": { // Optional, only for flights
                "flight_number": "string",
                "airline_code": "string",
                "departure_airport": "IATA code",
                "arrival_airport": "IATA code",
                "seat_number": "string",
                "gate": "string"
              },
              "hotel_details": { // Optional, only for hotels
                "room_type": "string",
                "check_in_time": "string", 
                "check_out_time": "string"
              },
              "cost": {
                "total_amount": number,
                "currency": "USD" | "EUR" | etc
              }
            }
          ]
        }
        
        Important:
        - If multiple events are found (e.g. Flight 1, Flight 2), list them all.
        - Ensure dates are in future (relative to today).
        - If specific details are missing, omit the field or use null.
        
        Email Content:
        ${contentToParse.substring(0, 20000)} // Truncate to avoid token limits
        `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Extract JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to extract JSON from Gemini response");
    }

    const parsedData = JSON.parse(jsonMatch[0]); // TODO: safeParse

    // 3. Save to Database
    // We need duplicate check logic here too, similar to manual add
    // For simplicity, we'll just insert for now and let the key constraints handle it if implemented, 
    // or just add it (user can delete dupes).

    // Helper to format trip name
    const firstEvent = parsedData.events?.[0] || {};
    let tripName = subject;
    if (firstEvent.event_type === 'flight') {
      tripName = `Flight to ${firstEvent.location?.name || firstEvent.flight_details?.arrival_airport || 'Destination'}`;
    } else if (firstEvent.event_type === 'hotel') {
      tripName = `Stay at ${firstEvent.location?.name || 'Hotel'}`;
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

    console.log(`🎉 Trip saved successfully: ${trip[0].id}`);
    return NextResponse.json({ success: true, tripId: trip[0].id });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
