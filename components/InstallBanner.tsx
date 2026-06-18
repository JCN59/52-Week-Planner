"use client";

import { useEffect, useState } from "react";

// The browser fires this event when a site is installable (Android/Chrome).
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "wc26-install-dismissed";

export default function InstallBanner() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed (opened from the home screen)? Don't nag.
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    if (standalone) return;

    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* ignore */
    }

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as InstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iOS Safari has no install event — show a manual hint instead.
    if (ios) setVisible(true);

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  };

  return (
    <div className="card border-emerald-400/40 bg-emerald-500/10 p-3 mb-6 flex items-center gap-3 text-sm">
      <span className="text-xl shrink-0">📲</span>
      <div className="flex-1">
        <span className="font-semibold">Add World Cup 26 to your phone</span>
        {isIOS ? (
          <span className="text-emerald-100/80">
            {" "}
            — tap <b>Share</b> <span aria-hidden>⬆️</span> then <b>Add to Home Screen</b>.
          </span>
        ) : (
          <span className="text-emerald-100/80"> — for one-tap access, full-screen.</span>
        )}
      </div>
      {!isIOS && deferred && (
        <button
          onClick={install}
          className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold px-3 py-1.5 shrink-0"
        >
          Install
        </button>
      )}
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="text-emerald-100/60 hover:text-emerald-100 px-1 shrink-0"
      >
        ✕
      </button>
    </div>
  );
}
