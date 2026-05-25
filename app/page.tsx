"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import EstimateResults from "@/components/EstimateResults";
import CodeCompliance from "@/components/CodeCompliance";
import type { AnalysisResult } from "@/lib/types";

export default function HomePage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(form: FormData) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `Request failed: ${res.status}`);
      } else {
        setResult(data as AnalysisResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-widest mb-2">
          Blueprint Estimator
        </h1>
        <p className="text-blue-200 text-sm md:text-base">
          Upload plans → AI extracts the building → get a line-item estimate and code-compliance checklist
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <UploadForm onSubmit={handleSubmit} loading={loading} />
          {error && (
            <div className="mt-4 blueprint-card rounded-lg p-4 border-red-500/50 text-red-200 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div>
          {loading && (
            <div className="blueprint-card rounded-lg p-12 text-center">
              <div className="text-blue-200 text-sm uppercase tracking-wider animate-pulse">
                Analyzing plan…
              </div>
            </div>
          )}
          {result && !loading && (
            <div className="space-y-6">
              <EstimateResults result={result} />
              <CodeCompliance checks={result.compliance} />
              <div className="blueprint-card rounded-lg p-4 text-xs text-blue-200/80 italic">
                {result.disclaimer}
              </div>
            </div>
          )}
          {!result && !loading && !error && (
            <div className="blueprint-card rounded-lg p-12 text-center text-blue-200">
              <div className="text-6xl mb-4">📐</div>
              <p className="uppercase tracking-wider text-sm">
                Results will appear here
              </p>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center text-xs text-blue-200/60">
        Powered by Claude · Estimates are ballpark · Code compliance is informational, not a substitute for licensed review
      </footer>
    </main>
  );
}
