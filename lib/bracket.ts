import type { LiveMatch } from "./types";
import { fetchScores } from "./live";

export type KnockoutRound = {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD (inclusive)
  end: string; // YYYY-MM-DD (inclusive)
  expected: number; // how many matches this round has
  plain: string; // beginner one-liner
};

// The 2026 knockout structure. 32 teams enter the Round of 32; the winner of
// each game advances until one team is left.
export const KNOCKOUT_ROUNDS: KnockoutRound[] = [
  { id: "r32", name: "Round of 32", start: "2026-06-28", end: "2026-07-03", expected: 16,
    plain: "32 teams, 16 games. Lose and you go home." },
  { id: "r16", name: "Round of 16", start: "2026-07-04", end: "2026-07-07", expected: 8,
    plain: "Down to 16 teams." },
  { id: "qf", name: "Quarter-finals", start: "2026-07-09", end: "2026-07-11", expected: 4,
    plain: "The final 8 — like the 'Elite Eight'." },
  { id: "sf", name: "Semi-finals", start: "2026-07-14", end: "2026-07-15", expected: 2,
    plain: "The 'Final Four'! Win to reach the final." },
  { id: "third", name: "Third-place", start: "2026-07-18", end: "2026-07-18", expected: 1,
    plain: "The two semi-final losers play for 3rd." },
  { id: "final", name: "Final", start: "2026-07-19", end: "2026-07-19", expected: 1,
    plain: "Two teams. One trophy. World Champions." },
];

export type BracketRound = KnockoutRound & { matches: LiveMatch[] };

function dayOf(iso: string): string {
  return iso.slice(0, 10);
}

function roundForDate(day: string): KnockoutRound | undefined {
  return KNOCKOUT_ROUNDS.find((r) => day >= r.start && day <= r.end);
}

// Fetch the entire knockout window in one ESPN call and bucket matches by round.
export async function fetchBracket(): Promise<BracketRound[]> {
  const start = KNOCKOUT_ROUNDS[0].start.replace(/-/g, "");
  const end = KNOCKOUT_ROUNDS[KNOCKOUT_ROUNDS.length - 1].end.replace(/-/g, "");
  const matches = await fetchScores(`${start}-${end}`);

  const byRound: Record<string, LiveMatch[]> = {};
  for (const m of matches) {
    const r = m.date ? roundForDate(dayOf(m.date)) : undefined;
    if (!r) continue;
    (byRound[r.id] ??= []).push(m);
  }

  return KNOCKOUT_ROUNDS.map((r) => ({
    ...r,
    matches: (byRound[r.id] ?? []).sort((a, b) => a.date.localeCompare(b.date)),
  }));
}
