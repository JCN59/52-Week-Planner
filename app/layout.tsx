import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 — Beginner's Tracker",
  description:
    "A simple, beginner-friendly tracker for the 2026 FIFA World Cup: live scores, teams, tiers, groups, bracket, rankings, schedule, and a daily plain-English update.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    title: "World Cup 26",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#04210f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
