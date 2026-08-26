// ---- Composition generator ----
//
// Emits a HyperFrames composition: a plain HTML document whose root carries
// `data-composition-id` / `data-width` / `data-height` / `data-duration`, whose
// timed elements carry `data-start` + `data-duration`, and which registers one
// paused GSAP timeline on `window.__timelines`. That is the whole renderer
// contract — the same file previews in this app and renders with
// `npx hyperframes render`.
//
// Nothing here is HyperFrames-specific beyond those attributes, which is the
// point: the agent writes ordinary HTML and gets a deterministic MP4.

import type { Asset, Project, Scene } from "./types";
import { compileSceneMotion, compileTextMotion, OVERSCAN, type CompiledTrack } from "./motion";
import { frameFor, getWorkflow, type Theme } from "./workflows";

export const GSAP_CDN = "https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js";

export type ComposeResult = {
  html: string;
  tracks: CompiledTrack[];
  totalSeconds: number;
  frame: { width: number; height: number };
  /** Absolute start time of each scene on the master timeline. */
  sceneStarts: Record<string, number>;
};

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function num(n: number): string {
  return String(Math.round(n * 1000) / 1000);
}

function assetFor(assets: Asset[], ownerId: string, kind: Asset["kind"]): Asset | undefined {
  return assets.find((a) => a.ownerId === ownerId && a.kind === kind && a.status === "ready");
}

/** The media element inside a scene's camera rig — an <img> or a <video>. */
function mediaTag(scene: Scene, asset: Asset | undefined, start: number): string {
  if (!asset) {
    return `<div class="media media-missing"><span>${esc(scene.brollPrompt.slice(0, 90))}</span></div>`;
  }
  if (asset.mediaType === "video") {
    return (
      `<video class="media clip" src="${esc(asset.file)}" muted playsinline preload="auto"` +
      ` data-start="${num(start)}" data-duration="${num(scene.durationSeconds)}"` +
      ` data-media-start="0"></video>`
    );
  }
  return `<img class="media" src="${esc(asset.file)}" alt="" />`;
}

function sceneMarkup(
  scene: Scene,
  start: number,
  asset: Asset | undefined,
  zIndex: number,
): string {
  return `
      <div class="scene clip" id="${scene.id}" data-start="${num(start)}" data-duration="${num(
        scene.durationSeconds,
      )}" data-track-index="${zIndex}" style="z-index: ${zIndex}">
        <div class="cam-x" id="${scene.id}-cam-x">
          <div class="cam-y" id="${scene.id}-cam-y">
            <div class="cam-z" id="${scene.id}-cam-z">
              ${mediaTag(scene, asset, start)}
            </div>
          </div>
        </div>
        <div class="scrim"></div>
        <div class="caption" id="${scene.id}-text">
          <span class="kicker">${String(scene.index + 1).padStart(2, "0")} · ${esc(scene.label)}</span>
          <p class="line">${esc(scene.onScreenText)}</p>
        </div>
      </div>`;
}

function styles(theme: Theme, frame: { width: number; height: number }, isVertical: boolean): string {
  const over = `${(1 + OVERSCAN) * 100}%`;
  const inset = `${(-OVERSCAN / 2) * 100}%`;
  const captionSize = isVertical ? 78 : 66;
  const kickerSize = isVertical ? 28 : 24;
  return `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body {
        width: ${frame.width}px;
        height: ${frame.height}px;
        overflow: hidden;
        background: ${theme.bg};
        color: ${theme.ink};
        font-family: ${theme.bodyFont};
      }
      #root { position: relative; width: ${frame.width}px; height: ${frame.height}px; overflow: hidden; }

      /* Timed elements start hidden; the runtime reveals them from data-start. */
      .scene { position: absolute; inset: 0; overflow: hidden; }

      /* Camera rig: one wrapper per axis so an arc is just x + eased y. */
      .cam-x, .cam-y, .cam-z {
        position: absolute;
        top: ${inset}; left: ${inset};
        width: ${over}; height: ${over};
        will-change: transform;
      }
      .cam-y, .cam-z { top: 0; left: 0; width: 100%; height: 100%; }
      .media { width: 100%; height: 100%; object-fit: cover; display: block; }
      .media-missing {
        display: flex; align-items: center; justify-content: center; text-align: center;
        padding: 8%; background: ${theme.bg};
        color: ${theme.muted}; font-size: 34px; line-height: 1.4;
      }
      .scrim { position: absolute; inset: 0; background: ${theme.scrim}; pointer-events: none; }

      .caption {
        position: absolute;
        left: ${isVertical ? "7%" : "6%"};
        right: ${isVertical ? "7%" : "38%"};
        bottom: ${isVertical ? "16%" : "11%"};
        opacity: 0;
      }
      .kicker {
        display: inline-block;
        font-family: ${theme.bodyFont};
        font-size: ${kickerSize}px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: ${theme.accentInk};
        background: ${theme.accent};
        padding: 8px 16px;
        border-radius: ${theme.radius}px;
        margin-bottom: 22px;
      }
      .line {
        font-family: ${theme.titleFont};
        font-size: ${captionSize}px;
        line-height: 1.15;
        font-weight: 700;
        letter-spacing: -0.02em;
        text-wrap: balance;
        text-shadow: 0 4px 30px rgba(0,0,0,0.45);
      }

      #avatar {
        position: absolute;
        ${isVertical ? "left: 50%; transform: translateX(-50%); bottom: 4%;" : "right: 4%; bottom: 8%;"}
        width: ${isVertical ? "62%" : "26%"};
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: 50%;
        border: 6px solid ${theme.accent};
        box-shadow: 0 30px 80px rgba(0,0,0,0.55);
        z-index: 60;
      }

      #brandbar {
        position: absolute; left: 0; right: 0; top: 0; height: 8px;
        background: rgba(255,255,255,0.12); z-index: 70;
      }
      #progress {
        position: absolute; left: 0; top: 0; height: 100%; width: 100%;
        background: ${theme.accent}; transform: scaleX(0); transform-origin: 0 50%;
      }

      #cta {
        position: absolute; inset: 0; z-index: 80;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 28px; text-align: center; padding: 10%;
        background: ${theme.bg};
        opacity: 0;
      }
      #cta .cta-title { font-family: ${theme.titleFont}; font-size: ${captionSize + 10}px; font-weight: 700; letter-spacing: -0.02em; }
      #cta .cta-line { font-size: 40px; color: ${theme.muted}; max-width: 70%; line-height: 1.35; }

      ${
        theme.letterbox > 0
          ? `.bar { position: absolute; left: 0; right: 0; height: ${Math.round(
              (frame.height * (1 - 1 / 2.39 / (frame.width / frame.height))) / 2,
            )}px; background: #000; z-index: 65; }
      .bar.top { top: 0; } .bar.bottom { bottom: 0; }`
          : ""
      }
      ${
        theme.grain > 0
          ? `#grain { position: absolute; inset: 0; z-index: 75; pointer-events: none; opacity: ${theme.grain};
        background-image: url("data:image/svg+xml;utf8,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/></filter><rect width="160" height="160" filter="url(%23n)"/></svg>',
        )}"); }`
          : ""
      }`;
}

/** Emit one GSAP keyframe track as `set` + `to` calls at absolute positions. */
function emitTrack(track: CompiledTrack): string[] {
  const prop = track.axis === "scale" ? "scale" : track.axis;
  const lines: string[] = [];
  const [first, ...rest] = track.keys;
  if (!first) return lines;
  lines.push(`  tl.set("${track.selector}", { ${prop}: ${num(first.v)} }, ${num(first.t)});`);
  let prev = first;
  for (const key of rest) {
    const duration = key.t - prev.t;
    if (duration <= 0.0005) {
      lines.push(`  tl.set("${track.selector}", { ${prop}: ${num(key.v)} }, ${num(key.t)});`);
    } else {
      lines.push(
        `  tl.to("${track.selector}", { ${prop}: ${num(key.v)}, duration: ${num(
          duration,
        )}, ease: "${key.ease}" }, ${num(prev.t)});`,
      );
    }
    prev = key;
  }
  return lines;
}

export function composeProject(project: Project): ComposeResult {
  const script = project.script;
  if (!script) throw new Error("Cannot compose a project without a script");

  const workflow = getWorkflow(project.settings.workflow);
  const theme = workflow.theme;
  const frame = frameFor(project.settings.aspect);
  const isVertical = frame.height > frame.width;

  // Lay the scenes out end to end and remember where each one lands.
  const sceneStarts: Record<string, number> = {};
  let cursor = 0;
  for (const scene of script.scenes) {
    sceneStarts[scene.id] = cursor;
    cursor += scene.durationSeconds;
  }
  const sceneTotal = cursor;
  const CTA_SECONDS = script.cta ? 3 : 0;
  const totalSeconds = Math.round((sceneTotal + CTA_SECONDS) * 1000) / 1000;

  const tracks: CompiledTrack[] = [];
  const sceneHtml = script.scenes
    .map((scene, i) => {
      const start = sceneStarts[scene.id];
      tracks.push(...compileSceneMotion(scene, start, frame));
      tracks.push(...compileTextMotion(scene, start));
      return sceneMarkup(scene, start, assetFor(project.assets, scene.id, "broll"), i + 1);
    })
    .join("\n");

  const avatar = assetFor(project.assets, "avatar", "avatar");
  const voiceover = assetFor(project.assets, "voiceover", "voiceover");

  const showAvatar = project.settings.format === "avatar" && Boolean(avatar);
  // A video avatar carries its own narration, so it doubles as the audio bed.
  const avatarCarriesAudio = showAvatar && avatar?.mediaType === "video";

  let avatarHtml = "";
  if (showAvatar && avatar) {
    avatarHtml = avatarCarriesAudio
      ? `
      <video id="avatar" class="clip" src="${esc(avatar.file)}" muted playsinline preload="auto"
             data-start="0" data-duration="${num(sceneTotal)}" data-media-start="0" data-track-index="60"></video>
      <audio id="avatar-audio" src="${esc(avatar.file)}" data-start="0" data-duration="${num(
          sceneTotal,
        )}" data-volume="1" data-track-index="61"></audio>`
      : `
      <img id="avatar" class="clip" src="${esc(avatar.file)}" alt=""
           data-start="0" data-duration="${num(sceneTotal)}" data-track-index="60" />`;
  }

  const voiceoverHtml =
    !avatarCarriesAudio && voiceover
      ? `
      <audio id="voiceover" src="${esc(voiceover.file)}" data-start="0" data-duration="${num(
          sceneTotal,
        )}" data-volume="1" data-track-index="61"></audio>`
      : "";

  const ctaHtml = script.cta
    ? `
      <div id="cta" class="clip" data-start="${num(sceneTotal)}" data-duration="${num(
        CTA_SECONDS,
      )}" data-track-index="80">
        <div class="cta-title">${esc(script.title)}</div>
        <div class="cta-line">${esc(script.cta)}</div>
      </div>`
    : "";

  const barsHtml = theme.letterbox > 0 ? `\n      <div class="bar top"></div>\n      <div class="bar bottom"></div>` : "";
  const grainHtml = theme.grain > 0 ? `\n      <div id="grain"></div>` : "";

  const timelineLines: string[] = [];
  for (const track of tracks) timelineLines.push(...emitTrack(track));
  timelineLines.push(
    `  tl.to("#progress", { scaleX: 1, duration: ${num(totalSeconds)}, ease: "none" }, 0);`,
  );
  if (script.cta) {
    timelineLines.push(`  tl.set("#cta", { opacity: 0 }, 0);`);
    timelineLines.push(
      `  tl.to("#cta", { opacity: 1, duration: 0.5, ease: "power2.out" }, ${num(sceneTotal)});`,
    );
  }
  // Pin the timeline to the composition length so a seek past the last
  // keyframe still resolves inside the timeline rather than clamping early.
  timelineLines.push(
    `  tl.to({ _pin: 0 }, { _pin: 1, duration: ${num(totalSeconds)}, ease: "none" }, 0);`,
  );

  const variables = JSON.stringify([
    { id: "title", type: "string", label: "Title", default: script.title },
    { id: "accent", type: "color", label: "Accent", default: theme.accent },
  ]);

  const html = `<!doctype html>
<html lang="en" data-composition-variables='${variables.replace(/'/g, "&#39;")}'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${frame.width}, height=${frame.height}" />
    <title>${esc(script.title)}</title>
    <script src="${GSAP_CDN}"></script>
    <style>${styles(theme, frame, isVertical)}
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-duration="${num(totalSeconds)}"
      data-width="${frame.width}"
      data-height="${frame.height}"
    >
${sceneHtml}${avatarHtml}${voiceoverHtml}${ctaHtml}${barsHtml}${grainHtml}
      <div id="brandbar"><div id="progress"></div></div>
    </div>

    <script>
      // One paused timeline, registered under the composition id. The renderer
      // seeks it frame by frame; nothing here runs on its own clock.
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
${timelineLines.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;

  return { html, tracks, totalSeconds, frame, sceneStarts };
}
