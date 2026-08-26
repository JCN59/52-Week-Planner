import { NextRequest, NextResponse } from "next/server";
import { autoCorrect, analyseProject } from "@/lib/video/qa";
import { runCompose } from "@/lib/video/pipeline";
import { keyframeDiagnostics } from "@/lib/video/cli";
import { logged, readProject, writeProject } from "@/lib/video/store";
import type { Project } from "@/lib/video/types";

export const runtime = "nodejs";
export const maxDuration = 180;

/**
 * Motion QA. `autoCorrect` applies the fixes this pass can make on its own —
 * breaking up repeated moves, dialling back a camera that overshoots — then
 * recomposes and re-checks, which is the self-correcting loop.
 */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const project = await readProject(params.id).catch(() => null);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (!project.script) {
    return NextResponse.json({ error: "Write a script first" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { autoCorrect?: boolean; useCli?: boolean };
  let current: Project = project;
  let changes: string[] = [];

  try {
    if (body.autoCorrect) {
      const corrected = autoCorrect(current);
      changes = corrected.changes;
      if (changes.length) {
        current = await writeProject(
          logged(
            {
              ...current,
              script: { ...current.script!, scenes: corrected.scenes },
              composed: false,
            },
            { stage: "qa", message: `Auto-corrected ${changes.length} motion issue(s).` },
          ),
        );
      }
    }

    // Compose so the report describes what is actually on disk.
    current = await runCompose(current);
    const report = analyseProject(current);

    if (body.useCli) {
      const cli = await keyframeDiagnostics(current.id);
      if (cli.available && cli.findings.length) {
        report.findings = [...report.findings, ...cli.findings];
        report.source = "hyperframes-cli";
      }
      current = await writeProject({ ...current, motionReport: report });
      return NextResponse.json({ project: current, report, changes, cli: { available: cli.available, command: cli.command } });
    }

    current = await writeProject({ ...current, motionReport: report });
    return NextResponse.json({ project: current, report, changes });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
