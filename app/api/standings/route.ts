import { NextResponse } from "next/server";
import { fetchStandings } from "@/lib/live";
import { GROUP_STANDINGS } from "@/lib/worldcup-data";
import type { StandingsResponse } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<StandingsResponse>> {
  try {
    const groups = await fetchStandings();
    return NextResponse.json({
      source: "live",
      groups,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    // Fall back to our curated snapshot so the Groups view always works.
    return NextResponse.json({
      source: "snapshot",
      groups: GROUP_STANDINGS,
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
