import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../../config/db";
import { SessionChatTable } from "../../../../../config/schema";

const REPORT_GEN_PROMPT = `You are an AI Medical Voice Agent that just finished a patient conversation.
Based on doctor AI agent info and the conversation between the AI medical agent and the user, 
please generate a detailed medical summary and suggestions in the following structure:

{
  "sessionId": "string",
  "agent": "string",
  "user": "string",
  "timestamp": "ISO Date string",
  "chiefComplaint": "string",
  "summary": "string",
  "symptoms": ["symptom1", "symptom2"],
  "duration": "string",
  "severity": "string",
  "medicationsMentioned": ["med1", "med2"],
  "recommendations": ["rec1", "rec2"]
}

Only include valid fields. Respond with nothing else.`;

const apiKey = process.env.OPEN_ROUTER_API_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { sessionId, sessionDetail, messages } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: "OpenRouter API key missing" }, { status: 500 });
    }

    if (!sessionId || !sessionDetail || !messages) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userPrompt = `Doctor Info: ${JSON.stringify(
      sessionDetail.selectedDoctor || {}
    )}\nConversation:\n${messages.map((m: any) => `${m.role}: ${m.text}`).join("\n")}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mixtral-8x7b-instruct",
        messages: [
          { role: "system", content: REPORT_GEN_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.choices?.[0]?.message?.content) {
      console.error("❌ AI response error:", data);
      return NextResponse.json({ error: "AI failed to return a valid report." }, { status: 500 });
    }

    const rawText = data.choices[0].message.content.trim();
    const firstJsonMatch = rawText.match(/\{[\s\S]*?\}/);

    if (!firstJsonMatch) {
      console.error("❌ Malformed AI output:", rawText);
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

    const parsedReport = JSON.parse(firstJsonMatch[0]);

    const finalReport = {
      sessionId: parsedReport.sessionId || sessionId,
      agent: parsedReport.agent || sessionDetail.selectedDoctor?.specialist || "AI Doctor",
      user: parsedReport.user || "Anonymous",
      timestamp: parsedReport.timestamp || new Date().toISOString(),
      chiefComplaint: parsedReport.chiefComplaint || "N/A",
      summary: parsedReport.summary || "N/A",
      symptoms: parsedReport.symptoms || [],
      duration: parsedReport.duration || "Unknown",
      severity: parsedReport.severity || "Unknown",
      medicationsMentioned: parsedReport.medicationsMentioned || [],
      recommendations: parsedReport.recommendations || [],
    };

    await db
      .update(SessionChatTable)
      .set({
        report: finalReport,
        conversation: messages,
      })
      .where(eq(SessionChatTable.session_id, sessionId));

    console.log("✅ Report saved to DB:", finalReport);
    return NextResponse.json({ report: finalReport });
  } catch (error: any) {
    console.error("❌ Medical report generation failed:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
