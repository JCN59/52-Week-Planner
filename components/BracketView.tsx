"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BracketResponse, BracketRoundResponse, LiveMatch } from "@/lib/types";

function BracketMatch({ m }: { m: LiveMatch }) {
  const live = m.state === "in";
  const Side = ({ c }: { c: LiveMatch["home"] }) => (
    <div className="flex items-center justify-between gap-2">
      <span className={`text-xs truncate ${c.winner ? "font-bold" : ""}`}>
        <span className="mr-1">{c.flag}</span>
        {c.name}
      </span>
      <span className={`text-xs tabular-nums ${c.winner ? "font-bold text-emerald-300" : "text-emerald-100/70"}`}>
        {c.score ?? "–"}
      </span>
    </div>
  );
  return (
    <div className={`rounded-lg border p-2 bg-black/20 ${live ? "border-red-500/50" : "border-white/10"}`}>
      <Side c={m.home} />
      <div className="my-1 border-t border-white/5" />
      <Side c={m.away} />
      <div className="mt-1 text-[10px] uppercase tracking-wide text-emerald-300/50">
        {live ? <span className="text-red-400">● {m.status || "LIVE"}</span> : m.status}
      </div>
    </div>
  );
}

function RoundColumn({ round }: { round: BracketRoundResponse }) {
  const slots = Math.max(round.expected, round.matches.length);
  return (
    <div className="min-w-[180px] flex-1">
      <div className="mb-2">
        <h3 className="font-bold text-sm">{round.name}</h3>
        <p className="text-[11px] text-emerald-200/60 leading-tight">{round.plain}</p>
      </div>
      <div className="space-y-2">
        {round.matches.length > 0
          ? round.matches.map((m) => <BracketMatch key={m.id} m={m} />)
          : Array.from({ length: slots }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-dashed border-white/10 p-2 text-center text-[11px] text-emerald-200/40"
              >
                TBD
              </div>
            ))}
      </div>
    </div>
  );
}

export default function BracketView() {
  const [data, setData] = useState<BracketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/bracket", { cache: "no-store" });
      setData((await res.json()) as BracketResponse);
    } catch {
      /* ignore — keep last data */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh during live knockout games.
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    const hasLive = data?.rounds?.some((r) => r.matches.some((m) => m.state === "in"));
    if (hasLive) pollRef.current = setInterval(load, 30000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [data, load]);

  const rounds = data?.rounds ?? [];
  const notStarted = data?.source === "upcoming";

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">🏆 The Bracket</h2>
        <p className="text-sm text-emerald-200/70 max-w-2xl">
          After the group stage, 32 teams enter a win-or-go-home bracket. Win your game, move right.
          Lose, and you&apos;re out. The last team standing on July 19 are World Champions. It works
          just like a March Madness bracket — semi-finals are the &quot;Final Four.&quot;
        </p>
      </div>

      {loading && !data && (
        <div className="card p-12 text-center text-emerald-200/70 animate-pulse">
          Loading the bracket…
        </div>
      )}

      {notStarted && (
        <div className="card p-4 border-emerald-400/30 bg-emerald-500/5 text-sm text-emerald-50/90">
          🗓️ The knockout rounds begin <strong>June 28</strong>. This bracket fills in automatically
          with real matchups and scores once the group stage wraps up.
        </div>
      )}

      <div className="card p-4 overflow-x-auto">
        <div className="flex gap-3 min-w-[760px]">
          {rounds.map((r) => (
            <RoundColumn key={r.id} round={r} />
          ))}
        </div>
      </div>

      {data?.source === "live" && (
        <p className="text-xs text-emerald-200/50 text-center">
          🟢 Live bracket from ESPN · auto-refreshes every 30s during live games
        </p>
      )}
    </div>
  );
}
