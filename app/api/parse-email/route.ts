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
        console.log("API Key Status:", key ? "Defined (ends with " + key.slice(-4) + ")" : "Undefined");

        const model = 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;
        console.log("Calling Gemini URL:", url.replace(key || "", "HIDDEN_KEY"));

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

        console.log("Gemini Response Status:", response.status);
        const responseText = await response.text();
        console.log("Gemini Response Body:", responseText.substring(0, 500)); // Log first 500 chars

        if (!response.ok) {
            if (response.status === 429) {
                return NextResponse.json({ error: "Gemini AI is busy (Rate Limit). Please wait a minute and try again." }, { status: 429 });
            }
            throw new Error(`Gemini API Error: ${response.status} - ${responseText}`);
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse Gemini JSON:", responseText);
            throw new Error("Invalid JSON response from Gemini");
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Parse API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
