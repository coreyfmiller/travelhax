import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt, fileData, mimeType } = await req.json() || {};
        console.log("Parsing Request:", { hasPrompt: !!prompt, hasFile: !!fileData, mimeType });

        if (!prompt && !fileData) {
            return NextResponse.json({ error: "Prompt or file data is required" }, { status: 400 });
        }

        const key = process.env.GEMINI_API_KEY;
        console.log("API Key Status:", key ? "Defined (starts with " + key.substring(0, 4) + ")" : "Undefined");

        const model = 'gemini-1.5-flash-latest';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

        const parts: any[] = [{ text: prompt }];

        if (fileData && mimeType) {
            parts.push({
                inline_data: {
                    mime_type: mimeType,
                    data: fileData
                }
            });
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: parts
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Parse API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
