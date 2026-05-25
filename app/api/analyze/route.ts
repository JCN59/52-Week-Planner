import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildMockEstimate } from "@/lib/mock-estimate";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompt";
import type { AnalysisResult } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const form = await req.formData();
  const file = form.get("plan");
  const state = String(form.get("state") || "");
  const county = String(form.get("county") || "");

  if (!state || !county) {
    return NextResponse.json(
      { error: "state and county are required" },
      { status: 400 },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const mock = buildMockEstimate({ state, county });
    return NextResponse.json(mock);
  }

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "plan file is required when ANTHROPIC_API_KEY is set" },
      { status: 400 },
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: `Image must be ${MAX_IMAGE_BYTES / 1024 / 1024} MB or smaller` },
      { status: 400 },
    );
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: `Unsupported image type: ${file.type}` },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-7",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type as
                  | "image/png"
                  | "image/jpeg"
                  | "image/webp"
                  | "image/gif",
                data: base64,
              },
            },
            { type: "text", text: buildUserPrompt({ state, county }) },
          ],
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              summary: { type: "object" },
              categories: { type: "array" },
              subtotal: { type: "number" },
              contingencyPct: { type: "number" },
              contingencyAmount: { type: "number" },
              total: { type: "number" },
              compliance: { type: "array" },
              jurisdiction: { type: "object" },
              generatedAt: { type: "string" },
              source: { type: "string" },
              disclaimer: { type: "string" },
            },
            required: [
              "summary",
              "categories",
              "subtotal",
              "contingencyPct",
              "contingencyAmount",
              "total",
              "compliance",
              "jurisdiction",
              "generatedAt",
              "source",
              "disclaimer",
            ],
            additionalProperties: true,
          },
        },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Model returned no text content" },
        { status: 502 },
      );
    }

    const parsed = JSON.parse(textBlock.text) as AnalysisResult;
    parsed.source = "ai";
    return NextResponse.json(parsed);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `Anthropic API error (${error.status}): ${error.message}` },
        { status: 502 },
      );
    }
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
