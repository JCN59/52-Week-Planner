"use client";

import { TEAMS, GROUP_STANDINGS, GROUP_DATE_RANGES, SNAPSHOT_DATE } from "@/lib/worldcup-data";
import type { GroupRow } from "@/lib/types";

const flagOf = (name: string) => TEAMS.find((t) => t.name === name)?.flag ?? "🏳️";

function sortRows(rows: GroupRow[]): GroupRow[] {
  return [...rows].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
}

export default function GroupsView() {
  const groups = Object.keys(GROUP_STANDINGS);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">🗂️ The 12 Groups</h2>
        <p className="text-sm text-emerald-200/70">
          Every team plays the other 3 in its group. The <span className="text-emerald-400 font-semibold">top 2</span> of
          each group move on for sure, plus the 8 best 3rd-place teams. Standings as of {SNAPSHOT_DATE}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map((g) => {
          const rows = sortRows(GROUP_STANDINGS[g]);
          return (
            <div key={g} className="card p-4">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-bold text-lg">Group {g}</h3>
                <span className="text-xs text-emerald-300/60">{GROUP_DATE_RANGES[g]}</span>
              </div>
              <table className="w-full wc-table text-sm">
                <thead>
                  <tr>
                    <th>Team</th>
                    <th className="text-center w-8">P</th>
                    <th className="text-center w-8">W</th>
                    <th className="text-center w-8">D</th>
                    <th className="text-center w-8">L</th>
                    <th className="text-center w-10">GD</th>
                    <th className="text-center w-10">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => {
                    const gd = r.goalsFor - r.goalsAgainst;
                    return (
                      <tr key={r.team} className={i < 2 ? "qualify-spot" : ""}>
                        <td className="font-medium">
                          <span className="mr-1.5">{flagOf(r.team)}</span>
                          {r.team}
                        </td>
                        <td className="text-center text-emerald-100/70">{r.played}</td>
                        <td className="text-center">{r.won}</td>
                        <td className="text-center">{r.drawn}</td>
                        <td className="text-center">{r.lost}</td>
                        <td className="text-center text-emerald-100/70">
                          {gd > 0 ? `+${gd}` : gd}
                        </td>
                        <td className="text-center font-bold text-emerald-300">{r.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div className="card p-4 text-xs text-emerald-200/70">
        <span className="inline-block w-3 h-3 align-middle mr-1 rounded-sm" style={{ boxShadow: "inset 3px 0 0 0 #4ade80", background: "rgba(255,255,255,0.04)" }} />
        Green edge = currently in a top-2 spot. P = played, W = won, D = drawn (tied), L = lost,
        GD = goal difference, Pts = points (win 3, draw 1, loss 0).
      </div>
    </div>
  );
}
