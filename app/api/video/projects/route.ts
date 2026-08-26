import { NextRequest, NextResponse } from "next/server";
import { draftProject } from "@/lib/video/pipeline";
import { coerceSettings } from "@/lib/video/settings";
import { listProjects, writeProject } from "@/lib/video/store";
import type { TopicAngle } from "@/lib/video/types";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ projects: await listProjects() });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const angle = (body.angle ?? undefined) as TopicAngle | undefined;
  const name =
    (typeof body.name === "string" && body.name.trim()) || angle?.title || "Untitled video";
  const settings = coerceSettings((body.settings ?? {}) as Record<string, unknown>);

  try {
    const project = await writeProject(draftProject({ name, settings, angle }));
    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
