"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { Scramble } from "@/components/fx/Scramble";
import { scare } from "@/components/fx/JumpScare";

/* Fotos: Unsplash (licença gratuita, uso comercial permitido) — créditos no README.
   `pos` ancora o recorte; `face` é para onde a câmera se aproxima. */
const killers = [
  { name: "Michael Myers", film: "Halloween", year: "1978", line: "Não corre. Nunca precisou.", src: "/killers/michael.jpg", pos: "38% 0%", face: "38% 12%", zoom: 1.12 },
  { name: "Jason Voorhees", film: "Sexta-Feira 13", year: "1980", line: "Chega sem avisar. Sai sem ser visto.", src: "/killers/jason.jpg", pos: "42% 0%", face: "42% 10%", zoom: 1.45 },
  { name: "Freddy Krueger", film: "A Hora do Pesadelo", year: "1984", line: "Se você dormir, ele entra.", src: "/killers/freddy.jpg", pos: "42% 0%", face: "40% 16%", zoom: 1.4 },
  { name: "Chucky", film: "Brinquedo Assassino", year: "1988", line: "Pequeno. Paciente. Sorrindo.", src: "/killers/chucky.jpg", pos: "48% 30%", face: "48% 36%", zoom: 1.2 },
  { name: "Ghostface", film: "Pânico", year: "1996", line: "Qual é o seu filme de terror favorito?", src: "/killers/ghostface.jpg", pos: "55% 45%", face: "58% 45%", zoom: 1.12 },
];

/* Corredor horizontal preso na tela: o scroll vertical empurra a fila
   de convidados para o lado. Cada um sai do escuro quando chega ao
   centro (--f de 0 a 1 por painel). O último não fica parado. */
export function Lineup() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr) return;
    const panels = Array.from(tr.querySelectorAll<HTMLElement>("[data-panel]"));
    let raf = 0;

    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // do centro do primeiro ao centro do último convidado
      const first = panels[0];
      const last = panels[panels.length - 1];
      const start = first.offsetLeft + first.offsetWidth / 2 - vw / 2;
      const end = last.offsetLeft + last.offsetWidth / 2 - vw / 2;
      const shift = Math.max(1, end - start);
      // a altura da seção é o próprio comprimento do corredor (+ uma pausa no fim)
      sec.style.height = `${vh + shift + vh * 0.35}px`;
      const r = sec.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -r.top / shift));
      tr.style.transform = `translate3d(${(-(start + p * shift)).toFixed(1)}px, 0, 0)`;
      sec.style.setProperty("--p", p.toFixed(4));

      panels.forEach((el, i) => {
        const pr = el.getBoundingClientRect();
        const center = pr.left + pr.width / 2;
        const f = Math.max(0, 1 - Math.abs(center - vw / 2) / (vw * 0.55));
        el.style.setProperty("--f", f.toFixed(3));
        const lit = f > 0.72 && r.top <= 1 && r.bottom >= vh - 1;
        el.classList.toggle("is-lit", lit);
        // o último convidado vem até você
        if (lit && i === panels.length - 1 && f > 0.93) {
          scare("ghostface", "ghostface", "Qual é o seu filme de terror favorito?");
        }
      });
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
    <section ref={section} id="convidados" className="relative" style={{ height: "500vh" }}>
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden bg-black">
        <div className="relative z-10 flex items-end justify-between gap-6 px-5 pt-24 sm:px-10">
          <div>
            <p className="eyebrow text-lipstick-glow">
              <Scramble text="Convidados de honra" />
            </p>
            <h2 className="poster-title mt-4 text-[clamp(2rem,4.5vw,4rem)]">Eles já confirmaram</h2>
          </div>
          {/* progresso do corredor */}
          <div className="meta hidden items-center gap-3 text-ivory-dim sm:flex">
            <span>01</span>
            <span className="relative block h-px w-40 bg-night-line">
              <span className="absolute inset-0 origin-left bg-lipstick-glow" style={{ transform: "scaleX(var(--p))" }} />
            </span>
            <span>0{killers.length}</span>
          </div>
        </div>

        <div ref={track} className="flex flex-1 items-center will-change-transform">
          {/* respiro antes do primeiro */}
          <div className="w-[30vw] shrink-0 sm:w-[35vw]" />
          {killers.map(({ name, film, year, line, src, pos, face, zoom }, i) => (
            <article
              key={name}
              data-panel
              className="killer relative flex w-[86vw] shrink-0 flex-col items-center px-3 sm:w-[46vw] lg:w-[34vw]"
              style={{ ["--f" as string]: 0 }}
            >
              {/* o retrato: sai do escuro quando chega ao centro */}
              <div
                className="killer-frame relative aspect-[3/4] w-full max-w-[26rem] overflow-hidden"
                style={{ transform: "scale(calc(0.86 + var(--f) * 0.14))" }}
              >
                <div className="killer-push absolute inset-0" style={{ transformOrigin: face, ["--z" as string]: zoom }}>
                  <Image
                    src={src}
                    alt={`${name}, de ${film}`}
                    fill
                    sizes="(min-width: 1024px) 26rem, 86vw"
                    className="killer-photo object-cover"
                    style={{ objectPosition: pos }}
                    priority={i === 0}
                  />
                </div>
                {/* duotom vermelho, vinheta que esconde as bordas, glitch */}
                <div className="killer-tint absolute inset-0" aria-hidden="true" />
                <div className="killer-vignette absolute inset-0" aria-hidden="true" />
                <div className="killer-glitch absolute inset-0" aria-hidden="true" style={{ backgroundImage: `url(${src})`, backgroundPosition: pos }} />
                <div className="killer-lamp absolute inset-0" aria-hidden="true" />
                <span className="meta absolute top-3 left-3 text-ivory/70">{String(i + 1).padStart(2, "0")}</span>
                <span className="meta absolute top-3 right-3 flex items-center gap-1.5 text-ivory/70">
                  <span className="live-dot block h-1.5 w-1.5 rounded-full bg-lipstick-glow" />
                  REC
                </span>
              </div>

              <div className="relative mt-6 text-center" style={{ opacity: "calc(var(--f) * 1.4 - 0.4)" }}>
                <p className="meta text-ivory-dim">
                  {film} · {year}
                </p>
                <h3 className="poster-title mt-3 text-[clamp(1.8rem,3.2vw,3rem)]">{name}</h3>
                <p className="font-display mt-2 text-lg text-lipstick-glow italic">“{line}”</p>
              </div>
            </article>
          ))}
          <div className="w-[30vw] shrink-0 sm:w-[35vw]" />
        </div>
      </div>
    </section>
  );
}
