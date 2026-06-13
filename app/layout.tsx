import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "World Cup 2026 — Beginner's Tracker",
  description:
    "A simple, beginner-friendly tracker for the 2026 FIFA World Cup: teams, tiers, groups, rankings, schedule, and a daily plain-English update.",
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
