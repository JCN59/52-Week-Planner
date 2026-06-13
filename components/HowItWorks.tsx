"use client";

import { STAGES, TIERS_EXPLAINER, GLOSSARY, TOURNAMENT, HOST_CITIES } from "@/lib/worldcup-data";

export default function HowItWorks() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-1">📖 How the World Cup Works</h2>
        <p className="text-sm text-emerald-200/70">
          Never followed soccer before? Start here. This is the whole thing in plain English.
        </p>
      </div>

      {/* The basics */}
      <div className="card p-6">
        <h3 className="font-bold text-lg mb-3">The basics</h3>
        <p className="text-emerald-50/90 leading-relaxed mb-3">
          The World Cup happens every <strong>4 years</strong> and is the biggest event in all of
          sports — bigger than the Super Bowl. National teams (one per country) compete to be
          crowned champion of the world. This year, <strong>{TOURNAMENT.teams} countries</strong> are
          playing, hosted across <strong>{TOURNAMENT.hosts}</strong> from {TOURNAMENT.dates}.
        </p>
        <p className="text-emerald-50/90 leading-relaxed">
          A soccer game is 90 minutes. You win by scoring more goals. Goals are hard to come by, so
          scores are low (a 2–1 result is normal). If a knockout game ends tied, they play{" "}
          <strong>extra time</strong>, and if it&apos;s still tied, a{" "}
          <strong>penalty shootout</strong> decides it.
        </p>
      </div>

      {/* Tiers */}
      <div className="card p-6">
        <h3 className="font-bold text-lg mb-3">The tiers (you asked about this!)</h3>
        <p className="text-emerald-50/90 leading-relaxed mb-4">{TIERS_EXPLAINER.intro}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TIERS_EXPLAINER.tiers.map((t) => (
            <div key={t.tier} className={`rounded-lg p-3 tier-badge-${t.tier}`}>
              <div className="font-bold">{t.label}</div>
              <div className="text-sm opacity-80">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* The path to the final */}
      <div className="card p-6">
        <h3 className="font-bold text-lg mb-3">The path to the final 🏆</h3>
        <p className="text-emerald-50/90 leading-relaxed mb-4">
          It works a lot like the &quot;Final Four&quot; bracket you know — it just starts with a
          group round first, then becomes a knockout bracket.
        </p>
        <ol className="relative border-l-2 border-emerald-500/40 ml-2 space-y-5">
          {STAGES.map((s, i) => (
            <li key={s.name} className="ml-5">
              <span className="absolute -left-[11px] flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-emerald-950 text-xs font-bold">
                {i + 1}
              </span>
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h4 className="font-semibold">{s.name}</h4>
                <span className="text-xs text-emerald-300/70">{s.dates}</span>
              </div>
              <p className="text-sm text-emerald-100/80 mt-1">{s.plain}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Host cities */}
      <div className="card p-6">
        <h3 className="font-bold text-lg mb-3">Where it&apos;s played</h3>
        <p className="text-emerald-50/90 mb-3 text-sm">
          16 host cities across 3 countries. The final is at {TOURNAMENT.finalVenue}.
        </p>
        <div className="flex flex-wrap gap-2">
          {HOST_CITIES.map((c) => (
            <span key={c} className="text-sm rounded-full bg-white/5 border border-white/10 px-3 py-1">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Glossary */}
      <div className="card p-6">
        <h3 className="font-bold text-lg mb-3">Soccer words, explained</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {GLOSSARY.map((g) => (
            <div key={g.term}>
              <dt className="font-semibold text-emerald-300">{g.term}</dt>
              <dd className="text-sm text-emerald-100/80">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
