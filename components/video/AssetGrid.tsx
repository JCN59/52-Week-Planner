"use client";

import { assetUrl } from "@/lib/video/client";
import type { Project } from "@/lib/video/types";
import { Badge, Button, Empty, Panel } from "./ui";

/** Generated B-roll and presenter, with whatever the provider had to say. */
export default function AssetGrid({
  project,
  onGenerate,
  busy,
}: {
  project: Project;
  onGenerate: (force: boolean) => void;
  busy: boolean;
}) {
  const scenes = project.script?.scenes ?? [];
  const fallbacks = project.assets.filter((a) => a.provider === "placeholder" && a.note);

  return (
    <Panel
      title="Footage"
      subtitle="One clip per scene, plus the presenter. Missing clips are filled on the next run."
      right={
        <div className="flex gap-2">
          <Button onClick={() => onGenerate(false)} busy={busy} disabled={!project.scriptApproved}>
            Generate missing
          </Button>
          <Button variant="ghost" onClick={() => onGenerate(true)} busy={busy} disabled={!project.scriptApproved}>
            Regenerate all
          </Button>
        </div>
      }
    >
      {!project.scriptApproved && (
        <p className="mb-3 text-[11px] text-amber-300/80">Approve the script first.</p>
      )}

      {project.assets.length === 0 && <Empty>No footage generated yet.</Empty>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {scenes.map((scene) => {
          const asset = project.assets.find((a) => a.ownerId === scene.id && a.kind === "broll");
          return (
            <figure
              key={scene.id}
              className="overflow-hidden rounded-lg border border-white/10 bg-slate-950/40"
            >
              <div className="aspect-video bg-slate-900">
                {asset ? (
                  asset.mediaType === "video" ? (
                    <video
                      src={assetUrl(project.id, asset.file)}
                      className="h-full w-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => void e.currentTarget.play().catch(() => {})}
                      onMouseLeave={(e) => e.currentTarget.pause()}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={assetUrl(project.id, asset.file)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div className="grid h-full place-items-center text-[11px] text-slate-600">
                    not generated
                  </div>
                )}
              </div>
              <figcaption className="space-y-1.5 p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                    {String(scene.index + 1).padStart(2, "0")} · {scene.label}
                  </span>
                  {asset && (
                    <Badge tone={asset.provider === "placeholder" ? "amber" : "emerald"}>
                      {asset.provider.split(":")[0]}
                    </Badge>
                  )}
                </div>
                <p className="line-clamp-2 text-[11px] leading-snug text-slate-400">
                  {scene.brollPrompt}
                </p>
              </figcaption>
            </figure>
          );
        })}

        {project.assets
          .filter((a) => a.kind === "avatar")
          .map((asset) => (
            <figure
              key={asset.file}
              className="overflow-hidden rounded-lg border border-sky-400/30 bg-slate-950/40"
            >
              <div className="aspect-video bg-slate-900">
                {asset.mediaType === "video" ? (
                  <video src={assetUrl(project.id, asset.file)} className="h-full w-full object-contain" muted loop playsInline />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={assetUrl(project.id, asset.file)} alt="" className="h-full w-full object-contain" />
                )}
              </div>
              <figcaption className="flex items-center justify-between gap-2 p-2.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500">
                  Presenter
                </span>
                <Badge tone={asset.provider === "placeholder" ? "amber" : "emerald"}>
                  {asset.provider}
                </Badge>
              </figcaption>
            </figure>
          ))}
      </div>

      {fallbacks.length > 0 && (
        <ul className="mt-3 space-y-1">
          {Array.from(new Set(fallbacks.map((f) => f.note))).map((note) => (
            <li key={note} className="text-[11px] leading-snug text-amber-300/80">
              {note}
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
