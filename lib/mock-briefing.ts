import type { DailyBriefing } from "./types";

// Fallback used when ANTHROPIC_API_KEY is not set, so the app is fully usable
// out of the box. Reflects the seeded snapshot in worldcup-data.ts.
export function buildMockBriefing(today: string): DailyBriefing {
  return {
    date: today,
    headline: "The World Cup is underway — and the hosts are flying!",
    summary:
      "The 2026 World Cup has kicked off across the USA, Canada and Mexico. The opening days belonged to the home teams: the United States hammered Paraguay 4–1, and Mexico got off to a winning start. The biggest names — Argentina, Spain, France, England, Brazil and Portugal — are still to come, so the best is yet to arrive.",
    topTeams: [
      { team: "United States", note: "Co-hosts opened with a statement 4–1 win over Paraguay." },
      { team: "Argentina", note: "Defending champions and the world's #1 team — Messi's last dance." },
      { team: "Spain", note: "Reigning European champions and many people's favorite to win it all." },
      { team: "France", note: "Loaded with talent and led by the electric Kylian Mbappé." },
      { team: "Mexico", note: "Co-hosts started with a clean-sheet win in front of their home fans." },
      { team: "Brazil", note: "Five-time champions — always a threat to go all the way." },
    ],
    playersToWatch: [
      { name: "Lionel Messi", team: "Argentina", why: "The legend, almost certainly playing his final World Cup." },
      { name: "Kylian Mbappé", team: "France", why: "Possibly the fastest, most dangerous attacker on the planet." },
      { name: "Lamine Yamal", team: "Spain", why: "An 18-year-old phenom — the most exciting young player in the world." },
      { name: "Erling Haaland", team: "Norway", why: "A goal-scoring machine at his very first World Cup." },
      { name: "Christian Pulisic", team: "United States", why: "The host nation's biggest star, already firing." },
      { name: "Jude Bellingham", team: "England", why: "Real Madrid superstar driving England's title hopes." },
    ],
    highlights: [
      "United States 4–1 Paraguay — a dream start for the co-hosts.",
      "Mexico 2–0 South Africa — winning the opening match at the iconic Azteca stadium.",
      "South Korea 2–1 Czechia — a dramatic late finish.",
      "Canada 1–1 Bosnia & Herzegovina — a hard-fought draw to open Group B.",
    ],
    buzz: [
      "Can a host nation (USA, Canada or Mexico) make a deep run on home soil?",
      "Messi vs Ronaldo, one last time — both legends are here, likely for the final World Cup of their careers.",
      "Spain and Argentina are the two favorites — a dream final everyone wants to see.",
      "Norway's Erling Haaland is finally on the World Cup stage for the first time.",
      "This is the first 48-team World Cup ever — bigger than any before it.",
    ],
    beginnerTip:
      "Don't try to follow all 48 teams. Pick 2–3 to root for — maybe a host (USA/Canada/Mexico), a favorite (Spain or Argentina), and a fun underdog (like Curaçao or Cabo Verde) — and just follow their games.",
    source: "mock",
    generatedAt: new Date().toISOString(),
  };
}
