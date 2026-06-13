"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveMatch, ScoresResponse } from "@/lib/types";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number) {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function prettyDate(iso: string) {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

function MatchRow({ m }: { m: LiveMatch }) {
  const live = m.state === "in";
  const done = m.state === "post";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
      <div className="w-20 shrink-0 text-xs">
        {live ? (
          <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            {m.status || "LIVE"}
          </span>
        ) : (
          <span className={done ? "text-emerald-300/70" : "text-emerald-100/60"}>
            {m.status || (done ? "FT" : "")}
          </span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        {[m.home, m.away].map((c, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className={`text-sm ${c.winner ? "font-bold" : ""}`}>
              <span className="mr-1.5">{c.flag}</span>
              {c.name}
            </span>
            <span className={`text-sm tabular-nums ${c.winner ? "font-bold text-emerald-300" : ""}`}>
              {c.score ?? "–"}
            </span>
          </div>
        ))}
      </div>

      {m.group && (
        <div className="w-12 shrink-0 text-right text-xs text-emerald-300/50">Grp {m.group}</div>
      )}
    </div>
  );
}

export default function ScoresView() {
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState<ScoresResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (d: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/scores?date=${d}`, { cache: "no-store" });
      const json = (await res.json()) as ScoresResponse;
      setData(json);
    } catch {
      setData({ source: "unavailable", date: d, matches: [], fetchedAt: "", error: "Network error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(date);
  }, [date, load]);

  // Auto-refresh every 30s while there are live games on the selected day.
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    const hasLive = data?.matches?.some((m) => m.state === "in");
    if (hasLive) {
      pollRef.current = setInterval(() => load(date), 30000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [data, date, load]);

  const matches = data?.matches ?? [];
  const liveCount = matches.filter((m) => m.state === "in").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold mb-1">⚽ Live Scores</h2>
          <p className="text-sm text-emerald-200/70">
            Real-time results, updated automatically.
            {liveCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-red-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {liveCount} live now
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => load(date)}
          disabled={loading}
          className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-emerald-950 font-semibold px-4 py-2 text-sm"
        >
          {loading ? "…" : "↻ Refresh"}
        </button>
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setDate((d) => shiftDate(d, -1))}
          className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-emerald-400/50 text-sm"
        >
          ← Prev
        </button>
        <div className="text-center min-w-[160px]">
          <div className="font-semibold">{prettyDate(date)}</div>
          {date === todayISO() && <div className="text-xs text-emerald-300/70">Today</div>}
        </div>
        <button
          onClick={() => setDate((d) => shiftDate(d, 1))}
          className="px-3 py-1.5 rounded-lg border border-white/15 hover:border-emerald-400/50 text-sm"
        >
          Next →
        </button>
      </div>

      <div className="card p-5">
        {loading && !data && (
          <div className="text-center text-emerald-200/70 py-8 animate-pulse">Loading scores…</div>
        )}

        {data?.source === "unavailable" && (
          <div className="text-center text-emerald-100/80 py-8 text-sm">
            <div className="text-3xl mb-2">📡</div>
            <p className="font-semibold mb-1">Live scores aren&apos;t reachable right now.</p>
            <p className="text-emerald-200/60">
              This feature pulls real-time data from ESPN&apos;s public API. It works when the app
              has internet access (e.g. running locally). The Groups and Teams tabs still work
              offline.
            </p>
          </div>
        )}

        {data?.source === "live" && matches.length === 0 && (
          <div className="text-center text-emerald-200/70 py-8 text-sm">
            No matches scheduled for this day. Try the next day →
          </div>
        )}

        {matches.length > 0 && (
          <div>
            {matches.map((m) => (
              <MatchRow key={m.id} m={m} />
            ))}
          </div>
        )}
      </div>

      {data?.source === "live" && (
        <p className="text-xs text-emerald-200/50 text-center">
          🟢 Live data from ESPN · auto-refreshes every 30s during live games
        </p>
      )}
    </div>
  );
}
