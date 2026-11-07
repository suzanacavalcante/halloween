"use client";

import { useEffect, useState } from "react";

const AWAY_TITLE = "Volte. Ele está esperando.";
const IDLE_MS = 40_000;
const MAX_WHISPERS = 2;

/* Duas assombrações de comportamento:
   - saiu da aba? o título muda e chama você de volta;
   - ficou parado? a tela escurece e alguém pergunta se você ainda está aí. */
export function Presence() {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const original = document.title;
    const onVisibility = () => {
      document.title = document.hidden ? AWAY_TITLE : original;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let whispers = 0;
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      if (reduced || whispers >= MAX_WHISPERS) return;
      timer = window.setTimeout(() => {
        if (document.hidden) return arm();
        whispers += 1;
        setIdle(true);
      }, IDLE_MS);
    };
    const wake = () => {
      setIdle(false);
      arm();
    };
    const events = ["pointermove", "keydown", "scroll", "touchstart", "wheel"] as const;
    events.forEach((ev) => window.addEventListener(ev, wake, { passive: true }));
    arm();

    return () => {
      document.title = original;
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, wake));
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[75] flex items-center justify-center bg-black/85 transition-opacity duration-[2500ms] ${
        idle ? "opacity-100" : "opacity-0 duration-300"
      }`}
      aria-hidden={!idle}
    >
      {idle && <p className="whisper font-display text-[clamp(2rem,5vw,4rem)] font-light text-ivory/80 italic">Ainda está aí?</p>}
    </div>
  );
}
