import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY!;

const getSupabaseClient = (req: NextRequest) => {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) return createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        },
    });
};

const formatTripName = (data: any) => {
    // 1. ABSOLUTE PRIORITY: AI-Generated Title at Root
    if (data.generated_trip_title && data.generated_trip_title.trim().length > 0) {
        return data.generated_trip_title;
    }

    const first = data.events?.[0];
    if (!first) {
        return data.extraction_metadata?.email_subject || "Untitled Trip";
    }

    // 2. FALLBACK: AI-Generated Name inside Event (legacy)
    if (first.generated_trip_name && first.generated_trip_name.trim().length > 0) {
        return first.generated_trip_name;
    }

    const type = (first.event_type || "Event").toLowerCase();
    const formattedType = type
        .split("_")
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    // 3. FALLBACK: Smart Naming by Type/Location
    if (type === "flight") {
        return `Flight to ${first.location?.name || first.flight_details?.arrival_airport || "Destination"}`;
    } else if (['hotel', 'vacation_rental', 'hostel', 'camping', 'lodging'].includes(type)) {
        return `Stay at ${first.location?.name || first.provider?.name || "Lodging"}`;
    } else if (['dining', 'restaurant', 'bar', 'food_tour', 'dining_reservation'].includes(type)) {
        return `Dining at ${first.location?.name || first.provider?.name || "Restaurant"}`;
    } else if (type === "train") {
        return `Train to ${first.location?.name || "Destination"}`;
    } else if (type === "bus") {
        return `Bus to ${first.location?.name || "Destination"}`;
    } else if (type === "car_rental") {
        return `Car Rental from ${first.provider?.name || first.location?.name || "Company"}`;
    } else if (['tour', 'attraction', 'performance', 'wellness'].includes(type)) {
        return `${formattedType}: ${first.location?.name || first.provider?.name || "Activity"}`;
    } else if (type === "cruise") {
        return `Cruise on ${first.provider?.name || "Ship"}`;
    } else {
        // FINAL SMART FALLBACK: If we have a location, use it.
        if (first.location?.name || first.provider?.name) {
            return first.location?.name || first.provider?.name;
        }
        return data.extraction_metadata?.email_subject || formattedType;
    }
};

export async function GET(req: NextRequest) {
    try {
        const supabase = getSupabaseClient(req);
        const { data, error } = await supabase
            .from("trips")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const supabase = getSupabaseClient(req);
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tripData } = await req.json();
        const tripName = formatTripName(tripData);

        // Duplicate check logic
        const { data: existingTrips } = await supabase.from("trips").select("parsed_data");

        const isDuplicate = existingTrips?.some((t) => {
            const existingEvents = t.parsed_data?.events || [];
            const newEvents = tripData.events || [];

            if (existingEvents.length === 0 && newEvents.length === 0) {
                return (
                    t.parsed_data?.extraction_metadata?.email_subject ===
                    tripData.extraction_metadata?.email_subject
                );
            }

            return newEvents.some((ne: any) => {
                const newCode = ne.confirmation?.confirmation_code;
                if (!newCode) return false;
                return existingEvents.some(
                    (ee: any) => ee.confirmation?.confirmation_code === newCode
                );
            });
        });

        if (isDuplicate) {
            return NextResponse.json({
                success: false,
                message: "Trip already exists",
                duplicate: true,
            });
        }

        const { data, error } = await supabase
            .from("trips")
            .insert([{ trip_name: tripName, parsed_data: tripData, user_id: user.id }])
            .select();

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
