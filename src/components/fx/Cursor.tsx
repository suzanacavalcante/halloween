"use client";

import { useEffect, useRef, useState } from "react";

/* Cursor de cinema: ponto vermelho preciso + anel que vem atrás, com
   atraso. Sobre links e botões o anel abre e mostra um rótulo
   (data-cursor="Texto"). Elementos com data-magnetic são puxados de
   leve na direção do ponteiro. Só em telas com mouse. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const [active, setActive] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let raf = 0;
    let magnet: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = (e.target as HTMLElement).closest<HTMLElement>("a, button, label, [data-cursor]");
      setActive(Boolean(target));
      setLabel(target?.dataset.cursor ?? "");

      // magnetismo
      const m = (e.target as HTMLElement).closest<HTMLElement>("[data-magnetic]");
      if (magnet && magnet !== m) magnet.style.transform = "";
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.25;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.35;
        m.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      }
    };
    const onLeave = () => {
      pos.x = pos.y = -100;
      if (magnet) magnet.style.transform = "";
    };
    const onScroll = () => {
      const under = document.elementFromPoint(pos.x, pos.y) as HTMLElement | null;
      const target = under?.closest<HTMLElement>("a, button, label, [data-cursor]");
      setActive(Boolean(target));
      setLabel(target?.dataset.cursor ?? "");
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const tick = () => {
      lag.x += (pos.x - lag.x) * 0.16;
      lag.y += (pos.y - lag.y) * 0.16;
      if (dot.current) dot.current.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      if (ring.current) ring.current.style.transform = `translate(${lag.x}px, ${lag.y}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div ref={ring} className="absolute top-0 left-0">
        <div
          className={`flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border transition-[width,height,background-color,border-color] duration-300 ease-out ${
            active
              ? "h-16 w-16 border-lipstick-glow/80"
              : "h-9 w-9 border-ivory/35"
          } ${pressed ? "scale-75" : ""}`}
        >
          {label && <span className="meta text-[0.6rem] text-ivory">{label}</span>}
        </div>
      </div>
      <div ref={dot} className="absolute top-0 left-0">
        <div className={`h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lipstick-glow transition-opacity ${label ? "opacity-0" : ""}`} />
      </div>
    </div>
  );
}
