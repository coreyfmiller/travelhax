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
    { params }: { params: { id: string } }
) {
    try {
        const supabase = getSupabaseClient(req);
        const { id } = params;

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
