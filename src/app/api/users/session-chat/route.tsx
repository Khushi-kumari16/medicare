import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../../../../../config/db";
import { SessionChatTable } from "../../../../../config/schema";
import { desc, eq } from "drizzle-orm";

// POST: Create a new session
export async function POST(req: NextRequest) {
  const { notes, selectedDoctor, allSuggestions } = await req.json();
  console.log("Getting user data from db...")
  const user = await currentUser();
  console.log("data fetched from user")
  console.log(user)

  try {
    const sessionId = uuidv4();

    const result = await db
      .insert(SessionChatTable)
      //@ts-ignore
      .values({
        session_id: sessionId,
        createdBy: user?.primaryEmailAddress?.emailAddress ?? "unknown",
        notes,
        selectedDoctor: JSON.stringify(selectedDoctor), // Store as JSON string
        allSuggestions: JSON.stringify(allSuggestions || []), // optional: store suggestions
        createdOn: new Date().toISOString(),
      })
      .returning();

    // ✅ Return single object instead of array
    return NextResponse.json(result[0]);
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
  const user = await currentUser();

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing sessionId query parameter" },
      { status: 400 }
    );
  }

  try {
    let result;

    if (sessionId === "all") {
      // Fetch all sessions for the current user
      result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.createdBy, user?.primaryEmailAddress?.emailAddress ?? "unknown"))
        .orderBy(desc(SessionChatTable.id));

      // Optional: parse JSON fields
      const parsedResult = result.map((s: any) => {
        if (s.selectedDoctor && typeof s.selectedDoctor === "string") {
          s.selectedDoctor = JSON.parse(s.selectedDoctor);
        }
        if (s.allSuggestions && typeof s.allSuggestions === "string") {
          s.allSuggestions = JSON.parse(s.allSuggestions);
        }
        return s;
      });

      return NextResponse.json(parsedResult);
    } else {
      // Fetch single session
      result = await db
        .select()
        .from(SessionChatTable)
        .where(eq(SessionChatTable.session_id, sessionId));

      if (!result || result.length === 0) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      // Convert bigints to strings safely
      const safeResult = JSON.parse(
        JSON.stringify(result[0], (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      // ✅ Parse stored JSON fields
      if (safeResult.selectedDoctor && typeof safeResult.selectedDoctor === "string") {
        safeResult.selectedDoctor = JSON.parse(safeResult.selectedDoctor);
      }
      if (safeResult.allSuggestions && typeof safeResult.allSuggestions === "string") {
        safeResult.allSuggestions = JSON.parse(safeResult.allSuggestions);
      }

      return NextResponse.json(safeResult);
    }
  } catch (error) {
    console.error("❌ Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session", details: String(error) },
      { status: 500 }
    );
  }
}
