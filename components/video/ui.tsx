"use client";

import type { ReactNode } from "react";

export function Panel({
  title,
  subtitle,
  right,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm ${className}`}
    >
      {(title || right) && (
        <header className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight text-slate-100">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      {/* A collapsed panel passes null children — don't leave an empty padded box. */}
      {children ? <div className="p-4">{children}</div> : null}
    </section>
  );
}

export function Button({
  children,
  onClick,
  variant = "default",
  disabled,
  busy,
  title,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost" | "danger";
  disabled?: boolean;
  busy?: boolean;
  title?: string;
  type?: "button" | "submit";
  className?: string;
}) {
  const styles = {
    primary:
      "bg-sky-500 text-slate-950 hover:bg-sky-400 disabled:bg-sky-500/40 disabled:text-slate-950/50",
    default:
      "bg-white/10 text-slate-100 hover:bg-white/20 disabled:bg-white/5 disabled:text-slate-500",
    ghost:
      "bg-transparent text-slate-300 hover:bg-white/10 disabled:text-slate-600",
    danger:
      "bg-transparent text-rose-300 hover:bg-rose-500/15 disabled:text-rose-300/40",
  }[variant];

  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled || busy}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {busy && (
        <span
          aria-hidden
          className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-slate-500">{hint}</span>}
    </label>
  );
}

const CONTROL =
  "w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/30";

export function Select({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; disabled?: boolean }[];
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`${CONTROL} disabled:opacity-50`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} disabled={o.disabled}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  onEnter,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter();
      }}
      className={CONTROL}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${CONTROL} resize-y leading-relaxed`}
    />
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "sky" | "amber" | "rose" | "emerald";
}) {
  const tones = {
    slate: "bg-white/10 text-slate-300",
    sky: "bg-sky-500/15 text-sky-300",
    amber: "bg-amber-500/15 text-amber-300",
    rose: "bg-rose-500/15 text-rose-300",
    emerald: "bg-emerald-500/15 text-emerald-300",
  }[tone];
  return (
    <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-medium ${tones}`}>
      {children}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-xs text-slate-500">
      {children}
    </p>
  );
}

export function Code({ children }: { children: string }) {
  return (
    <code className="block overflow-x-auto whitespace-pre rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 font-mono text-[11px] text-emerald-300">
      {children}
    </code>
  );
}
