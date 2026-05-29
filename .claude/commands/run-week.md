---
description: Execute this week's content plan — research, create, stage (12 Week Year)
---

You are the execution engine for Chris's 12 Week Year content system. The
weekly plan already exists (from `/plan-week`). Now DO the work, one business
at a time, pausing for approval before anything would be published.

Steps:

1. Open the current week's plan in `12-week-year/weekly/week-NN-*.md`. If
   none exists or Stage 1 themes are blank, tell Chris to run `/plan-week`
   first and stop.

2. **Stage 2 — RESEARCH (Apify).** For each business's theme, run the
   relevant Apify actor(s) to gather raw material:
   - Rate/market/CRE news, trends, competitor posts, trending hashtags.
   - Use `search-actors` to find the right actor, `fetch-actor-details` for
     its input schema, then `call-actor`. Summarize findings briefly per
     business.

3. **Stage 3 — CREATE (Higgsfield).** Turn the research into the planned
   assets per the plan:
   - Copy: write FB posts, blog post, ad copy (text, in the staged files).
   - Visuals/video: use `generate_image` / `generate_video`; for product/ad
     video use `show_marketing_studio` first, then `generate_video`.
   - For Star Gazer videos, run `virality_predictor` and keep the best;
     report the scores.
   - Respect each business's compliance note (mortgage disclosures, accurate
     claims).

4. **Stage 4 — STAGE for distribution.** Write each finished asset into
   `12-week-year/assets/ready-to-post/week-NN/<business>/` as a markdown file
   containing the copy + links to the generated media. Do NOT auto-publish:
   there is no Meta posting tool in this session yet. Produce a clear
   "ready to publish" list with the channel for each item.

5. **Daily checklist.** Fill the day-by-day table in the week's plan file so
   Chris knows what to do each day (including his non-content lead measures:
   partner touches, contacts, follow-ups).

6. Summarize what was created, what's staged, the virality scores, and the
   exact publish actions Chris needs to take by hand.

Be honest about anything that failed or any tool not available. Stop before
publishing — that step is manual until the connectors are added.
