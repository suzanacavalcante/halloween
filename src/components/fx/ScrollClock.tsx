"use client";

import { useEffect, useRef, useState } from "react";
import { Figure } from "@/components/fx/Figure";
import { scare } from "@/components/fx/JumpScare";

/* Relógio da noite: rolar a página é atravessar a festa, das 23:00 às
   05:00. Quando o relógio passa da meia-noite pela primeira vez, a luz
   cai — e por um instante dá para ver quem está no escuro. */

const START = 23 * 60; // minutos
const SPAN = 6 * 60;

function format(p: number) {
  const m = Math.round(START + p * SPAN) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export function ScrollClock() {
  const [time, setTime] = useState("23:00");
  const [visible, setVisible] = useState(false);
  const [blackout, setBlackout] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const struck = useRef(false);

  useEffect(() => {
    let raf = 0;
    let lastY = window.scrollY;
    let upRun = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      const vh = window.innerHeight;
      const max = document.documentElement.scrollHeight - vh;
      // o relógio só começa a andar quando a porta termina de fechar
      const door = document.querySelector<HTMLElement>("[data-clock-start]");
      const from = door ? door.offsetTop + door.offsetHeight - vh : 0;
      const p = max > from ? Math.min(1, Math.max(0, (window.scrollY - from) / (max - from))) : 0;
      setTime(format(p));
      // some no começo (topo) e no fim (rodapé tem os próprios links)
      setVisible(window.scrollY > vh * 0.7 && window.scrollY < max - 260);
      if (bar.current) bar.current.style.transform = `scaleY(${max > 0 ? window.scrollY / max : 0})`;

      // voltou a subir depois de ter chegado nos atos? não devia ter olhado para trás
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      const atos = document.getElementById("atos");
      const passed = atos ? window.scrollY + vh > atos.offsetTop + vh * 0.5 : false;
      upRun = dy < 0 ? upRun - dy : 0;
      if (passed && upRun > vh * 0.6) {
        scare("look-back", "michael", "Eu disse para não olhar para trás.");
      }

      // meia-noite = 1/6 do caminho
      if (!struck.current && !reduced && p >= 1 / 6 && p < 0.25) {
        struck.current = true;
        setBlackout(true);
        window.setTimeout(() => setBlackout(false), 1300);
      }
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
  }, []);

  return (
    <>
      {/* linha de progresso na borda direita */}
      <div className="pointer-events-none fixed top-0 right-0 z-40 h-full w-px bg-night-line/60" aria-hidden="true">
        <div ref={bar} className="h-full w-full origin-top scale-y-0 bg-lipstick-glow" />
      </div>

      {/* relógio de gravação */}
      <div
        className={`meta pointer-events-none fixed right-5 bottom-5 z-40 flex items-center gap-3 border border-night-line bg-night/70 px-3 py-2 backdrop-blur-sm transition-opacity duration-500 sm:right-8 sm:bottom-8 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        <span className="live-dot block h-1.5 w-1.5 rounded-full bg-lipstick-glow" />
        <span className="text-ivory-dim">REC</span>
        <span className="font-mono text-sm tracking-[0.15em] text-ivory tabular-nums">{time}</span>
      </div>

      {/* queda de luz da meia-noite */}
      {blackout && (
        <div className="blackout pointer-events-none fixed inset-0 z-70 bg-black" aria-hidden="true">
          {/* só aparece nos dois clarões */}
          <div className="blackout-flash absolute inset-0 flex items-end justify-center bg-[radial-gradient(ellipse_50%_70%_at_50%_60%,#5a0a0c,#120304_70%)]">
            <Figure className="mb-[2vh] h-[86vh] w-auto fill-black blur-[4px]" />
          </div>
          <p className="meta absolute top-10 left-1/2 -translate-x-1/2 text-lipstick-glow">00:00</p>
        </div>
      )}
    </>
  );
}
