"use client";

import { useEffect, useState } from "react";

const LINES = ["7 de novembro.", "23 horas.", "Ninguém sai antes do amanhecer."];
const DURATION = 4200;
const KEY = "rhp-intro-vista";

/* Abertura de filme: três frases no escuro, uma vez por sessão.
   Clique ou tecla pula. Sem JS, o próprio CSS some com ela. */
export function Intro() {
  const [state, setState] = useState<"show" | "leaving" | "gone">("show");

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(KEY) === "1";
      window.sessionStorage.setItem(KEY, "1");
    } catch {
      /* sem storage: mostra sempre */
    }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setState("gone");
      return;
    }
    const leave = window.setTimeout(() => setState("leaving"), DURATION);
    const gone = window.setTimeout(() => setState("gone"), DURATION + 900);
    const skip = () => {
      setState("leaving");
      window.setTimeout(() => setState("gone"), 700);
    };
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(gone);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (state === "gone") return null;

  return (
    <div
      className={`intro fixed inset-0 z-[90] flex cursor-pointer items-center justify-center bg-black transition-opacity duration-700 ${
        state === "leaving" ? "pointer-events-none opacity-0" : ""
      }`}
      onClick={() => {
        setState("leaving");
        window.setTimeout(() => setState("gone"), 700);
      }}
      role="presentation"
    >
      <div className="text-center">
        {LINES.map((line, i) => (
          <p
            key={line}
            className="intro-line font-display text-[clamp(1.6rem,4vw,3rem)] font-light text-ivory"
            style={{ animationDelay: `${0.3 + i * 1.2}s` }}
          >
            {line}
          </p>
        ))}
      </div>
      <p className="meta absolute bottom-8 text-ivory-dim/60">Clique para pular</p>
    </div>
  );
}
