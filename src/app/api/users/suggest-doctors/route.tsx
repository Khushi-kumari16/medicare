import { NextRequest, NextResponse } from "next/server";
import { AIDoctorAgents } from "../../../../../shared/list";

export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  const apiKey = process.env.OPEN_ROUTER_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing OPEN_ROUTER_API_KEY in environment variables.");
    return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-dev-72b:free",
        messages: [
          {
            role: "system",
            content: `You are a medical assistant. Use this doctor database:\n\n${JSON.stringify(
              AIDoctorAgents
            )}`,
          },
          {
            role: "user",
            content: `Given the user's symptoms: "${notes}", respond ONLY with raw JSON in this format:

{
  "suggested_doctors": [
    { "id": number, "specialist": "string" }
  ]
}

Do NOT include markdown (like \`\`\`), explanations, or extra text. Just respond with valid JSON.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenRouter API Error:", data);
      return NextResponse.json({ error: data }, { status: response.status });
    }

    const rawResp = data.choices?.[0]?.message?.content ?? "No response from model.";
    return NextResponse.json({ rawResp });
  } catch (error) {
    console.error("❌ Request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
