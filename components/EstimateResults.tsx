"use client";

import type { AnalysisResult } from "@/lib/types";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function EstimateResults({ result }: { result: AnalysisResult }) {
  return (
    <div className="blueprint-card rounded-lg p-6 space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wider">
            Construction Estimate
          </h2>
          <p className="text-sm text-blue-200">
            {result.jurisdiction.county}, {result.jurisdiction.state} ·{" "}
            {new Date(result.generatedAt).toLocaleDateString()} ·{" "}
            <span className={result.source === "ai" ? "text-green-300" : "text-amber-300"}>
              {result.source === "ai" ? "AI analysis" : "Mock data"}
            </span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-blue-200 uppercase">Estimated Total</div>
          <div className="text-3xl font-bold">{usd(result.total)}</div>
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-200 mb-2">
          Building Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <Stat label="Type" value={result.summary.buildingType} />
          <Stat label="Sq Ft" value={result.summary.totalSquareFeet.toLocaleString()} />
          <Stat label="Stories" value={result.summary.stories} />
          <Stat label="Bedrooms" value={result.summary.bedrooms} />
          <Stat label="Bathrooms" value={result.summary.bathrooms} />
          <Stat label="Garage" value={`${result.summary.garageSpaces} car`} />
        </div>
        {result.summary.notes && (
          <p className="text-xs text-blue-200/80 mt-3 italic">{result.summary.notes}</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-200 mb-2">
          Line Items
        </h3>
        <div className="overflow-x-auto">
          <table className="blueprint-table w-full text-sm">
            <thead>
              <tr>
                <th>Item</th>
                <th>Description</th>
                <th className="text-right">Qty</th>
                <th>Unit</th>
                <th className="text-right">Unit Cost</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {result.categories.map((cat) => (
                <>
                  <tr key={cat.code} className="bg-white/5">
                    <td colSpan={6} className="font-bold uppercase tracking-wide">
                      {cat.code} — {cat.name}
                    </td>
                  </tr>
                  {cat.items.map((item) => (
                    <tr key={item.code}>
                      <td className="font-mono text-xs">{item.code}</td>
                      <td>{item.description}</td>
                      <td className="text-right">{item.qty}</td>
                      <td>{item.unit}</td>
                      <td className="text-right">{usd(item.unitCost)}</td>
                      <td className="text-right">{usd(item.total)}</td>
                    </tr>
                  ))}
                  <tr key={`${cat.code}-sub`} className="bg-white/5">
                    <td colSpan={5} className="text-right font-semibold">
                      Subtotal
                    </td>
                    <td className="text-right font-semibold">{usd(cat.subtotal)}</td>
                  </tr>
                </>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="text-right font-semibold">Subtotal</td>
                <td className="text-right">{usd(result.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={5} className="text-right font-semibold">
                  Contingency ({result.contingencyPct}%)
                </td>
                <td className="text-right">{usd(result.contingencyAmount)}</td>
              </tr>
              <tr className="bg-white/10">
                <td colSpan={5} className="text-right font-bold uppercase">
                  Total Estimate
                </td>
                <td className="text-right font-bold">{usd(result.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/20 rounded px-3 py-2">
      <div className="text-xs text-blue-200 uppercase tracking-wide">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
