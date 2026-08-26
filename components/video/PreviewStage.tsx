"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { previewUrl } from "@/lib/video/client";
import type { Project } from "@/lib/video/types";
import { Badge, Button, Empty, Panel } from "./ui";

type Ready = { duration: number; width: number; height: number; hasTimeline: boolean; clips: number };

/**
 * Live preview of the composition.
 *
 * The <iframe> loads the very same index.html the CLI renders; a small runtime
 * is injected by the preview route to implement the seek contract in the
 * browser. Scrubbing here drives exactly the code path the renderer drives,
 * which is why what you see is what gets encoded.
 */
export default function PreviewStage({
  project,
  onCompose,
  busy,
}: {
  project: Project;
  onCompose: () => void;
  busy: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState<Ready | null>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  // Reloading on updatedAt is what makes "recompose" show up instantly.
  const cacheKey = project.updatedAt;

  useEffect(() => {
    setReady(null);
    setTime(0);
    setPlaying(false);
  }, [cacheKey]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as Record<string, unknown> | undefined;
      if (!data || data.source !== "hyperframes-preview") return;
      if (data.type === "hf:ready") setReady(data as unknown as Ready);
      else if (data.type === "hf:time") {
        setTime(Number(data.t) || 0);
        setPlaying(Boolean(data.playing));
      } else if (data.type === "hf:ended") setPlaying(false);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const send = useCallback((type: string, payload: Record<string, unknown> = {}) => {
    frameRef.current?.contentWindow?.postMessage(
      { source: "hyperframes-host", type, ...payload },
      "*",
    );
  }, []);

  useEffect(() => {
    if (ready) send("hf:mute", { value: muted });
  }, [muted, ready, send]);

  if (!project.composed) {
    return (
      <Panel title="Preview" subtitle="The composition, running the renderer's own seek contract.">
        <Empty>Nothing composed yet.</Empty>
        <div className="mt-3 flex justify-end">
          <Button variant="primary" onClick={onCompose} busy={busy} disabled={!project.script}>
            Build composition
          </Button>
        </div>
      </Panel>
    );
  }

  const duration = ready?.duration ?? 0;
  const ratio = ready && ready.width && ready.height ? ready.width / ready.height : 16 / 9;
  // Clamp by height as well as width, so a 9:16 composition doesn't run off
  // the bottom of the page.
  const MAX_VH = 56;

  return (
    <Panel
      title="Preview"
      subtitle={
        ready
          ? `${ready.width}×${ready.height} · ${ready.clips} timed clips · ${duration.toFixed(1)}s`
          : "Loading composition…"
      }
      right={
        <div className="flex items-center gap-2">
          {ready && !ready.hasTimeline && <Badge tone="rose">no timeline registered</Badge>}
          <Button variant="ghost" onClick={onCompose} busy={busy}>
            Rebuild
          </Button>
        </div>
      }
    >
      <div
        className="mx-auto w-full overflow-hidden rounded-lg border border-white/10 bg-black"
        style={{
          aspectRatio: String(ratio),
          maxHeight: `${MAX_VH}vh`,
          maxWidth: `${(MAX_VH * ratio).toFixed(2)}vh`,
        }}
      >
        <iframe
          ref={frameRef}
          key={cacheKey}
          src={previewUrl(project.id, cacheKey)}
          title="Composition preview"
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button onClick={() => send(playing ? "hf:pause" : "hf:play")} disabled={!ready}>
          {playing ? "Pause" : "Play"}
        </Button>
        <input
          type="range"
          min={0}
          max={Math.max(duration, 0.1)}
          step={0.02}
          value={time}
          disabled={!ready}
          onChange={(e) => {
            send("hf:pause");
            send("hf:seek", { t: Number(e.target.value) });
          }}
          className="h-1 w-full cursor-pointer appearance-none rounded bg-white/15 accent-sky-400 disabled:opacity-40"
        />
        <span className="w-20 shrink-0 text-right font-mono text-[11px] text-slate-400">
          {time.toFixed(2)} / {duration.toFixed(1)}s
        </span>
        <Button variant="ghost" onClick={() => setMuted((m) => !m)} disabled={!ready}>
          {muted ? "Unmute" : "Mute"}
        </Button>
      </div>
    </Panel>
  );
}
