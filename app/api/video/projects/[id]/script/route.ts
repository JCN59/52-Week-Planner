import { NextRequest, NextResponse } from "next/server";
import { runScript } from "@/lib/video/pipeline";
import { readProject } from "@/lib/video/store";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Research + write the script. Re-running invalidates assets downstream. */
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const project = await readProject(params.id).catch(() => null);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  try {
    return NextResponse.json({ project: await runScript(project) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
