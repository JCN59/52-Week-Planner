import { TEAMS, GROUP_STANDINGS, FAVORITES, SNAPSHOT_DATE } from "./worldcup-data";

export const SYSTEM_PROMPT = `You are a friendly soccer (football) explainer writing a daily World Cup briefing for a complete beginner who does NOT follow soccer.

Rules:
- Keep it SIMPLE. No jargon. If you must use a soccer term, explain it in plain words.
- Be warm, fun, and encouraging — like a knowledgeable friend catching someone up.
- Be concrete: name teams and players, mention scores when relevant.
- This is the 2026 World Cup hosted by the USA, Canada and Mexico (48 teams).
- Your output MUST be a single JSON object matching the schema. No prose outside the JSON.`;

export function buildUserPrompt(today: string, liveContext?: string): string {
  const teamLines = TEAMS.map(
    (t) =>
      `${t.name} (Group ${t.group}, tier ${t.tier}, FIFA rank ~${t.fifaRank}, star: ${t.star.name})`,
  ).join("\n");

  const standingsLines = Object.entries(GROUP_STANDINGS)
    .map(([g, rows]) => {
      const r = rows
        .map(
          (x) =>
            `${x.team} ${x.points}pt (${x.won}-${x.drawn}-${x.lost}, ${x.goalsFor}-${x.goalsAgainst})`,
        )
        .join("; ");
      return `Group ${g}: ${r}`;
    })
    .join("\n");

  const liveBlock = liveContext
    ? `\nLIVE DATA (real results fetched just now — prioritize this over the snapshot below):\n${liveContext}\n`
    : "";

  return `Write today's beginner-friendly World Cup briefing for ${today}.

Pre-tournament favorites: ${FAVORITES.join(", ")}.
${liveBlock}

The 48 teams:
${teamLines}

Known standings snapshot (as of ${SNAPSHOT_DATE} — early in the group stage; many teams have not played yet):
${standingsLines}

Using this as a foundation, write an engaging daily update. Where the snapshot doesn't have live results, speak in terms of who is strongest, what to look forward to, and the storylines — do not invent specific final scores that aren't in the snapshot.

Output JSON matching this schema exactly:

{
  "date": "${today}",
  "headline": string,                         // a short, punchy headline
  "summary": string,                          // 2-3 plain-English sentences catching a newcomer up
  "topTeams": [                               // 4-6 teams looking strongest right now
    { "team": string, "note": string }        // note = one simple sentence why
  ],
  "playersToWatch": [                         // 4-6 standout players
    { "name": string, "team": string, "why": string }
  ],
  "highlights": [ string ],                   // 3-5 short bullet points of notable results/moments
  "buzz": [ string ],                         // 3-5 short bullet points: storylines people are talking about
  "beginnerTip": string,                      // one friendly tip to help a newcomer follow along today
  "source": "ai",
  "generatedAt": "${new Date().toISOString()}"
}

Keep every string short and jargon-free.`;
}
