import type { MetadataRoute } from "next";

// Makes the app installable on phones ("Add to Home Screen" → real app icon,
// full-screen, no browser chrome).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "World Cup 2026 — Beginner's Tracker",
    short_name: "World Cup 26",
    description:
      "A simple, beginner-friendly tracker for the 2026 FIFA World Cup: live scores, groups, bracket, and a daily plain-English update.",
    start_url: "/",
    display: "standalone",
    background_color: "#04210f",
    theme_color: "#04210f",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
