import { NextRequest, NextResponse } from "next/server";
import { createReadStream, promises as fs } from "fs";
import path from "path";
import { Readable } from "stream";
import { resolveInProject } from "@/lib/video/store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
};

/** Serve a generated asset. Paths are resolved inside the project only. */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; path: string[] } },
) {
  let full: string;
  try {
    full = resolveInProject(params.id, path.join("assets", ...params.path));
  } catch {
    return NextResponse.json({ error: "Bad asset path" }, { status: 400 });
  }

  const stat = await fs.stat(full).catch(() => null);
  if (!stat || !stat.isFile()) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const type = TYPES[path.extname(full).toLowerCase()] ?? "application/octet-stream";
  const stream = Readable.toWeb(createReadStream(full)) as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": type,
      "Content-Length": String(stat.size),
      "Cache-Control": "no-store",
    },
  });
}
