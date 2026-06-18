"use client";

import { useState } from "react";
import { TEAMS } from "@/lib/worldcup-data";
import type { Tier } from "@/lib/types";

const TIER_LABEL: Record<Tier, string> = {
  1: "Tier 1 · Top seeds",
  2: "Tier 2 · Strong",
  3: "Tier 3 · Middle",
  4: "Tier 4 · Longshots",
};

export default function TeamsView() {
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [query, setQuery] = useState("");

  const filtered = TEAMS.filter((t) => {
    const matchesTier = tierFilter === "all" || t.tier === tierFilter;
    const q = query.trim().toLowerCase();
    const matchesQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.star.name.toLowerCase().includes(q) ||
      t.group.toLowerCase() === q;
    return matchesTier && matchesQuery;
  }).sort((a, b) => a.tier - b.tier || a.fifaRank - b.fifaRank);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">🌍 All 48 Teams</h2>
        <p className="text-sm text-emerald-200/70">
          Every country at the World Cup, with one star player to watch on each. Filter by tier or
          search.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setTierFilter("all")}
          className={`text-sm px-3 py-1.5 rounded-lg border ${
            tierFilter === "all"
              ? "bg-emerald-500 text-emerald-950 border-emerald-500 font-semibold"
              : "border-white/15 text-emerald-100/80 hover:border-emerald-400/50"
          }`}
        >
          All
        </button>
        {([1, 2, 3, 4] as Tier[]).map((tier) => (
          <button
            key={tier}
            onClick={() => setTierFilter(tier)}
            className={`text-sm px-3 py-1.5 rounded-lg border ${
              tierFilter === tier
                ? "bg-emerald-500 text-emerald-950 border-emerald-500 font-semibold"
                : "border-white/15 text-emerald-100/80 hover:border-emerald-400/50"
            }`}
          >
            Tier {tier}
          </button>
        ))}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search team, player, or group letter…"
          className="ml-auto flex-1 min-w-[200px] bg-black/20 border border-white/15 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-400/60"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((t) => (
          <div key={t.name} className="card card-hover p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-2xl leading-none mb-1">{t.flag}</div>
                <h3 className="font-bold text-lg leading-tight">{t.name}</h3>
                <div className="text-xs text-emerald-200/60">{t.confederation}</div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-bold px-2 py-0.5 rounded tier-badge-${t.tier}`}>
                  {TIER_LABEL[t.tier].split(" · ")[0]}
                </span>
                <div className="text-xs text-emerald-200/60 mt-1">
                  Group {t.group} · #{t.fifaRank}
                </div>
              </div>
            </div>

            <p className="text-sm text-emerald-50/85 mt-3">{t.oneLiner}</p>

            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-xs uppercase tracking-wider text-emerald-300/60 mb-0.5">
                ⭐ Player to watch
              </div>
              <div className="text-sm">
                <span className="font-semibold">{t.star.name}</span>
                <span className="text-emerald-300/70"> · {t.star.position}</span>
              </div>
              <div className="text-xs text-emerald-100/70 mt-0.5">{t.star.why}</div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card p-8 text-center text-emerald-200/70 text-sm">
          No teams match your search.
        </div>
      )}
    </div>
  );
}
