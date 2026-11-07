"use client";

import { useEffect, useRef } from "react";
import { party } from "@/config/party";
import { FogCanvas } from "@/components/fx/FogCanvas";
import { Countdown } from "@/components/sections/Countdown";
import { Figure } from "@/components/fx/Figure";
import { scare } from "@/components/fx/JumpScare";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  // posição da lanterna em 0..1; lida pelo shader e pelo CSS
  const light = useRef({ x: 0.5, y: 0.42 });
  const stalker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const target = { x: 0.5, y: 0.42 };
    let pointerActive = false;
    let idleSince = performance.now();
    let raf = 0;
    const born = performance.now();

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
      pointerActive = true;
      idleSince = performance.now();
    };

    const tick = (now: number) => {
      // sem cursor (celular, ou parado), a luz vaga sozinha pela sala
      if (!pointerActive || now - idleSince > 4000) {
        const t = now / 1000;
        target.x = 0.5 + Math.sin(t * 0.31) * 0.32 + Math.sin(t * 0.73) * 0.08;
        target.y = 0.55 + Math.cos(t * 0.23) * 0.22;
      }
      light.current.x += (target.x - light.current.x) * 0.07;
      light.current.y += (target.y - light.current.y) * 0.07;
      el.style.setProperty("--lx", `${(light.current.x * 100).toFixed(2)}%`);
      el.style.setProperty("--ly", `${(light.current.y * 100).toFixed(2)}%`);
      // saída: 0 no topo, 1 quando o topo já rolou quase uma tela inteira
      const exit = Math.min(1, Math.max(0, window.scrollY / (el.offsetHeight * 0.85)));
      el.style.setProperty("--exit", exit.toFixed(4));

      // a lanterna encostou nele? ele vem.
      const fig = stalker.current;
      if (fig && exit < 0.2 && now - born > 3500) {
        const f = fig.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const lx = r.left + light.current.x * r.width;
        const ly = r.top + light.current.y * r.height;
        const visible = Number(getComputedStyle(fig).opacity) > 0.3;
        if (visible && f.width > 0 && lx > f.left - 10 && lx < f.right + 10 && ly > f.top + f.height * 0.05 && ly < f.bottom) {
          scare("hero-figure", "figure");
        }
      }
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section ref={sectionRef} id="topo" className="relative flex h-svh min-h-[640px] flex-col overflow-hidden bg-night">
      {/* ── o que só a luz revela ── */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_45%_at_50%_100%,#3a0507,transparent_70%)]" />
        <FogCanvas className="absolute inset-0 h-full w-full" lightRef={light} />

        {/* ao rolar, ela vem na sua direção */}
        <div
          className="absolute inset-0 origin-[60%_95%]"
          style={{ transform: "scale(calc(1 + var(--exit, 0) * 1.6)) translateY(calc(var(--exit, 0) * 6%))" }}
        >
          <div ref={stalker} className="stalker absolute right-[18%] bottom-[9%] h-[34vh] min-h-48 opacity-85">
            <Figure className="h-full w-auto fill-black blur-[1.2px]" />
          </div>
        </div>

        <p className="font-display absolute bottom-[15%] left-[5%] -rotate-3 text-xl tracking-[0.3em] text-lipstick/80 uppercase italic blur-[0.4px] sm:bottom-[20%] sm:text-4xl">
          Não olhe para trás
        </p>
        <p className="meta absolute top-[30%] right-[9%] hidden rotate-2 sm:block text-lipstick/60">ele já está aqui dentro</p>

        <div className="flashlight absolute inset-0" />
        <div className="room-flicker absolute inset-0" />
        <div className="vignette absolute inset-0" />
        {/* a sala escurece enquanto você desce */}
        <div className="absolute inset-0 bg-black" style={{ opacity: "calc(var(--exit, 0) * 0.9)" }} />
      </div>

      {/* ── conteúdo ── */}
      <div
        className="relative z-10 flex flex-1 flex-col px-5 pt-24 pb-8 will-change-transform sm:px-10"
        style={{
          transform: "translateY(calc(var(--exit, 0) * -12vh)) scale(calc(1 + var(--exit, 0) * 0.08))",
          opacity: "calc(1 - var(--exit, 0) * 1.4)",
          filter: "blur(calc(var(--exit, 0) * 10px))",
        }}
      >
        <div className="meta fade flex justify-between text-ivory-dim">
          <span>{party.city}</span>
          <span>{party.dateShort}</span>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="eyebrow rise text-ivory-dim" style={{ animationDelay: "0.3s" }}>
            {party.tagline}
          </p>

          <h1 className="poster-title rise mt-8" style={{ animationDelay: "0.6s" }}>
            <span className="block text-[clamp(1rem,2.2vw,1.6rem)] tracking-[0.8em] text-ivory-dim">The</span>
            <span
              className="glitch mt-3 block text-[15vw] sm:text-[clamp(3rem,11.5vw,11.5rem)] font-light text-ivory"
              data-text="Rocky Horror"
            >
              Rocky Horror
            </span>
            <span className="mt-2 block text-[clamp(1.6rem,4.6vw,4.4rem)] tracking-[0.55em] text-lipstick-glow">Party</span>
          </h1>

          <p className="meta rise mt-10 flex flex-col items-center gap-2 text-ivory sm:flex-row" style={{ animationDelay: "0.9s" }}>
            <span className="whitespace-nowrap">{party.dateLabel}</span>
            <span className="hidden text-lipstick-glow sm:mx-3 sm:inline" aria-hidden="true">/</span>
            <span className="whitespace-nowrap">{party.timeLabel}</span>
          </p>

        </div>

        <div className="fade flex items-end justify-between gap-6" style={{ animationDelay: "1.4s" }}>
          <Countdown />
          <a href="#noite" className="meta hidden flex-col items-center gap-3 text-ivory-dim sm:flex">
            Entre
            <span className="relative block h-14 w-px overflow-hidden bg-night-line">
              <span className="scroll-cue absolute inset-0 bg-ivory" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
