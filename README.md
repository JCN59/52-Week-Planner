# Blueprint Estimator

Upload construction plans → Claude extracts the building → get a line-item estimate and code-compliance checklist for your county.

## What it does

1. **Upload a plan image** (floor plan, elevation) — PNG/JPEG/WebP/GIF, up to 10 MB.
2. **Pick state + county** — used for jurisdiction-specific code compliance notes.
3. **Get an estimate** with CSI-style line items (General Requirements, Site Work, Concrete, Masonry, Framing, Roofing, MEP, Finishes) plus a 10% contingency.
4. **Get a code-compliance checklist** referencing IRC sections relevant to single-family residential construction.

## Limitations (read this)

- **Ballpark only.** Real construction estimates require local takeoffs, current material/labor pricing, and contractor quotes.
- **Compliance is informational, not a substitute for licensed review.** A licensed architect, engineer, or building official must review plans before permitting.
- **Local amendments.** The IRC is the base; your county may have amendments. Always verify with the local Building Department.

## Setup

```sh
npm install
cp .env.example .env.local
# Edit .env.local and add ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Open http://localhost:3000.

**Without an API key:** the app returns mock data so you can preview the UI. Real plan analysis requires `ANTHROPIC_API_KEY` set in `.env.local`.

## Tech

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Claude API (Opus 4.7) for vision-based plan analysis
- Structured JSON output via `output_config.format`

## Project structure

```
app/
  api/analyze/route.ts   # POST endpoint: image + jurisdiction → estimate
  page.tsx               # main UI
  layout.tsx
  globals.css            # blueprint-themed styling
components/
  UploadForm.tsx
  EstimateResults.tsx
  CodeCompliance.tsx
lib/
  types.ts               # AnalysisResult, LineItem, ComplianceCheck
  prompt.ts              # Claude system + user prompts
  mock-estimate.ts       # fallback used when no API key
  jurisdictions.ts       # list of US states
```
