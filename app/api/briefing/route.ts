import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildMockBriefing } from "@/lib/mock-briefing";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import { fetchScores, fetchStandings } from "@/lib/live";
import type { DailyBriefing } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

// Pull real results (if reachable) so the AI briefing reflects what actually
// happened. Returns a compact text block, or undefined if the network is down.
async function buildLiveContext(date: string): Promise<string | undefined> {
  const yyyymmdd = date.replace(/-/g, "");
  const parts: string[] = [];
  try {
    const matches = await fetchScores(yyyymmdd);
    const played = matches.filter((m) => m.state !== "pre");
    if (played.length) {
      parts.push(
        "Results/in-play today: " +
          played
            .map((m) => `${m.home.name} ${m.home.score ?? "-"}–${m.away.score ?? "-"} ${m.away.name} (${m.status})`)
            .join("; "),
      );
    }
  } catch {
    /* ignore */
  }
  try {
    const groups = await fetchStandings();
    const lines = Object.entries(groups).map(([g, rows]) => {
      const sorted = [...rows].sort((a, b) => b.points - a.points);
      return `Group ${g}: ${sorted.map((r) => `${r.team} ${r.points}pt`).join(", ")}`;
    });
    if (lines.length) parts.push("Current standings:\n" + lines.join("\n"));
  } catch {
    /* ignore */
  }
  return parts.length ? parts.join("\n") : undefined;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));
  const today: string =
    typeof body?.date === "string" && body.date
      ? body.date
      : new Date().toISOString().slice(0, 10);

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No key → return a fully-usable mock briefing so the app works out of the box.
  if (!apiKey) {
    return NextResponse.json(buildMockBriefing(today));
  }

  const client = new Anthropic({ apiKey });
  const liveContext = await buildLiveContext(today);

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserPrompt(today, liveContext) }],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              date: { type: "string" },
              headline: { type: "string" },
              summary: { type: "string" },
              topTeams: { type: "array" },
              playersToWatch: { type: "array" },
              highlights: { type: "array" },
              buzz: { type: "array" },
              beginnerTip: { type: "string" },
              source: { type: "string" },
              generatedAt: { type: "string" },
            },
            required: [
              "date",
              "headline",
              "summary",
              "topTeams",
              "playersToWatch",
              "highlights",
              "buzz",
              "beginnerTip",
            ],
            additionalProperties: true,
          },
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Model returned no text content" },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(textBlock.text) as DailyBriefing;
    parsed.source = "ai";
    if (!parsed.generatedAt) parsed.generatedAt = new Date().toISOString();
    return NextResponse.json(parsed);
  } catch (error) {
    // On any API failure, fall back to the mock so the user still gets a briefing.
    if (error instanceof Anthropic.APIError) {
      const mock = buildMockBriefing(today);
      return NextResponse.json(mock);
    }
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
