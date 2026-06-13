"use client";

import { useEffect, useState } from "react";
import type { DailyBriefing } from "@/lib/types";

export default function DailyBriefingView() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: new Date().toISOString().slice(0, 10) }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || `Request failed: ${res.status}`);
      else setBriefing(data as DailyBriefing);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  // Auto-load the briefing on first view.
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold">📅 Today&apos;s Update</h2>
          <p className="text-sm text-emerald-200/70">
            Your plain-English catch-up on what&apos;s happening in the World Cup.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-semibold px-4 py-2 text-sm"
        >
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {loading && !briefing && (
        <div className="card p-12 text-center text-emerald-200/80 animate-pulse">
          Putting together today&apos;s update…
        </div>
      )}

      {error && (
        <div className="card p-4 border-red-500/40 text-red-200 text-sm">
          <strong>Couldn&apos;t load the update:</strong> {error}
        </div>
      )}

      {briefing && (
        <div className="space-y-5">
          {/* Headline */}
          <div className="card p-6">
            <div className="text-xs uppercase tracking-wider text-emerald-300/70 mb-1">
              {briefing.date}
              {briefing.source === "mock" && " · sample update"}
            </div>
            <h3 className="text-2xl font-bold mb-2">{briefing.headline}</h3>
            <p className="text-emerald-50/90 leading-relaxed">{briefing.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Top teams */}
            <div className="card p-5">
              <h4 className="font-bold mb-3 flex items-center gap-2">🏆 Top teams right now</h4>
              <ol className="space-y-2">
                {briefing.topTeams?.map((t, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="text-emerald-400 font-bold w-5 shrink-0">{i + 1}</span>
                    <span>
                      <span className="font-semibold">{t.team}</span>
                      <span className="text-emerald-100/70"> — {t.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Players to watch */}
            <div className="card p-5">
              <h4 className="font-bold mb-3 flex items-center gap-2">⭐ Players to watch</h4>
              <ul className="space-y-2">
                {briefing.playersToWatch?.map((p, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-semibold">{p.name}</span>
                    <span className="text-emerald-300/70"> ({p.team})</span>
                    <span className="text-emerald-100/70"> — {p.why}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Highlights */}
            <div className="card p-5">
              <h4 className="font-bold mb-3 flex items-center gap-2">🎬 Highlights</h4>
              <ul className="space-y-2">
                {briefing.highlights?.map((h, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-emerald-400">›</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Buzz */}
            <div className="card p-5">
              <h4 className="font-bold mb-3 flex items-center gap-2">🔥 The buzz</h4>
              <ul className="space-y-2">
                {briefing.buzz?.map((b, i) => (
                  <li key={i} className="text-sm flex gap-2">
                    <span className="text-emerald-400">›</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Beginner tip */}
          <div className="card p-5 border-emerald-400/30 bg-emerald-500/5">
            <h4 className="font-bold mb-1 flex items-center gap-2">💡 Beginner tip</h4>
            <p className="text-sm text-emerald-50/90">{briefing.beginnerTip}</p>
          </div>
        </div>
      )}
    </div>
  );
}
