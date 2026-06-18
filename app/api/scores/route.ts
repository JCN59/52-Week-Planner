import { NextRequest, NextResponse } from "next/server";
import { fetchScores } from "@/lib/live";
import type { ScoresResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse<ScoresResponse>> {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const yyyymmdd = date.replace(/-/g, "");

  try {
    const matches = await fetchScores(yyyymmdd);
    return NextResponse.json({
      source: "live",
      date,
      matches,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Network blocked / API down → tell the client so it can show a friendly note.
    return NextResponse.json({
      source: "unavailable",
      date,
      matches: [],
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
