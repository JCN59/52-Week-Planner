# Microsite Empire Playbook

A repeatable system for building local lead-generation microsites with Claude Code +
WordPress, ranking them in Google's organic results, and monetizing them — either by
selling the leads to local companies, or by selling the system/sites themselves.

This is the operating manual. The copy-paste prompts live in
[02-PROMPT-LIBRARY.md](02-PROMPT-LIBRARY.md), the sales side in
[03-SELLING-THE-SYSTEM.md](03-SELLING-THE-SYSTEM.md), and the legal/risk notes in
[04-RISKS-AND-COMPLIANCE.md](04-RISKS-AND-COMPLIANCE.md).

---

## The model in one paragraph

A **microsite** is a small (10–30 page) hyper-focused website for one *sub-niche
service* in one *city + surrounding suburbs* — e.g. "slab leak repair in Houston" —
not a general "Houston plumbing" site. Because it is narrower and more genuinely
useful than the incumbents, it can win the organic slot that sits below ads and the
AI Overview. Every site has a tracked phone number and a lead form. The calls and
form fills are the product: you either resell them to a local company
(rank-and-rent / pay-per-lead), or you build and hand the whole asset to the company
(build-and-sell / retainer).

This is the **STAR method** layout: the client's main website ranks in its home
city; microsites capture the secondary and tertiary markets around it.

---

## The 7-piece stack (bottom to top)

| # | Piece | What we use |
|---|-------|-------------|
| 1 | A phone that rings | Call tracking number (CallRail or similar) + lead form |
| 2 | Competitor recon *before* structure | Claude agents reading the current top-3 rankers |
| 3 | Version control | Private GitHub repo — commit before every risky change |
| 4 | The "second brain" | LLM wiki: a folder of markdown files Claude reads every session |
| 5 | Deploy pipeline | Claude Code with SFTP credentials (stored in `.env`, never in chat) |
| 6 | The site | WordPress + custom child theme on a solid parent (Blocksy / GeneratePress / Kadence) |
| 7 | Hosting | Kinsta or Hostinger managed WordPress |

---

## The 14-step build pipeline

Run these in order. Steps 1–5 are research and cost nothing but time — **do not buy
anything until step 5 passes.**

### Phase A — Find a market worth entering (steps 1–5)

1. **Pick a parent industry, then sub-niche down.**
   Ask an LLM: *"What are the most profitable sub-niches within [plumbing / roofing /
   electrical / foundation] for residential?"* You want **high ticket price**
   ($1,500+ jobs) and **specialist intent** — slab leak detection, trenchless sewer
   repair, tankless water heater install — never "plumber near me."

2. **Ask what's locally specific.**
   *"What sub-niches are specific to [city]?"* — e.g. Houston homes sit on slabs
   (no basements), so slab leak detection is a real, recurring local problem.
   Local specificity = less national competition + more genuine usefulness.

3. **Score the SERP by hand.** Google the exact phrase in the exact city and look at
   what's above the first organic result:
   - Ads + Map Pack + organic buried = **walk away** (you'd be fighting Mike Tyson).
   - Ads + AI Overview, **Map Pack below the organics** or absent = **green light** —
     there's a visible organic slot you can own.
   - Score every keyword × city combo. A "B or A map-pack opportunity" is the signal.

4. **Iterate cities, not just keywords.** If the big metro scores badly, try the
   satellite cities (Beaumont, Corpus Christi…) — but also try the reverse: sometimes
   the *bigger* city has the weaker organic competition (in the video, "Houston slab
   leak" beat "Beaumont slab leak"). Let the SERP decide, not your assumptions.

5. **Validate demand with Google Keyword Planner (free).** You need *some* volume —
   even 50–100/mo is fine for a $2,000-ticket service, because one lead can be worth
   hundreds of dollars. Zero volume across every variant = go back to step 1.

### Phase B — Set up the machine (steps 6–9)

6. **Buy an exact-match-ish domain, under $30.**
   Have an LLM generate ~20 variants of `service + city` as one word
   (`houstonslableak.com`, `slableakproshouston.com`) and paste them all into
   Namecheap **Beast Mode** to check availability in one shot. Skip hyphens and
   anything over ~25 characters. (EMDs are a small nudge, not magic — see risks doc.)

7. **Provision hosting + WordPress.** Kinsta/Hostinger, one-click WP install, data
   center near the target city. Grab the **SFTP host, port, username, password**.

8. **Create the project folder + `.env`.** One folder per site. All secrets go in
   `.env` (SFTP creds, later API keys). House rule for Claude: *never paste secrets
   into chat; mask anything from `.env` in every output.* Note: with SFTP access
   Claude can do everything — install plugins, edit themes, write content — it does
   **not** need a wp-admin login, and will sometimes wrongly insist it does. Push back.

9. **Init a private GitHub repo and commit before the first edit.** This is your
   save point before every boss fight. Commit before each major phase; when the AI
   breaks something, roll back instead of debugging forward.

### Phase C — Build the brain (steps 10–11)

10. **Set up the LLM wiki (the "second brain").** A folder of markdown files in the
    repo that Claude reads at the start of every session and updates as it learns:
    - `mission.md` — the niche, the city, the monetization model
    - `business.md` — who answers the phone, service area radius, non-negotiables
    - `seo-rules.md` — your house rules (below)
    - `recon.md` — competitor findings (filled in step 11)
    - `structure.md` — the chosen sitemap (filled in step 12)
    - `decisions.md` — running log of every choice and why

    Without this, every session starts from zero and costs more. With it, **site #2
    takes a fraction of the time** because the brain already knows your preferences.

11. **Competitor recon — the open-book test.** The sites ranking top-3 right now
    *are* the answer key. Send 3+ parallel Claude agents, one per target town, to
    profile the current winners: page inventory, structure/navigation, language
    patterns, and — most importantly — **the gaps** (in the video's niche: nobody
    published pricing, review counts, or insurance guidance — that became the edge).
    File everything into `recon.md`.

### Phase D — Build the site (steps 12–14)

12. **Choose structure from data, then write to house rules.** Have Claude propose
    3 structures (mirror the winners / competitor-informed / hybrid), pick one, lock
    it in `structure.md`. Prefer a **flat URL structure** (every page one level off
    the root). Then build every page to the house rules:
    - The liftable answer sits at the top of every page (AI Overview / featured-snippet bait).
    - Name + service + town identical everywhere (title, H1, footer, schema).
    - Real local knowledge on every location page (soil types, housing age, city permit quirks).
    - **Every claim survivable**: no fake reviews, no invented team members, no fabricated stats.
    - Cite real sources (USDA soil surveys, university research, city data) — link the PDFs.

    **Do the design pass BEFORE the content build** (the video did it backwards and
    regretted it): give Claude 2 reference URLs from big national brands in the niche,
    let it use its browser/vision to study them, and build a child theme that takes
    the best of each. Local sites should look *trustworthy and plain*, not fancy —
    over-designed deters leads.

13. **Expand the service area + capture leads.** One prompt: build 10 more
    location pages for the highest-opportunity suburbs (let Claude pick using logic —
    housing age, foundation type, population), and a 5-question WPForms contact form
    on every page. Add the call-tracking number site-wide. Phone in the header,
    form above the fold.

14. **Schema/AEO pass + launch checklist.** LocalBusiness + Service + FAQPage
    schema on every page; XML sitemap; Google Search Console + Bing Webmaster
    submission; GA4; test the form and the phone number end-to-end. Commit, push,
    done. Then start site #2 — the brain makes it 5× faster.

---

## Operating rhythm after launch

- **Weeks 1–8:** indexation + small content adds (cost guide, FAQ expansions). Don't panic; organic takes 60–120 days in most local niches.
- **Track:** rankings for the target keyword set, calls (with recordings), form fills.
- **When the phone rings consistently** (even 5–10 qualified calls/mo), you have a sellable asset. Move to [03-SELLING-THE-SYSTEM.md](03-SELLING-THE-SYSTEM.md).
- **Scale pattern:** same brain, new city or new sub-niche → new repo, new domain, new Kinsta site. The recon and build prompts are reusable verbatim.

## What makes this defensible

Not the AI — anyone has Claude. The moat is: (1) the **brain** — your accumulated
recon, rules, and decisions compound across sites; (2) **niche/city selection
discipline** — most competitors fight in SERPs they can't win; (3) **genuinely better
pages** — published pricing, real local data, real citations, in niches where nobody
does that. Sites that are actually the best answer survive algorithm updates;
thin doorway clones don't (see risks doc).
