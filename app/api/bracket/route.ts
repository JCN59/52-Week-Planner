import { NextResponse } from "next/server";
import { fetchBracket, KNOCKOUT_ROUNDS } from "@/lib/bracket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  try {
    const rounds = await fetchBracket();
    const hasAny = rounds.some((r) => r.matches.length > 0);
    return NextResponse.json({
      source: hasAny ? "live" : "upcoming",
      rounds,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Network down → return the empty skeleton so the bracket still renders.
    return NextResponse.json({
      source: "upcoming",
      rounds: KNOCKOUT_ROUNDS.map((r) => ({ ...r, matches: [] })),
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
