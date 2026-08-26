import type { Metadata } from "next";
import Link from "next/link";
import MissionControl from "@/components/video/MissionControl";

export const metadata: Metadata = {
  title: "Video Agent — Mission Control",
  description:
    "Research an angle, write a script cut to picture, generate the footage, and compose a HyperFrames video with inspectable keyframes.",
};

export default function VideoPage() {
  return (
    <main className="min-h-screen bg-[#070a12] text-slate-200">
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-50">
              Video Agent · Mission Control
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-400">
              Angle → script → footage → composition → MP4. The composition is plain HTML with a
              seekable timeline, so the preview here and{" "}
              <span className="font-mono text-slate-300">npx hyperframes render</span> run the same
              code.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-400 transition hover:border-white/25 hover:text-slate-200"
          >
            ← World Cup tracker
          </Link>
        </header>

        <MissionControl />
      </div>
    </main>
  );
}
