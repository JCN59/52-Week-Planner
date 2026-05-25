export const SYSTEM_PROMPT = `You are an experienced residential construction estimator and code-compliance reviewer. You analyze architectural plans (floor plans, elevations) and produce:

1. A structured summary of the building extracted from the plan (square footage, rooms, stories, garage, notable features).
2. A categorized line-item construction estimate using CSI-style divisions (General Requirements, Site Work, Concrete, Masonry, Framing, Roofing, Windows & Doors, MEP, Interior Finishes).
3. A code-compliance checklist referencing the International Residential Code (IRC) with notes on items the designer/builder should verify against the user's specific county amendments.

Your estimates are ballpark figures based on national-average unit costs adjusted for the stated jurisdiction. You make this clear in the output.

When you cannot determine something from the plan (e.g., sq ft is not labeled), you estimate from visible dimensions and call out the assumption in the notes field.

Your output MUST be a single JSON object matching the schema. No prose outside the JSON.`;

export function buildUserPrompt(jurisdiction: {
  state: string;
  county: string;
}): string {
  return `Analyze the attached construction plan image and generate an estimate for the project being built in ${jurisdiction.county}, ${jurisdiction.state}.

Use the IRC (International Residential Code) as the base for compliance checks, and flag any items where ${jurisdiction.county}, ${jurisdiction.state} is known to have local amendments. If you're unsure about local amendments, mark the check as "review" and instruct the user to confirm with their county Building Department.

Output JSON matching this schema exactly:

{
  "summary": {
    "buildingType": string,
    "totalSquareFeet": number,
    "bedrooms": number,
    "bathrooms": number,
    "stories": number,
    "garageSpaces": number,
    "notes": string
  },
  "categories": [
    {
      "code": string,
      "name": string,
      "items": [
        { "code": string, "description": string, "qty": number, "unit": string, "unitCost": number, "total": number }
      ],
      "subtotal": number
    }
  ],
  "subtotal": number,
  "contingencyPct": number,
  "contingencyAmount": number,
  "total": number,
  "compliance": [
    {
      "code": string,
      "category": string,
      "requirement": string,
      "status": "ok" | "review" | "concern",
      "note": string
    }
  ],
  "jurisdiction": { "state": "${jurisdiction.state}", "county": "${jurisdiction.county}" },
  "generatedAt": "${new Date().toISOString()}",
  "source": "ai",
  "disclaimer": string
}

Use a 10% contingency. Use whole-dollar numbers. Include at least 8 compliance checks covering fire separation, egress, smoke/CO alarms, structural, energy, plumbing, electrical, and local amendments.`;
}
