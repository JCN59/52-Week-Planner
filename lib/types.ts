export type LineItem = {
  code: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  total: number;
};

export type EstimateCategory = {
  code: string;
  name: string;
  items: LineItem[];
  subtotal: number;
};

export type ComplianceCheck = {
  code: string;
  category: string;
  requirement: string;
  status: "ok" | "review" | "concern";
  note: string;
};

export type PlanSummary = {
  buildingType: string;
  totalSquareFeet: number;
  bedrooms: number;
  bathrooms: number;
  stories: number;
  garageSpaces: number;
  notes: string;
};

export type AnalysisResult = {
  summary: PlanSummary;
  categories: EstimateCategory[];
  subtotal: number;
  contingencyPct: number;
  contingencyAmount: number;
  total: number;
  compliance: ComplianceCheck[];
  jurisdiction: { state: string; county: string };
  generatedAt: string;
  source: "ai" | "mock";
  disclaimer: string;
};
