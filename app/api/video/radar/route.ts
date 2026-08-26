import { NextRequest, NextResponse } from "next/server";
import { runRadar } from "@/lib/video/pipeline";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Topic radar: turn a niche into a set of arguable angles. */
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const niche = typeof body?.niche === "string" && body.niche.trim() ? body.niche.trim() : "AI video";
  const keywords: string[] = Array.isArray(body?.keywords)
    ? body.keywords.filter((k: unknown): k is string => typeof k === "string")
    : [];
  const count = Math.min(Math.max(Number(body?.count) || 5, 3), 8);

  try {
    return NextResponse.json(await runRadar(niche, keywords, count));
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
