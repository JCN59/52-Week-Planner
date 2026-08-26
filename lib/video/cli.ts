// ---- HyperFrames CLI bridge (server only) ----
//
// The composition on disk is a normal HyperFrames project, so the CLI is the
// canonical renderer. This shells out to it when it is installed and reports
// honestly when it isn't — the UI always shows the exact command, so nothing
// here is load-bearing for getting a video out.

import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { projectDir } from "./store";
import type { MotionFinding } from "./types";

export type CliOutcome = {
  ok: boolean;
  command: string;
  stdout: string;
  stderr: string;
  code: number | null;
  timedOut: boolean;
};

function bin(): string {
  return process.env.HYPERFRAMES_BIN ?? "npx";
}

function argv(rest: string[]): string[] {
  return process.env.HYPERFRAMES_BIN ? rest : ["--yes", "hyperframes", ...rest];
}

export async function run(rest: string[], timeoutMs = 600_000): Promise<CliOutcome> {
  const args = argv(rest);
  const command = `${bin()} ${args.join(" ")}`;

  return new Promise<CliOutcome>((resolve) => {
    const child = spawn(bin(), args, { env: process.env });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);

    child.stdout.on("data", (d) => {
      stdout += String(d);
      if (stdout.length > 200_000) stdout = stdout.slice(-200_000);
    });
    child.stderr.on("data", (d) => {
      stderr += String(d);
      if (stderr.length > 200_000) stderr = stderr.slice(-200_000);
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      resolve({ ok: false, command, stdout, stderr: `${stderr}${err.message}`, code: null, timedOut });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ ok: code === 0 && !timedOut, command, stdout, stderr, code, timedOut });
    });
  });
}

/** The command a person would type to render this project themselves. */
export function renderCommandFor(id: string, fps = 30, quality = "standard"): string {
  const dir = path.relative(process.cwd(), projectDir(id)) || ".";
  return `npx hyperframes render ${dir} -f ${fps} -q ${quality} -o ${path.posix.join(
    dir.split(path.sep).join("/"),
    "out.mp4",
  )}`;
}

export function previewCommandFor(id: string): string {
  const dir = path.relative(process.cwd(), projectDir(id)) || ".";
  return `npx hyperframes preview ${dir}`;
}

export async function renderProject(
  id: string,
  opts: { fps?: number; quality?: string } = {},
): Promise<CliOutcome & { file?: string }> {
  const dir = projectDir(id);
  const out = path.join(dir, "out.mp4");
  const outcome = await run([
    "render",
    dir,
    "-f",
    String(opts.fps ?? 30),
    "-q",
    opts.quality ?? "standard",
    "-o",
    out,
  ]);

  if (!outcome.ok) return outcome;
  const exists = await fs
    .stat(out)
    .then(() => true)
    .catch(() => false);
  return { ...outcome, file: exists ? "out.mp4" : undefined };
}

/**
 * `hyperframes keyframes --json` — the renderer's own view of the motion in a
 * composition. Shape is version-dependent, so anything unrecognised is surfaced
 * as raw info rather than guessed at.
 */
export async function keyframeDiagnostics(id: string): Promise<{
  available: boolean;
  findings: MotionFinding[];
  raw?: unknown;
  command: string;
}> {
  const dir = projectDir(id);
  const outcome = await run(["keyframes", dir, "--json"], 120_000);
  if (!outcome.ok) {
    return {
      available: false,
      findings: [],
      command: outcome.command,
    };
  }

  let raw: unknown;
  try {
    const start = outcome.stdout.indexOf("{");
    const arrStart = outcome.stdout.indexOf("[");
    const from = start === -1 || (arrStart !== -1 && arrStart < start) ? arrStart : start;
    raw = from === -1 ? undefined : JSON.parse(outcome.stdout.slice(from));
  } catch {
    raw = undefined;
  }

  const findings: MotionFinding[] = [];
  const collect = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(collect);
      return;
    }
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const message = obj.message ?? obj.warning ?? obj.error;
    if (typeof message === "string") {
      const level = typeof obj.level === "string" && obj.level === "error" ? "error" : "warn";
      findings.push({ level, message: `hyperframes: ${message}` });
    }
    Object.values(obj).forEach(collect);
  };
  collect(raw);

  return { available: true, findings, raw, command: outcome.command };
}
