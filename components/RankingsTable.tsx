"use client";

import { TEAMS } from "@/lib/worldcup-data";

export default function RankingsTable() {
  const ranked = [...TEAMS].sort((a, b) => a.fifaRank - b.fifaRank);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">📊 World Rankings</h2>
        <p className="text-sm text-emerald-200/70">
          FIFA ranks every national team in the world. Lower number = better. These are the 48 teams
          at this World Cup, sorted best to worst (approximate June 2026 rankings).
        </p>
      </div>

      <div className="card p-4 overflow-x-auto">
        <table className="w-full wc-table text-sm">
          <thead>
            <tr>
              <th className="w-12">Rank</th>
              <th>Team</th>
              <th>Confederation</th>
              <th className="text-center w-16">Group</th>
              <th className="text-center w-14">Tier</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((t) => (
              <tr key={t.name}>
                <td className="font-bold text-emerald-300">#{t.fifaRank}</td>
                <td className="font-medium">
                  <span className="mr-1.5">{t.flag}</span>
                  {t.name}
                </td>
                <td className="text-emerald-100/70 text-xs">{t.confederation}</td>
                <td className="text-center">{t.group}</td>
                <td className="text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded tier-badge-${t.tier}`}>
                    {t.tier}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-emerald-200/50">
        Rankings are approximate and for orientation only. The official live FIFA ranking can shift
        during the tournament.
      </p>
    </div>
  );
}
