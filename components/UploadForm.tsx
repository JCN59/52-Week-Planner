"use client";

import { useState, useRef } from "react";
import { STATES } from "@/lib/jurisdictions";

type Props = {
  onSubmit: (form: FormData) => Promise<void>;
  loading: boolean;
};

export default function UploadForm({ onSubmit, loading }: Props) {
  const [state, setState] = useState("California");
  const [county, setCounty] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      setPreviewUrl(null);
      return;
    }
    setFileName(file.name);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!county.trim()) return;
    const fd = new FormData();
    fd.append("state", state);
    fd.append("county", county.trim());
    const file = fileInputRef.current?.files?.[0];
    if (file) fd.append("plan", file);
    await onSubmit(fd);
  }

  return (
    <form onSubmit={handleSubmit} className="blueprint-card rounded-lg p-6 space-y-5">
      <div>
        <label className="block text-sm font-semibold mb-2 uppercase tracking-wide">
          Construction Plan (image)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-white file:text-blueprint-900 file:font-semibold hover:file:bg-blue-100 cursor-pointer"
        />
        {fileName && (
          <p className="mt-2 text-xs text-blue-200">Selected: {fileName}</p>
        )}
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Plan preview"
            className="mt-3 max-h-64 border border-white/30 rounded"
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2 uppercase tracking-wide">
            State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-blueprint-900/60 border border-white/30 rounded px-3 py-2 text-sm"
          >
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 uppercase tracking-wide">
            County
          </label>
          <input
            type="text"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            placeholder="e.g., Los Angeles"
            className="w-full bg-blueprint-900/60 border border-white/30 rounded px-3 py-2 text-sm placeholder-blue-300/50"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !county.trim()}
        className="w-full bg-white text-blueprint-900 font-bold py-3 rounded uppercase tracking-wider hover:bg-blue-100 disabled:bg-white/40 disabled:cursor-not-allowed transition"
      >
        {loading ? "Analyzing plan…" : "Generate Estimate"}
      </button>

      <p className="text-xs text-blue-200/80 leading-relaxed">
        Tip: If <code className="bg-white/10 px-1 rounded">ANTHROPIC_API_KEY</code>{" "}
        is not set, the app returns a mock estimate so you can see the UI end-to-end.
      </p>
    </form>
  );
}
