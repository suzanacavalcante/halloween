"use client";

import { useScrollVar } from "@/components/fx/ScrollVar";
import { Figure } from "@/components/fx/Figure";

/* Cena presa na tela: uma porta iluminada no fundo do corredor vai se
   fechando conforme a página rola. Tem alguém parado nela. Quando só
   resta um fio de luz, ele pisca e apaga.
   Tudo deriva de --p (0..1) calculado pelo scroll. */

// helpers de CSS: faixa de p → 0..1
const range = (from: number, to: number) => `clamp(0, calc((var(--p) - ${from}) / ${to - from}), 1)`;

export function DoorScene() {
  const ref = useScrollVar<HTMLElement>("sticky");
  const open = `clamp(0, calc(1 - var(--p) * 1.18), 1)`; // 1 aberta → 0 fechada

  return (
    <section ref={ref} data-clock-start className="relative h-[280vh]" aria-label="As portas se fecham às 23h">
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden bg-black">
        {/* luz que a porta joga nas paredes */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 40% 55% at 50% 58%, rgba(255,170,90,0.22), transparent 70%)",
            opacity: open,
          }}
          aria-hidden="true"
        />

        {/* corredor: linhas de fuga */}
        <svg className="absolute inset-0 h-full w-full opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <g stroke="#2a2524" strokeWidth="0.15" fill="none">
            <path d="M0 0 L41 26 M100 0 L59 26 M0 100 L41 86 M100 100 L59 86" />
            <path d="M41 26 L59 26 L59 86 L41 86Z" />
          </g>
        </svg>

        {/* a porta */}
        <div className="relative h-[60vh] w-[18vh] min-w-24" aria-hidden="true">
          <div className="absolute inset-0 border border-[#1a1614] bg-black" />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              // a porta corta a cena (em vez de espremer quem está nela)
              clipPath: `inset(0 calc((1 - ${open}) * 100%) 0 0)`,
              opacity: `clamp(0, calc((0.97 - var(--p)) * 30), 1)`,
              background: "linear-gradient(180deg, #f6dcae 0%, #e6a45e 60%, #b3561f 100%)",
              boxShadow: "0 0 120px 30px rgba(255,160,80,0.25)",
            }}
          >
            {/* alguém no batente */}
            <div className="absolute bottom-0 left-[12%] h-[62%]">
              <Figure className="h-full w-auto fill-[#120b08] blur-[0.6px]" />
            </div>
          </div>
          {/* o fio de luz que sobra, piscando */}
          <div
            className="door-gap absolute inset-y-0 left-0 w-[2px] bg-[#f6dcae] shadow-[0_0_20px_4px_rgba(255,170,90,0.6)]"
            style={{ opacity: `calc(${range(0.7, 0.8)} * clamp(0, calc((0.97 - var(--p)) * 30), 1))` }}
          />
          {/* luz no chão */}
          <div
            className="absolute top-full left-0 h-[22vh] w-full origin-top-left"
            style={{
              transform: `scaleX(${open}) perspective(300px) rotateX(62deg)`,
              background: "linear-gradient(180deg, rgba(246,220,174,0.45), transparent)",
              opacity: open,
            }}
          />
        </div>

        {/* textos */}
        <p className="meta absolute top-[12%] left-1/2 -translate-x-1/2 text-ivory-dim" style={{ opacity: range(0.02, 0.12) }}>
          23:00
        </p>
        <h2
          className="poster-title absolute bottom-[14%] left-1/2 w-full -translate-x-1/2 px-5 text-center text-[clamp(2.2rem,6vw,5.5rem)]"
          style={{ opacity: `calc(${range(0.12, 0.3)} - ${range(0.55, 0.65)})`, filter: `blur(calc((1 - ${range(0.12, 0.3)}) * 8px))` }}
        >
          As portas se fecham.
        </h2>
        <h2
          className="poster-title absolute bottom-[14%] left-1/2 w-full -translate-x-1/2 px-5 text-center text-[clamp(2.2rem,6vw,5.5rem)] text-lipstick-glow"
          style={{ opacity: range(0.66, 0.82), filter: `blur(calc((1 - ${range(0.66, 0.82)}) * 8px))` }}
        >
          Ninguém sai.
        </h2>
      </div>
    </section>
  );
}
