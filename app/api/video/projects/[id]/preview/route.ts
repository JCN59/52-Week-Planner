import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { GSAP_CDN } from "@/lib/video/compose";
import { readComposition } from "@/lib/video/store";

export const runtime = "nodejs";

const LOCAL_GSAP = "/video/vendor/gsap.min.js";

/**
 * Serve the composition for the in-app <iframe>.
 *
 * Two changes are made, and only here — the file on disk stays a plain
 * HyperFrames document that `npx hyperframes render` can consume unmodified:
 *   1. the GSAP CDN tag is repointed at the vendored copy, so preview works offline
 *   2. the preview runtime is appended, which implements the seek contract live
 */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  let html: string | null;
  try {
    html = await readComposition(params.id);
  } catch {
    return new NextResponse("Bad project id", { status: 400 });
  }

  if (!html) {
    return new NextResponse(
      `<!doctype html><meta charset="utf-8"><body style="margin:0;display:grid;place-items:center;height:100vh;background:#0b1120;color:#94a3b8;font:14px ui-sans-serif,system-ui">Nothing composed yet.</body>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  const vendored = await fs
    .access(path.join(process.cwd(), "public", "video", "vendor", "gsap.min.js"))
    .then(() => true)
    .catch(() => false);

  let out = html;
  if (vendored) out = out.split(GSAP_CDN).join(LOCAL_GSAP);
  out = out.replace(
    "</body>",
    `  <script src="/video/preview-runtime.js"></script>\n  </body>`,
  );

  return new NextResponse(out, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
