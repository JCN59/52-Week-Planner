"use client";

import { useState } from "react";
import { api } from "@/lib/video/client";
import type { TopicAngle } from "@/lib/video/types";
import { Badge, Button, Empty, Field, Panel, TextInput } from "./ui";

/**
 * Topic radar. A niche goes in, arguable angles come out — the input to the
 * brief. With no API key this returns the offline template set, clearly marked.
 */
export default function TopicRadar({
  selected,
  onPick,
  claudeAvailable,
}: {
  selected?: TopicAngle;
  onPick: (angle: TopicAngle) => void;
  claudeAvailable: boolean;
}) {
  const [niche, setNiche] = useState("AI video editing");
  const [keywords, setKeywords] = useState("hyperframes, keyframes, video agents");
  const [angles, setAngles] = useState<TopicAngle[]>([]);
  const [source, setSource] = useState<"ai" | "mock" | null>(null);
  const [note, setNote] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function scan() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.radar(
        niche,
        keywords.split(",").map((k) => k.trim()).filter(Boolean),
      );
      setAngles(result.angles);
      setSource(result.source);
      setNote(result.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel
      title="Topic radar"
      subtitle="Find the angle before you write anything. A topic is not an angle."
      right={
        source && (
          <Badge tone={source === "ai" ? "sky" : "amber"}>
            {source === "ai" ? "written by Claude" : "offline template"}
          </Badge>
        )
      }
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Niche">
          <TextInput value={niche} onChange={setNiche} onEnter={scan} placeholder="AI video editing" />
        </Field>
        <Field label="Keywords being monitored">
          <TextInput value={keywords} onChange={setKeywords} onEnter={scan} placeholder="comma, separated" />
        </Field>
        <Button variant="primary" onClick={scan} busy={busy} className="h-[38px]">
          Scan
        </Button>
      </div>

      {!claudeAvailable && (
        <p className="mt-3 text-[11px] text-amber-300/80">
          No <code className="font-mono">ANTHROPIC_API_KEY</code> set — angles come from the offline
          template set. The rest of the pipeline still runs end to end.
        </p>
      )}
      {note && <p className="mt-3 text-[11px] text-amber-300/80">{note}</p>}
      {error && <p className="mt-3 text-[11px] text-rose-300">{error}</p>}

      <div className="mt-4 space-y-2">
        {angles.length === 0 && !busy && <Empty>Run a scan to get angles.</Empty>}
        {angles.map((angle) => {
          const active = selected?.title === angle.title;
          return (
            <button
              key={angle.id}
              onClick={() => onPick(angle)}
              className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                active
                  ? "border-sky-400/70 bg-sky-500/10"
                  : "border-white/10 bg-slate-950/40 hover:border-white/25"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-100">{angle.title}</h3>
                <span className="shrink-0 font-mono text-[11px] text-slate-500">{angle.heat}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{angle.angle}</p>
              <p className="mt-2 text-[11px] italic text-slate-500">&ldquo;{angle.hook}&rdquo;</p>
              <p className="mt-2 text-[11px] text-slate-500">{angle.why}</p>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
