import type { AnalysisResult } from "./types";

export function buildMockEstimate(jurisdiction: {
  state: string;
  county: string;
}): AnalysisResult {
  const categories = [
    {
      code: "01",
      name: "General Requirements",
      items: [
        { code: "01.01", description: "Project Management", qty: 1, unit: "LS", unitCost: 3500, total: 3500 },
        { code: "01.02", description: "Permits & Fees", qty: 1, unit: "LS", unitCost: 1200, total: 1200 },
        { code: "01.03", description: "Temporary Facilities", qty: 1, unit: "LS", unitCost: 1000, total: 1000 },
      ],
      subtotal: 5700,
    },
    {
      code: "02",
      name: "Site Work",
      items: [
        { code: "02.01", description: "Clearing & Grubbing", qty: 1, unit: "LS", unitCost: 1800, total: 1800 },
        { code: "02.02", description: "Excavation", qty: 1, unit: "LS", unitCost: 4200, total: 4200 },
        { code: "02.03", description: "Backfill & Compaction", qty: 1, unit: "LS", unitCost: 2100, total: 2100 },
      ],
      subtotal: 8100,
    },
    {
      code: "03",
      name: "Concrete",
      items: [
        { code: "03.01", description: "Foundation", qty: 1, unit: "LS", unitCost: 8500, total: 8500 },
        { code: "03.02", description: "Slab on Grade", qty: 1, unit: "LS", unitCost: 6200, total: 6200 },
      ],
      subtotal: 14700,
    },
    {
      code: "04",
      name: "Masonry",
      items: [
        { code: "04.01", description: "CMU Foundation Walls", qty: 1, unit: "LS", unitCost: 6300, total: 6300 },
      ],
      subtotal: 6300,
    },
    {
      code: "05",
      name: "Framing",
      items: [
        { code: "05.01", description: "Wood Framing", qty: 1, unit: "LS", unitCost: 18500, total: 18500 },
        { code: "05.02", description: "Roof Framing", qty: 1, unit: "LS", unitCost: 7800, total: 7800 },
      ],
      subtotal: 26300,
    },
    {
      code: "06",
      name: "Roofing",
      items: [
        { code: "06.01", description: "Roofing Materials", qty: 1, unit: "LS", unitCost: 6500, total: 6500 },
        { code: "06.02", description: "Roofing Labor", qty: 1, unit: "LS", unitCost: 3200, total: 3200 },
      ],
      subtotal: 9700,
    },
    {
      code: "07",
      name: "Windows & Doors",
      items: [
        { code: "07.01", description: "Windows", qty: 1, unit: "LS", unitCost: 6400, total: 6400 },
        { code: "07.02", description: "Exterior Doors", qty: 1, unit: "LS", unitCost: 2100, total: 2100 },
      ],
      subtotal: 8500,
    },
    {
      code: "08",
      name: "Mechanical / Electrical / Plumbing",
      items: [
        { code: "08.01", description: "HVAC System", qty: 1, unit: "LS", unitCost: 12000, total: 12000 },
        { code: "08.02", description: "Electrical Rough & Finish", qty: 1, unit: "LS", unitCost: 9500, total: 9500 },
        { code: "08.03", description: "Plumbing Rough & Finish", qty: 1, unit: "LS", unitCost: 11000, total: 11000 },
      ],
      subtotal: 32500,
    },
    {
      code: "09",
      name: "Interior Finishes",
      items: [
        { code: "09.01", description: "Drywall & Paint", qty: 1, unit: "LS", unitCost: 14000, total: 14000 },
        { code: "09.02", description: "Flooring", qty: 1, unit: "LS", unitCost: 9800, total: 9800 },
        { code: "09.03", description: "Cabinets & Countertops", qty: 1, unit: "LS", unitCost: 16500, total: 16500 },
        { code: "09.04", description: "Trim & Millwork", qty: 1, unit: "LS", unitCost: 5400, total: 5400 },
      ],
      subtotal: 45700,
    },
  ];

  const subtotal = categories.reduce((s, c) => s + c.subtotal, 0);
  const contingencyPct = 10;
  const contingencyAmount = Math.round(subtotal * (contingencyPct / 100));
  const total = subtotal + contingencyAmount;

  return {
    summary: {
      buildingType: "Single Family Residence",
      totalSquareFeet: 1850,
      bedrooms: 3,
      bathrooms: 2,
      stories: 1,
      garageSpaces: 2,
      notes: "Mock data — plan analysis requires the ANTHROPIC_API_KEY env var to run real AI extraction.",
    },
    categories,
    subtotal,
    contingencyPct,
    contingencyAmount,
    total,
    compliance: [
      {
        code: "IRC R302",
        category: "Fire Separation",
        requirement: "1-hour fire-rated assembly between garage and dwelling",
        status: "review",
        note: "Verify gypsum board (5/8\" Type X) is specified on all garage walls and ceiling shared with dwelling.",
      },
      {
        code: "IRC R310",
        category: "Egress",
        requirement: "Emergency escape and rescue opening in each sleeping room",
        status: "ok",
        note: "Each bedroom appears to have at least one window meeting min. 5.7 sq ft opening / 24\" h / 20\" w.",
      },
      {
        code: "IRC R311",
        category: "Means of Egress",
        requirement: "Minimum one egress door 32\" clear width, 6'8\" height",
        status: "ok",
        note: "Front entry meets requirements based on plan dimensions.",
      },
      {
        code: "IRC R314",
        category: "Smoke Alarms",
        requirement: "Interconnected smoke alarms in each bedroom, outside sleeping areas, on each story",
        status: "review",
        note: "Confirm location plan with electrical drawings — required in all sleeping rooms and the hall.",
      },
      {
        code: "IRC R315",
        category: "Carbon Monoxide",
        requirement: "CO alarms outside sleeping areas when fuel-fired appliances or attached garage present",
        status: "review",
        note: "Required given attached garage.",
      },
      {
        code: "IRC R602",
        category: "Wall Construction",
        requirement: "Studs spaced per code (typ. 16\" o.c.); 2x6 wall noted on plans",
        status: "ok",
        note: "Plan notation of '2x6 wall typ.' aligns with energy code wall thickness in colder climate zones.",
      },
      {
        code: "IRC N1102",
        category: "Energy Efficiency",
        requirement: "Insulation R-values meet local climate zone",
        status: "review",
        note: "Climate-zone-specific. Confirm wall R-20, ceiling R-49 minimums for cold climates; lower for warmer zones.",
      },
      {
        code: "IRC P2903",
        category: "Plumbing",
        requirement: "Water service min. pressure & supply sizing",
        status: "review",
        note: "Engineer or licensed plumber should verify supply sizing for fixture count.",
      },
      {
        code: "IRC E3902",
        category: "Electrical (GFCI)",
        requirement: "GFCI protection for bathrooms, kitchen, garage, exterior, laundry",
        status: "ok",
        note: "Confirm receptacle plan calls out GFCI in required locations.",
      },
      {
        code: "Local",
        category: "Local Amendments",
        requirement: `${jurisdiction.county || "County"}, ${jurisdiction.state || "State"} may have local amendments to IRC`,
        status: "concern",
        note: "Always confirm county-specific amendments with the local Building Department before submitting permits.",
      },
    ],
    jurisdiction,
    generatedAt: new Date().toISOString(),
    source: "mock",
    disclaimer:
      "This is a ballpark estimate based on mock data and IRC base requirements. Real cost estimates require local takeoffs, current material/labor pricing, and contractor quotes. Code compliance is informational only — a licensed architect, engineer, or building official must review plans before permitting.",
  };
}
