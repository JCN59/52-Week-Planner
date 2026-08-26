"use client";

import { useState } from "react";
import { api, outputUrl } from "@/lib/video/client";
import type { Project } from "@/lib/video/types";
import { Badge, Button, Code, Field, Panel, Select } from "./ui";

/**
 * Render. The project directory already *is* a HyperFrames project, so the
 * command shown here works verbatim in a terminal — the button just runs it
 * for you when the CLI and FFmpeg are on this host.
 */
export default function RenderPanel({
  project,
  command,
  onProject,
}: {
  project: Project;
  command: string;
  onProject: (project: Project) => void;
}) {
  const [fps, setFps] = useState("30");
  const [quality, setQuality] = useState("standard");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    stdout?: string;
    stderr?: string;
    hint?: string;
  } | null>(null);

  async function render() {
    setBusy(true);
    setResult(null);
    try {
      const res = await api.render(project.id, { fps: Number(fps), quality });
      setResult(res);
      if (res.project) onProject(res.project);
    } catch (err) {
      setResult({ ok: false, stderr: err instanceof Error ? err.message : String(err) });
    } finally {
      setBusy(false);
    }
  }

  const shown = command.replace(/-f \d+/, `-f ${fps}`).replace(/-q \w+/, `-q ${quality}`);

  return (
    <Panel
      title="Render"
      subtitle="Deterministic MP4 out of the same HTML you just previewed."
      right={project.renderedFile && <Badge tone="emerald">rendered</Badge>}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Field label="Frame rate">
          <Select
            value={fps}
            onChange={setFps}
            options={[
              { value: "24", label: "24 fps" },
              { value: "30", label: "30 fps" },
              { value: "60", label: "60 fps" },
            ]}
          />
        </Field>
        <Field label="Quality">
          <Select
            value={quality}
            onChange={setQuality}
            options={[
              { value: "draft", label: "draft — fast" },
              { value: "standard", label: "standard" },
              { value: "high", label: "high" },
            ]}
          />
        </Field>
        <Button variant="primary" onClick={render} busy={busy} disabled={!project.composed} className="h-[38px]">
          Render MP4
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-[11px] uppercase tracking-wider text-slate-500">Or run it yourself</p>
        <Code>{shown}</Code>
        <p className="text-[11px] leading-snug text-slate-500">
          Needs Node 22+ and FFmpeg on PATH. Add <span className="font-mono">--docker</span> for
          byte-identical output across machines.
        </p>
      </div>

      {project.renderedFile && (
        <div className="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video src={outputUrl(project.id)} controls className="w-full" />
        </div>
      )}

      {result && !result.ok && (
        <div className="mt-4 space-y-2 rounded-lg border border-rose-400/30 bg-rose-500/5 p-3">
          <p className="text-xs text-rose-200">Render did not complete.</p>
          {result.hint && <p className="text-[11px] text-rose-200/80">{result.hint}</p>}
          {(result.stderr || result.stdout) && (
            <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-mono text-[10px] leading-snug text-rose-200/70">
              {result.stderr || result.stdout}
            </pre>
          )}
        </div>
      )}
    </Panel>
  );
}
