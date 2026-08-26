// ---- Claude access for the research + scripting stages ----
//
// Returns null when no key is configured, which is the signal for the caller to
// fall back to lib/video/mock.ts rather than fail. Structured output is enforced
// with output_config.format so the stages never have to parse prose.

import Anthropic from "@anthropic-ai/sdk";

export const VIDEO_MODEL = process.env.VIDEO_AGENT_MODEL ?? "claude-opus-5";

export function hasClaude(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export type ClaudeResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: string };

export async function askJson<T>(args: {
  system: string;
  user: string;
  schema: unknown;
  maxTokens?: number;
  effort?: "low" | "medium" | "high" | "xhigh" | "max";
}): Promise<ClaudeResult<T>> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { ok: false, reason: "ANTHROPIC_API_KEY is not set" };

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: VIDEO_MODEL,
      max_tokens: args.maxTokens ?? 8000,
      system: args.system,
      thinking: { type: "adaptive" },
      output_config: {
        effort: args.effort ?? "high",
        format: { type: "json_schema", schema: args.schema as Record<string, unknown> },
      },
      messages: [{ role: "user", content: args.user }],
    });

    if (response.stop_reason === "refusal") {
      return { ok: false, reason: "The model declined this request." };
    }

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      return { ok: false, reason: "The model returned no text content." };
    }
    return { ok: true, value: JSON.parse(text.text) as T };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return { ok: false, reason: "ANTHROPIC_API_KEY was rejected." };
    }
    if (err instanceof Anthropic.RateLimitError) {
      return { ok: false, reason: "Rate limited by the Claude API — try again shortly." };
    }
    if (err instanceof Anthropic.APIError) {
      return { ok: false, reason: `Claude API error ${err.status}: ${err.message}` };
    }
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}
