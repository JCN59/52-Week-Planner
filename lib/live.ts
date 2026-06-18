import type { GroupRow, LiveMatch, MatchState } from "./types";
import { TEAMS } from "./worldcup-data";

// ESPN exposes a free, no-auth public sports API. The World Cup league slug is
// "fifa.world". We fetch it server-side and normalize it to our own shapes.
const ESPN = "https://site.api.espn.com/apis";
const TIMEOUT_MS = 8000;

// ESPN sometimes uses different country names than we do. Map them to ours so
// flags and group merging line up.
const NAME_ALIASES: Record<string, string> = {
  USA: "United States",
  "Czech Republic": "Czechia",
  Turkey: "Türkiye",
  "Bosnia and Herzegovina": "Bosnia & Herzegovina",
  "Ivory Coast": "Côte d'Ivoire",
  "Cape Verde": "Cabo Verde",
  "Cape Verde Islands": "Cabo Verde",
  "Congo DR": "DR Congo",
  "DR Congo": "DR Congo",
  "Korea Republic": "South Korea",
  "IR Iran": "Iran",
};

function canonicalName(name: string): string {
  return NAME_ALIASES[name] ?? name;
}

function flagOf(name: string): string {
  return TEAMS.find((t) => t.name === name)?.flag ?? "🏳️";
}

function groupLetterFromText(text: string | undefined | null): string | null {
  if (!text) return null;
  const m = text.match(/Group\s+([A-L])\b/i);
  return m ? m[1].toUpperCase() : null;
}

async function getJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        // ESPN's public API rejects server requests without a browser-like UA.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
    if (!res.ok) throw new Error(`ESPN responded ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---- Scores ----------------------------------------------------------------

// `dates` may be a single day ("20260613") or a range ("20260628-20260719"),
// matching ESPN's scoreboard `dates` query parameter.
export async function fetchScores(dates: string): Promise<LiveMatch[]> {
  const url = `${ESPN}/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dates}`;
  const data = await getJson(url);
  const events: any[] = Array.isArray(data?.events) ? data.events : [];

  return events.map((ev): LiveMatch => {
    const comp = ev?.competitions?.[0] ?? {};
    const competitors: any[] = Array.isArray(comp?.competitors) ? comp.competitors : [];
    const home = competitors.find((c) => c?.homeAway === "home") ?? competitors[0] ?? {};
    const away = competitors.find((c) => c?.homeAway === "away") ?? competitors[1] ?? {};

    const state: MatchState = (ev?.status?.type?.state as MatchState) ?? "pre";
    const status: string =
      ev?.status?.type?.shortDetail || ev?.status?.type?.description || "";

    const noteHeadline = comp?.notes?.[0]?.headline as string | undefined;
    const group = groupLetterFromText(noteHeadline) ?? groupLetterFromText(ev?.name);

    const toCompetitor = (c: any) => {
      const name = canonicalName(c?.team?.displayName ?? c?.team?.name ?? "TBD");
      const rawScore = c?.score;
      const score =
        rawScore === undefined || rawScore === null || rawScore === ""
          ? null
          : Number(rawScore);
      return {
        name,
        flag: flagOf(name),
        score: Number.isNaN(score as number) ? null : score,
        winner: Boolean(c?.winner),
      };
    };

    return {
      id: String(ev?.id ?? `${home?.id}-${away?.id}`),
      date: String(ev?.date ?? ""),
      state,
      status,
      group,
      home: toCompetitor(home),
      away: toCompetitor(away),
    };
  });
}

// ---- Standings -------------------------------------------------------------

function statValue(stats: any[], names: string[]): number {
  for (const n of names) {
    const s = stats.find((x) => x?.name === n || x?.type === n);
    if (s) {
      const v = s.value ?? Number(s.displayValue);
      if (typeof v === "number" && !Number.isNaN(v)) return v;
      const parsed = Number(s.displayValue);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return 0;
}

export async function fetchStandings(): Promise<Record<string, GroupRow[]>> {
  const url = `${ESPN}/v2/sports/soccer/fifa.world/standings`;
  const data = await getJson(url);
  const children: any[] = Array.isArray(data?.children) ? data.children : [];
  if (children.length === 0) throw new Error("No standings groups in ESPN response");

  const groups: Record<string, GroupRow[]> = {};

  for (const child of children) {
    const letter = groupLetterFromText(child?.name) ?? groupLetterFromText(child?.abbreviation);
    if (!letter) continue;
    const entries: any[] = Array.isArray(child?.standings?.entries)
      ? child.standings.entries
      : [];

    groups[letter] = entries.map((e): GroupRow => {
      const stats: any[] = Array.isArray(e?.stats) ? e.stats : [];
      const name = canonicalName(e?.team?.displayName ?? e?.team?.name ?? "TBD");
      const gf = statValue(stats, ["pointsFor", "goalsFor"]);
      const ga = statValue(stats, ["pointsAgainst", "goalsAgainst"]);
      return {
        team: name,
        played: statValue(stats, ["gamesPlayed"]),
        won: statValue(stats, ["wins"]),
        drawn: statValue(stats, ["ties", "draws"]),
        lost: statValue(stats, ["losses"]),
        goalsFor: gf,
        goalsAgainst: ga,
        points: statValue(stats, ["points"]),
      };
    });
  }

  if (Object.keys(groups).length === 0) throw new Error("Could not parse any groups");
  return groups;
}
