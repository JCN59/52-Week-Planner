import { NextRequest, NextResponse } from "next/server";
import { runAssets } from "@/lib/video/pipeline";
import { readProject } from "@/lib/video/store";

export const runtime = "nodejs";
export const maxDuration = 300;

/** Generate the avatar and every missing scene's B-roll. */
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const project = await readProject(params.id).catch(() => null);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as { force?: boolean };

  try {
    return NextResponse.json({ project: await runAssets(project, { force: body.force === true }) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
