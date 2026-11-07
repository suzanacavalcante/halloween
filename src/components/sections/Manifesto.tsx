"use client";

import { useEffect, useRef, useState } from "react";
import { party } from "@/config/party";
import { Scramble } from "@/components/fx/Scramble";
import { WatchingEyes } from "@/components/fx/WatchingEyes";

/* O texto acende palavra por palavra conforme a página rola. */
export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const words = party.manifesto.split(" ");
  const [lit, setLit] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 quando o bloco entra por baixo, 1 quando chega a um terço da tela
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      setLit(Math.round(p * words.length));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [words.length]);

  return (
    <section id="noite" className="relative overflow-hidden px-5 py-32 sm:px-10 sm:py-48">
      <WatchingEyes
        pairs={[
          { top: "12%", left: "84%", size: 22, delay: 0.4 },
          { top: "78%", left: "6%", size: 16, delay: 1.6 },
          { top: "88%", left: "70%", size: 12, delay: 2.8 },
        ]}
      />
      <div className="relative z-10 mx-auto max-w-6xl">
        <p className="eyebrow text-lipstick-glow">
          <Scramble text="I — A casa" />
        </p>
        <div ref={ref} className="mt-10">
          <p className="font-display text-[clamp(2rem,4.6vw,4.2rem)] leading-[1.12] font-light" aria-label={party.manifesto}>
            {words.map((w, i) => (
              <span
                key={i}
                aria-hidden="true"
                className="transition-[color,opacity] duration-500"
                style={{ opacity: i < lit ? 1 : 0.12, color: i < lit && /casa|ninguém|amanhecer/i.test(w) ? "var(--color-lipstick-glow)" : undefined }}
              >
                {w}{" "}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
