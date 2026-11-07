"use client";

import { useEffect, useState } from "react";
import { party } from "@/config/party";

type Parts = { d: number; h: number; m: number; s: number };

function diff(target: number): Parts | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  return {
    d: Math.floor(ms / 86_400_000),
    h: Math.floor((ms / 3_600_000) % 24),
    m: Math.floor((ms / 60_000) % 60),
    s: Math.floor((ms / 1000) % 60),
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/* Contador em estilo de gravação: ponto vermelho pulsando e dígitos mono. */
export function Countdown() {
  const target = new Date(party.startsAt).getTime();
  // Começa vazio de propósito: a conta só existe no cliente, senão o
  // HTML do servidor e o da hidratação discordariam.
  const [parts, setParts] = useState<Parts | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setParts(diff(target));
    const id = window.setInterval(() => setParts(diff(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  const started = mounted && parts === null;

  return (
    <div className="meta text-ivory-dim" role="timer" aria-label="Tempo até a festa">
      <p className="flex items-center gap-2">
        <span className="live-dot block h-1.5 w-1.5 rounded-full bg-lipstick-glow" aria-hidden="true" />
        {started ? "Acontecendo agora" : "As portas fecham em"}
      </p>
      {!started && (
        <p className="mt-2 font-mono text-lg tracking-[0.12em] text-ivory tabular-nums sm:text-2xl">
          {parts ? `${pad(parts.d)}d ${pad(parts.h)}h ${pad(parts.m)}m ${pad(parts.s)}s` : "--d --h --m --s"}
        </p>
      )}
    </div>
  );
}
