import { NextRequest, NextResponse } from "next/server";
import { runCompose } from "@/lib/video/pipeline";
import { readProject } from "@/lib/video/store";
import { renderCommandFor } from "@/lib/video/cli";

export const runtime = "nodejs";
export const maxDuration = 120;

/** Write the HyperFrames composition and run the motion QA pass over it. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await readProject(params.id).catch(() => null);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  try {
    const composed = await runCompose(project);
    return NextResponse.json({ project: composed, command: renderCommandFor(composed.id) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
