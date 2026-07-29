# LLM Wiki Templates — the "second brain" starter kit

Copy these six files into every new site's project folder before Prompt 1 finishes,
or let Claude create them and fill them via the intake interview (Prompt 2).
Claude reads this folder at the start of every session and writes back to it as
decisions get made — that's what makes site #2 build in hours instead of days.

---

## `mission.md`
```markdown
# Mission
- Service (sub-niche): [e.g. slab leak detection & repair]
- Market: [primary city, state] + suburbs (see business.md)
- Domain: [houstonslableak.com]
- Monetization: [pay-per-lead resale | client-owned build]
- Success = the phone rings with qualified callers from organic Google/Bing.
- Current phase: [research | build | ranking | monetized]
```

## `business.md`
```markdown
# Business Facts (single source of truth for NAP + claims)
- Site brand name: [Houston Slab Leak Pros]
- Who answers the phone: [me | partner company + license #]
- Tracking number: [xxx-xxx-xxxx]  (never publish the carrier number)
- Hours: [24/7 answering | M-F 8-6]
- Service area: [primary city] + [list suburbs, updated as pages are built]
- Services we DO talk about: [...]
- Services we DON'T: [...]
- License/compliance line for footer: [RMP #____ | referral-service disclosure]
```

## `seo-rules.md`
```markdown
# House Rules (non-negotiable, apply to every page)
1. Liftable answer at the top of every page — 2-3 sentences a machine can quote.
2. Brand name, service, town: identical strings everywhere (title, H1, footer, schema).
3. Flat URLs: every page one level off root. No /services/category/page nesting.
4. Every claim survivable. No fake reviews, invented staff, fabricated history.
5. Real local knowledge per location page: soil, housing age, permit quirks.
6. Publish pricing/cost guidance (recon gap-exploit).
7. Cite real sources; link the actual PDFs (USDA, university, city data).
8. Design: plain and trustworthy beats pretty. Phone in header, form above fold.
9. Schema: LocalBusiness + Service sitewide, FAQPage where FAQs exist.
10. Voice: plain-spoken local expert. Short sentences. No corporate filler.
```

## `recon.md`
```markdown
# Competitor Recon
_Last updated: [date] — Prompt 4 output lives here._

## Towns scouted
| Town | Top 3 rankers | Notes |
|---|---|---|

## Common patterns (price of entry)
- [every winner has X...]

## Gaps (our unfair advantage)
- [none publish pricing...]

## Honest caveats
- [what we assumed or couldn't verify]
```

## `structure.md`
```markdown
# Site Structure — LOCKED [date]
Chosen option: [A mirror | B competitor-informed | C hybrid] because [one line].

| URL | Page | Target keyword | Status |
|---|---|---|---|
| / | Home | [service] [city] tx | [ ] |
| /[service]-cost | Cost guide | how much does [service] cost [city] | [ ] |
| /[suburb-1] | Location | [service] [suburb 1] tx | [ ] |
```

## `decisions.md`
```markdown
# Decision Log (append-only)
| Date | Decision | Why | Reversible? |
|---|---|---|---|
| [date] | Chose [niche] over [alt] | SERP score, map pack below organics | yes |
| [date] | Chose [city] over [alt] | keyword planner volume | yes |
```
