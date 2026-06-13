"use client";

import { STAGES, KEY_FIXTURES } from "@/lib/worldcup-data";

export default function ScheduleView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">🗓️ Schedule</h2>
        <p className="text-sm text-emerald-200/70">
          The tournament runs from June 11 to July 19, 2026. Here are the rounds and the
          can&apos;t-miss games.
        </p>
      </div>

      {/* Rounds overview */}
      <div className="card p-5">
        <h3 className="font-bold text-lg mb-3">The rounds</h3>
        <div className="space-y-2">
          {STAGES.map((s) => (
            <div
              key={s.name}
              className="flex items-baseline justify-between gap-3 py-2 border-b border-white/10 last:border-0"
            >
              <span className="font-semibold">{s.name}</span>
              <span className="text-sm text-emerald-300/70 whitespace-nowrap">{s.dates}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key fixtures */}
      <div className="card p-5">
        <h3 className="font-bold text-lg mb-3">Games to circle 🔴</h3>
        <div className="space-y-3">
          {KEY_FIXTURES.map((f, i) => (
            <div key={i} className="flex gap-3">
              <div className="text-xs font-bold text-emerald-300 w-16 shrink-0 pt-0.5">
                {f.date}
              </div>
              <div>
                <div className="font-semibold text-sm">
                  {f.label}
                  {f.result && (
                    <span className="ml-2 text-xs font-normal rounded bg-emerald-500/15 text-emerald-300 px-2 py-0.5">
                      {f.result}
                    </span>
                  )}
                </div>
                <div className="text-xs text-emerald-100/70">{f.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
