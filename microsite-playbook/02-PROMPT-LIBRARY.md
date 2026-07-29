# Prompt Library — the 9 prompts

Copy-paste these into Claude Code (run with permissions relaxed enough to move fast,
in a dedicated project folder with its own git repo). Replace `[BRACKETS]` before
sending. Prompts are numbered in the order you run them.

---

## Prompt 1 — The Primer (run first, every new site)

```
You are Claude Code, my building partner. One boss (me), one worker (you).

MISSION: We are building a local lead-generation microsite for [SERVICE] in
[CITY, STATE]. The site's job is to rank in Google's organic results below the
ads/AI Overview and make a phone ring.

WORKING RULES:
1. Before each task, announce it in one plain sentence so I can follow along.
2. Keep output short and readable. Purposeful stop points between phases.
3. SECRETS: anything that lands in a .env file gets masked in every output,
   forever. Never paste credentials into chat.
4. When something fails, say so plainly and fix it. No hiding problems.
5. Build nothing until I send the build prompt. Research and propose first.

FIRST TASK: Create the skeleton of our LLM wiki in this project folder:
mission.md, business.md, seo-rules.md, recon.md, structure.md, decisions.md.
Then ask me the intake questions for business.md.
```

## Prompt 2 — The Wiki Brain (intake)

```
Interview me to fill out the LLM wiki. Ask about, one section at a time:
- The business: who answers the phone, hours, what happens to a lead
- The niche: services we WILL and WON'T talk about
- Territory: primary city, how far out we go, suburbs we care about
- Non-negotiables: no fake reviews, no invented team, every claim survivable,
  [YOUR OWN RULES]
- Brand voice: plain-spoken local expert, not corporate
- Monetization: [pay-per-lead resale / owned by client] — affects CTAs and legal
  disclosure wording
Write my answers into the wiki files as we go. Confirm each file when done.
```

## Prompt 3 — SFTP + save points

```
I'm going to give you SFTP access to the live WordPress host. Create a .env in
this folder with placeholders for SFTP_HOST, SFTP_PORT, SFTP_USER, SFTP_PASS —
I will fill them in myself. Remember: with SFTP you can do EVERYTHING on the
WordPress install (themes, plugins, content). You do not need a wp-admin login.

Then: init a private git repo, write a .gitignore that excludes .env, and make
the first commit BEFORE any edit. From now on, commit before every major phase
so we can roll back like a video-game save.
```

## Prompt 4 — Competitor recon (the open-book test)

```
Google already published the answer key: the sites ranking top 3 right now.
Spawn parallel agents — one per town — for [TOWN 1], [TOWN 2], [TOWN 3]
(or pick the 3 highest-opportunity towns yourself and say why).

For each town, profile the top 3 organic rankers for "[SERVICE] [TOWN]":
- Page inventory: every page and its target keyword
- Structure & navigation: how the site is organized, URL depth
- Language patterns: headlines, CTAs, trust signals, schema in use
- THE GAPS: what NONE of them do (pricing? review counts? insurance guidance?
  real local data?) — this becomes our unfair advantage

File everything into recon.md, note any honest caveats, and commit.
```

## Prompt 5 — Structure proposal

```
Based on recon.md, propose 3 site structures:
A) MIRROR — copy the common pattern of the winners
B) COMPETITOR-INFORMED — their pattern plus our gap-exploits
C) HYBRID — your best judgment
For each: the page list, the risks, the wins, honest build time. Then argue
for one from the data. [Either: "I choose X" or "Do what you think is best."]
Lock the decision into structure.md. Build nothing yet.
```

## Prompt 6 — Design pass (run BEFORE the content build)

```
Design first, content second. Study these two reference sites with your
browser/vision: [BIG BRAND URL 1] and [BIG BRAND URL 2].
Build a custom child theme on [Blocksy/GeneratePress/Kadence] that takes the
best aspects of each: trustworthy, plain, local — NOT flashy. Phone number in
the header on every page, form above the fold on the homepage. My logo is in
the WordPress media library — find it and use it. Deploy via SFTP, screenshot
the result, and iterate with me until the vibe is right. Commit first.
```

## Prompt 7 — The build (the big one)

```
Build every page in structure.md to the house rules in seo-rules.md:
- Liftable answer at the top of every page (2-3 sentence direct answer)
- Name, service, town identical everywhere they appear
- Real local knowledge on every location page (soil, housing age, permits)
- Every claim survivable: no fake reviews, no invented team, no made-up stats
- Published pricing / cost guidance (our recon gap-exploit)
- Cite real sources: government data, university research — link the actual PDFs

Before writing, spawn research agents for: (1) real [SERVICE] costs and
[STATE] insurance treatment, (2) [CITY] soil/housing/foundation facts,
(3) each target suburb's specifics. Then write, deploy via SFTP, commit.
```

## Prompt 8 — Service area expansion + lead capture

```
Build out 10 more service-location pages for suburbs in closest proximity to
[CITY] with decent population. Don't just pick the nearest — use logic: housing
age, foundation type, likelihood of needing [SERVICE]. Explain your picks.

Then on the contact page: a call-to-action with a 5-question form using the
WPForms plugin (install it via SFTP if needed). Style it to match the theme.
Add the tracking phone number [NUMBER] site-wide. Deploy and commit.
```

## Prompt 9 — Schema / AEO pass

```
Optimize for AI readers and rich results:
- LocalBusiness + Service schema site-wide (NAP identical to the site text)
- FAQPage schema on every page with FAQs
- Breadcrumbs, XML sitemap, robots.txt sanity check
- Verify every liftable answer actually sits above the fold
Validate the schema, fix what fails, deploy, commit, and give me a launch
checklist: Search Console, Bing Webmaster, GA4, form test, phone test.
```

---

## Bonus prompts

**Niche finder (ChatGPT/Claude, before anything):**
```
What are the most profitable sub-niches within residential [INDUSTRY]?
Rank by average ticket price. Then: which of these are specific problems in
[CITY] due to its geology, climate, or housing stock?
```

**Domain variants (paste output into Namecheap Beast Mode):**
```
I want an exact-match-adjacent .com domain for "[SERVICE] [CITY]". Give me 20
variants as one word, no hyphens, under 25 characters, mixing: service+city,
city+service, service+pros+city, shortened service terms.
```

**Talking back (when Claude claims it needs wp-admin credentials):**
```
Wrong — you have SFTP access, which means you can change themes, install
plugins, and edit everything as a super user. Check again.
```
