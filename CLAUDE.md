# CLAUDE.md — How to run Chris's businesses in this repo

This repo contains **two things**:

1. **`12-week-year/`** — Chris Nassief's operating system for running three
   businesses on the 12 Week Year method with the Grow OS toolchain. **This
   is the active project.** Start here.
2. **`app/`, `components/`, `lib/`** — a separate "Blueprint Estimator"
   Next.js app (construction plan estimating). Unrelated to the planner;
   leave it alone unless asked.

## The 12 Week Year system

Read `12-week-year/README.md` first. The owner is Chris Nassief
(cnassief@tmes.com). Three businesses:

- **TMES** — The Mortgage Exchange Service (residential mortgage)
- **CNC** — CN Capital Group (commercial mortgage)
- **SGS** — Star Gazer Swag Shop (merch e-commerce)

Current cycle: **Cycle 1, Mon Jun 1 → Sun Aug 23, 2026.** Plan in
`12-week-year/cycle-1-plan.md`.

### The weekly rhythm (drive Chris through this)

- **`/plan-week`** — Monday. Chris picks one content theme per business. He
  decides; never choose themes for him.
- **`/run-week`** — Execute: research (Apify) → create (Higgsfield) → stage
  assets in `12-week-year/assets/ready-to-post/`. Do NOT auto-publish.
- **`/score-week`** — Monday. Score last week's execution % vs. the 85%
  target; flag corrections; update the cycle scoreboard.

### Tools (Grow OS) and the honest distribution gap

- **Research:** Apify (`search-actors`, `fetch-actor-details`, `call-actor`).
- **Create:** Higgsfield (`generate_image`, `generate_video`,
  `show_marketing_studio`, `virality_predictor`).
- **Store:** Drive-style file tools.
- **Leads:** business/prospect enrichment tools.
- **Publishing to Facebook/Instagram:** NOT exposed as a tool in the Claude
  Code session as of this writing. Chris connected Facebook inside Grow OS,
  but it isn't callable from here yet — so **stage content, don't claim to
  publish it.** Verify the publish path before automating the last mile.

### Principles

- **Fewer goals.** One 12-week goal per business. Resist scope creep.
- **Score execution, not results.** Lead measures are the actions Chris
  controls; lag measures are outcomes.
- **The Monday review is sacred** — it's what prevents the drift that stalled
  the first half of 2026.
- **Be honest** about what ran, what failed, and what a tool can't do.
- Respect compliance notes for the mortgage businesses (disclosures,
  accurate claims).
