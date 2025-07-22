import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../../config/db";
import { SessionChatTable } from "../../../../../config/schema";
import { desc, eq } from "drizzle-orm";

// POST: Create a new session
export async function POST(req: NextRequest) {
  const { notes, selectedDoctor, allSuggestions } = await req.json();
  const user = await currentUser();

  try {
    const sessionId = uuidv4();

    const result = await db
      .insert(SessionChatTable)
      .values({
        session_id: sessionId,
        createdBy: user?.primaryEmailAddress?.emailAddress ?? "unknown",
        notes,
        selectedDoctor,
        createdOn: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(result);
  } catch (error) {
    console.error("❌ Session insert error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}

// GET: Fetch a single session or all sessions by user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const user = await currentUser(); // ✅ Required for filtering by user

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId query parameter" },
      { status: 400 }
    );
  }

  try {
    let result;

    if (sessionId === "all") {
      // ✅ Fetch all sessions for the current user
      result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress ?? "unknown"))
        .orderBy(desc(SessionChatTable.id))
    } else {
      // ✅ Fetch a single session
      result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.session_id, sessionId));
    }

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // ✅ Convert bigints to strings safely (for JSON)
    const safeResult = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return NextResponse.json(safeResult);
  } catch (error) {
    console.error("❌ Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session", details: String(error) },
      { status: 500 }
    );
  }
}
function orderBy(arg0: any) {
  throw new Error("Function not implemented.");
}

