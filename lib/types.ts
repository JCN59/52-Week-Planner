// ---- Reference data types (the World Cup facts) ----

export type Tier = 1 | 2 | 3 | 4;

export type StarPlayer = {
  name: string;
  position: string;
  why: string;
};

export type Team = {
  name: string;
  flag: string; // emoji flag
  confederation: string; // e.g. "Europe (UEFA)"
  fifaRank: number; // approximate FIFA world ranking, June 2026
  tier: Tier; // draw pot: 1 = strongest
  group: string; // "A" .. "L"
  qualifiedVia: "host" | "direct" | "playoff";
  oneLiner: string; // plain-English description for beginners
  star: StarPlayer;
};

export type GroupRow = {
  team: string; // team name (matches Team.name)
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export type Stage = {
  name: string;
  dates: string;
  plain: string; // beginner explanation
};

export type KeyFixture = {
  date: string;
  label: string;
  detail: string;
  result?: string; // filled in when already played
};

export type GlossaryItem = {
  term: string;
  meaning: string;
};

// ---- Live data types (fetched from ESPN's free public API at runtime) ----

export type MatchState = "pre" | "in" | "post";

export type LiveCompetitor = {
  name: string; // canonical team name (matched to our data when possible)
  flag: string; // emoji flag ("🏳️" if unknown)
  score: number | null;
  winner: boolean;
};

export type LiveMatch = {
  id: string;
  date: string; // ISO timestamp
  state: MatchState;
  status: string; // human label, e.g. "FT", "67'", "8:00 PM"
  group: string | null; // "A".."L" when known
  home: LiveCompetitor;
  away: LiveCompetitor;
};

export type ScoresResponse = {
  source: "live" | "unavailable";
  date: string; // YYYY-MM-DD requested
  matches: LiveMatch[];
  fetchedAt: string;
  error?: string;
};

export type StandingsResponse = {
  source: "live" | "snapshot";
  groups: Record<string, GroupRow[]>;
  fetchedAt: string;
  error?: string;
};

// ---- Daily Briefing types (the AI-generated "what's going on today") ----

export type BriefingTeam = {
  team: string;
  note: string;
};

export type BriefingPlayer = {
  name: string;
  team: string;
  why: string;
};

export type DailyBriefing = {
  date: string;
  headline: string;
  summary: string; // 2-3 plain-English sentences
  topTeams: BriefingTeam[]; // teams looking strongest right now
  playersToWatch: BriefingPlayer[];
  highlights: string[]; // notable moments / results
  buzz: string[]; // storylines / what people are talking about
  beginnerTip: string; // one thing to help a newcomer follow along
  source: "ai" | "mock";
  generatedAt: string;
};
