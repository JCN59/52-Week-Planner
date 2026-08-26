import type { Aspect } from "../types";

export type Frame = { width: number; height: number };

export type BrollRequest = {
  prompt: string;
  durationSeconds: number;
  aspect: Aspect;
  frame: Frame;
  /** Provider-specific model id. Falls back to the provider's default. */
  model?: string;
  /** Stable string used to make placeholder output deterministic. */
  seed: string;
};

export type AvatarRequest = {
  script: string;
  aspect: Aspect;
  frame: Frame;
  voiceId?: string;
  seed: string;
};

export type GeneratedMedia = {
  data: Buffer;
  extension: string;
  mediaType: "image" | "video" | "audio";
  provider: string;
  durationSeconds?: number;
  note?: string;
};

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly provider: string,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
