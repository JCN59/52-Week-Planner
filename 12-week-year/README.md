# The 12 Week Year — Content Engine for 3 Businesses

This is Chris Nassief's operating system for running three businesses on the
**12 Week Year** method (Brian Moran), powered by the **Grow OS** tools wired
into Claude Code.

The businesses:

| Code | Business | Type |
|------|----------|------|
| **TMES** | The Mortgage Exchange Service | Residential mortgage |
| **CNC** | CN Capital Group | Commercial mortgage |
| **SGS** | Star Gazer Swag Shop | Merch / e-commerce |

## The core idea

> **Plan the week → press the button → Claude does the work → score the week.**

You decide *what* to promote (that's the owner's job and your weekly lead
measure). Claude handles the heavy lifting: research, content creation, and
staging. You stay focused because the system tells you, every day, exactly
what to do — and every Monday, exactly where you're falling behind.

## The weekly loop (same for all 3 businesses)

```
1. PROMOTE    What is the message/offer this week?      → you decide (Mon)
2. RESEARCH   Pull raw material (trends, competitors)   → /run-week (Apify)
3. CREATE     Turn research into assets                 → /run-week (Higgsfield)
4. DISTRIBUTE Publish to FB / IG / blog / Ads Manager   → staged, then publish
```

## The two cycles of the second half of 2026

```
CYCLE 1   Mon Jun 1  → Sun Aug 23   (12 weeks)   ← cycle-1-plan.md
BUFFER    Aug 24–30                 (score + replan)
CYCLE 2   Mon Sep 7  → Sun Nov 29   (12 weeks)
WRAP      December                  (close 2026, plan 2027)
```

## The buttons (slash commands in Claude Code)

| Command | When | What it does |
|---------|------|--------------|
| `/plan-week` | Monday (plan) | Walks you through choosing this week's themes per business and writes the weekly plan file. |
| `/run-week` | Monday (execute) | Reads the plan, runs research, generates the content, stages it in `assets/ready-to-post/`, and prints a day-by-day checklist. |
| `/score-week` | Monday (review) | Scores last week's execution % per business against the 85% target and flags what needs a correction. |

## What's automated today vs. what's manual

| Stage | Tool | Status |
|-------|------|--------|
| Research | Apify | ✅ Automated |
| Create (images/video/ads) | Higgsfield Marketing Studio | ✅ Automated |
| Stage assets | Drive / local `assets/` | ✅ Automated |
| Publish to Facebook / Instagram | *(connection lives in Grow OS, not callable from this session yet)* | ⚠️ Manual / verify |
| Publish to blog (WordPress, etc.) | *(connector TBD — Chris setting up)* | ⚠️ Manual for now |

We add the publishing connectors one at a time. v1 gets content **made and
staged**; you publish, then we automate the last mile.

## The one rule that makes this work

Do the **Monday review** (`/score-week`) every single week, without
exception. A simple system you run beats a perfect system you abandon.
