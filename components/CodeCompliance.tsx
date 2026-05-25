"use client";

import type { ComplianceCheck } from "@/lib/types";

const STATUS_LABEL: Record<ComplianceCheck["status"], string> = {
  ok: "OK",
  review: "Review",
  concern: "Concern",
};

const STATUS_CLASS: Record<ComplianceCheck["status"], string> = {
  ok: "status-ok",
  review: "status-review",
  concern: "status-concern",
};

export default function CodeCompliance({ checks }: { checks: ComplianceCheck[] }) {
  return (
    <div className="blueprint-card rounded-lg p-6">
      <h2 className="text-2xl font-bold uppercase tracking-wider mb-4">
        Code Compliance Checklist
      </h2>
      <p className="text-xs text-blue-200/80 mb-4 italic">
        Informational only. A licensed architect, engineer, or building official must
        review plans before permitting.
      </p>
      <div className="space-y-3">
        {checks.map((check, idx) => (
          <div
            key={`${check.code}-${idx}`}
            className="border border-white/20 rounded p-3 bg-white/5"
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <div className="font-semibold">
                <span className="font-mono text-xs text-blue-200 mr-2">
                  {check.code}
                </span>
                {check.category}
              </div>
              <span
                className={`text-xs font-bold uppercase tracking-wide ${STATUS_CLASS[check.status]}`}
              >
                {STATUS_LABEL[check.status]}
              </span>
            </div>
            <div className="text-sm mb-1">{check.requirement}</div>
            <div className="text-xs text-blue-200/80">{check.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
