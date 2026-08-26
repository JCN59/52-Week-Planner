import { NextRequest, NextResponse } from "next/server";
import { renderCommandFor, renderProject } from "@/lib/video/cli";
import { logged, readProject, writeProject } from "@/lib/video/store";

export const runtime = "nodejs";
export const maxDuration = 600;

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ command: renderCommandFor(params.id) });
}

/**
 * Shell out to `npx hyperframes render`. This needs FFmpeg on the host; when it
 * is missing the command is returned unchanged so it can be run elsewhere.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const project = await readProject(params.id).catch(() => null);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (!project.composed) {
    return NextResponse.json({ error: "Compose the project before rendering" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { fps?: number; quality?: string };
  const fps = [24, 30, 60].includes(Number(body.fps)) ? Number(body.fps) : 30;
  const quality = ["draft", "standard", "high"].includes(String(body.quality))
    ? String(body.quality)
    : "standard";

  const outcome = await renderProject(params.id, { fps, quality });
  const tail = (s: string) => s.split("\n").slice(-25).join("\n");

  if (!outcome.ok) {
    return NextResponse.json(
      {
        ok: false,
        command: outcome.command,
        stdout: tail(outcome.stdout),
        stderr: tail(outcome.stderr),
        timedOut: outcome.timedOut,
        hint: "Local rendering needs Node 22+, the hyperframes CLI, and FFmpeg on PATH.",
      },
      { status: 200 },
    );
  }

  const saved = await writeProject(
    logged(
      { ...project, renderedFile: outcome.file, stage: "render" },
      { stage: "render", message: `Rendered at ${fps}fps (${quality}).` },
    ),
  );

  return NextResponse.json({
    ok: true,
    command: outcome.command,
    stdout: tail(outcome.stdout),
    project: saved,
  });
}
