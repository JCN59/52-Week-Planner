// ---- fal.ai B-roll provider ----
//
// Uses fal's queue API: submit, poll the returned status_url, then read the
// response_url. Video models take minutes, so everything is bounded by an
// explicit deadline rather than an HTTP timeout.
//
// Set FAL_KEY. The model is configurable per project (settings.brollModel);
// FAL_VIDEO_MODEL overrides the default.

import type { BrollRequest, GeneratedMedia } from "./types";
import { ProviderError } from "./types";

const DEFAULT_MODEL = "fal-ai/minimax/hailuo-02/standard/text-to-video";
const QUEUE_BASE = "https://queue.fal.run";

const ASPECT_RATIO: Record<string, string> = {
  "16:9": "16:9",
  "9:16": "9:16",
  "1:1": "1:1",
};

function deadlineMs(): number {
  const raw = Number(process.env.VIDEO_GEN_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 240_000;
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export async function brollFal(req: BrollRequest): Promise<GeneratedMedia> {
  const key = process.env.FAL_KEY;
  if (!key) throw new ProviderError("FAL_KEY is not set", "fal");

  const model = req.model || process.env.FAL_VIDEO_MODEL || DEFAULT_MODEL;
  const headers = { Authorization: `Key ${key}`, "Content-Type": "application/json" };

  const submit = await fetch(`${QUEUE_BASE}/${model}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: req.prompt,
      aspect_ratio: ASPECT_RATIO[req.aspect] ?? "16:9",
      duration: Math.max(5, Math.round(req.durationSeconds)),
      prompt_optimizer: true,
    }),
  });

  if (!submit.ok) {
    throw new ProviderError(`fal submit failed (${submit.status}): ${await submit.text()}`, "fal");
  }

  const queued = (await submit.json()) as {
    request_id?: string;
    status_url?: string;
    response_url?: string;
  };
  const statusUrl = queued.status_url ?? `${QUEUE_BASE}/${model}/requests/${queued.request_id}/status`;
  const responseUrl = queued.response_url ?? `${QUEUE_BASE}/${model}/requests/${queued.request_id}`;

  const stopAt = Date.now() + deadlineMs();
  let status = "IN_QUEUE";
  while (Date.now() < stopAt) {
    await sleep(3000);
    const poll = await fetch(statusUrl, { headers });
    if (!poll.ok) throw new ProviderError(`fal status failed (${poll.status})`, "fal");
    const body = (await poll.json()) as { status?: string };
    status = body.status ?? status;
    if (status === "COMPLETED") break;
    if (status === "FAILED" || status === "ERROR") {
      throw new ProviderError(`fal reported ${status} for "${req.prompt.slice(0, 60)}"`, "fal");
    }
  }
  if (status !== "COMPLETED") {
    throw new ProviderError(`fal did not finish within ${Math.round(deadlineMs() / 1000)}s`, "fal");
  }

  const resultRes = await fetch(responseUrl, { headers });
  if (!resultRes.ok) {
    throw new ProviderError(`fal result failed (${resultRes.status})`, "fal");
  }
  const result = (await resultRes.json()) as { video?: { url?: string }; url?: string };
  const url = result.video?.url ?? result.url;
  if (!url) throw new ProviderError("fal returned no video url", "fal");

  const media = await fetch(url);
  if (!media.ok) throw new ProviderError(`downloading fal output failed (${media.status})`, "fal");
  const data = Buffer.from(await media.arrayBuffer());

  return {
    data,
    extension: "mp4",
    mediaType: "video",
    provider: `fal:${model}`,
    durationSeconds: req.durationSeconds,
  };
}
