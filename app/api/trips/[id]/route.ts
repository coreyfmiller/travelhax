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

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabaseClient(req);
        const { id } = await params;

        const { data, error } = await supabase
            .from("trips")
            .delete()
            .eq("id", id)
            .select();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const supabase = getSupabaseClient(req);
        const { id } = await params;
        const body = await req.json();

        // Update the parsed_data field
        // We assume the body contains the Full Trip Object or just the fields to update
        // For simplicity, we'll expect { tripData: ... } or just merge the body into parsed_data

        // Fetch existing trip first to merge deep data if needed, but for now let's just update specific fields
        // or replace the parsed_data content.

        const { data, error } = await supabase
            .from("trips")
            .update({
                trip_name: body.trip_name,
                parsed_data: body.parsed_data
            })
            .eq("id", id)
            .select();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
