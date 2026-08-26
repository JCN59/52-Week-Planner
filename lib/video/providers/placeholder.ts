// ---- Placeholder provider ----
//
// Always available, no key, no network. It renders an SVG card derived
// deterministically from the prompt so that a project composed without any
// generation credits still previews, lints, and renders as a real video — the
// timing, motion, and layout are all exercised, only the imagery is stand-in.

import type { AvatarRequest, BrollRequest, GeneratedMedia } from "./types";

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function wrap(text: string, perLine: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > perLine) {
      lines.push(line.trim());
      line = word;
      if (lines.length === maxLines) break;
    } else {
      line = `${line} ${word}`;
    }
  }
  if (lines.length < maxLines && line.trim()) lines.push(line.trim());
  return lines;
}

export function brollPlaceholder(req: BrollRequest): GeneratedMedia {
  const { width, height } = req.frame;
  const h = hash(req.seed + req.prompt);
  const hue = h % 360;
  const hue2 = (hue + 40 + (h % 60)) % 360;
  const tilt = ((h >> 3) % 40) - 20;

  // A few large soft shapes at prompt-derived positions — enough visual
  // structure that a camera move over it actually reads as a camera move.
  const blobs = Array.from({ length: 4 }, (_, i) => {
    const s = hash(`${req.seed}:${i}`);
    const cx = (s % 100) / 100;
    const cy = ((s >> 7) % 100) / 100;
    const r = 0.18 + ((s >> 11) % 30) / 100;
    const op = 0.1 + ((s >> 17) % 22) / 100;
    return `<circle cx="${(cx * width).toFixed(0)}" cy="${(cy * height).toFixed(0)}" r="${(
      r * Math.min(width, height)
    ).toFixed(0)}" fill="hsl(${(hue2 + i * 25) % 360} 70% 60%)" opacity="${op.toFixed(2)}" />`;
  }).join("");

  const label = wrap(req.prompt, 46, 3);
  const fontSize = Math.round(Math.min(width, height) * 0.028);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${tilt} 0.5 0.5)">
      <stop offset="0%" stop-color="hsl(${hue} 62% 22%)"/>
      <stop offset="55%" stop-color="hsl(${hue2} 55% 34%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 200) % 360} 48% 14%)"/>
    </linearGradient>
    <filter id="b"><feGaussianBlur stdDeviation="${Math.round(Math.min(width, height) * 0.06)}"/></filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <g filter="url(#b)">${blobs}</g>
  <g opacity="0.55" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="${fontSize}" fill="#ffffff">
    <text x="${Math.round(width * 0.06)}" y="${Math.round(height * 0.12)}" opacity="0.8" letter-spacing="4">PLACEHOLDER B-ROLL</text>
${label
  .map(
    (l, i) =>
      `    <text x="${Math.round(width * 0.06)}" y="${Math.round(
        height * 0.12 + fontSize * 2 + i * fontSize * 1.4,
      )}">${esc(l)}</text>`,
  )
  .join("\n")}
  </g>
</svg>`;

  return {
    data: Buffer.from(svg, "utf8"),
    extension: "svg",
    mediaType: "image",
    provider: "placeholder",
    durationSeconds: req.durationSeconds,
    note: "Generated locally — no B-roll provider key was set.",
  };
}

export function avatarPlaceholder(req: AvatarRequest): GeneratedMedia {
  const size = 720;
  const h = hash(req.seed);
  const hue = h % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="r" cx="0.5" cy="0.35" r="0.75">
      <stop offset="0%" stop-color="hsl(${hue} 45% 40%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 30) % 360} 40% 16%)"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#r)"/>
  <circle cx="${size / 2}" cy="${size * 0.4}" r="${size * 0.16}" fill="rgba(255,255,255,0.82)"/>
  <path d="M ${size * 0.2} ${size} q ${size * 0.3} ${-size * 0.42} ${size * 0.6} 0 Z" fill="rgba(255,255,255,0.82)"/>
  <text x="50%" y="${size * 0.93}" text-anchor="middle" font-family="ui-monospace, monospace" font-size="26" fill="rgba(255,255,255,0.7)" letter-spacing="3">NARRATOR</text>
</svg>`;

  return {
    data: Buffer.from(svg, "utf8"),
    extension: "svg",
    mediaType: "image",
    provider: "placeholder",
    note: "Generated locally — no avatar provider key was set.",
  };
}
