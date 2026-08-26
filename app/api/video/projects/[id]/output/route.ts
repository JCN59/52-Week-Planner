import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { promises as fs } from "fs";
import { resolveInProject } from "@/lib/video/store";
import { Readable } from "stream";

export const runtime = "nodejs";

/** Stream the rendered MP4, if one exists. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  let full: string;
  try {
    full = resolveInProject(params.id, "out.mp4");
  } catch {
    return NextResponse.json({ error: "Bad project id" }, { status: 400 });
  }

  const stat = await fs.stat(full).catch(() => null);
  if (!stat) return NextResponse.json({ error: "Nothing rendered yet" }, { status: 404 });

  const stream = Readable.toWeb(createReadStream(full)) as ReadableStream;
  return new NextResponse(stream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(stat.size),
      "Cache-Control": "no-store",
    },
  });
}
