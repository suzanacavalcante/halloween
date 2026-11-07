"use client";

import { useEffect, useRef, useState } from "react";

type Pair = { top: string; left: string; size: number; delay: number };

/* Olhos no escuro. Só abrem quando o bloco está na tela, piscam em
   ritmos diferentes e as pupilas seguem o ponteiro (ou vagam, no celular). */
export function WatchingEyes({ pairs, className = "" }: { pairs: Pair[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOpen(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);

    let raf = 0;
    const look = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let moved = false;
    const onMove = (e: PointerEvent) => {
      look.x = e.clientX;
      look.y = e.clientY;
      moved = true;
    };
    const tick = (now: number) => {
      if (!moved) {
        look.x = window.innerWidth * (0.5 + Math.sin(now / 1700) * 0.4);
        look.y = window.innerHeight * (0.5 + Math.cos(now / 2300) * 0.3);
      }
      el.querySelectorAll<HTMLElement>("[data-pupil]").forEach((p) => {
        const r = p.parentElement!.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const a = Math.atan2(look.y - cy, look.x - cx);
        const d = Math.min(1, Math.hypot(look.x - cx, look.y - cy) / 400);
        p.style.transform = `translate(${(Math.cos(a) * d * 28).toFixed(1)}%, ${(Math.sin(a) * d * 22).toFixed(1)}%)`;
      });
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden="true">
      {pairs.map((p, i) => (
        <div
          key={i}
          className="absolute flex transition-opacity duration-[2000ms]"
          style={{ top: p.top, left: p.left, gap: p.size * 0.55, opacity: open ? 1 : 0, transitionDelay: `${p.delay}s` }}
        >
          {[0, 1].map((side) => (
            <div
              key={side}
              className={`eye relative overflow-hidden ${open ? "eye-blink" : ""}`}
              style={{
                width: p.size,
                height: p.size * 0.42,
                animationDelay: `${p.delay * 1.7 + side * 0.02}s`,
                animationDuration: `${5 + (i % 3) * 1.6}s`,
                transform: `scaleY(${open ? 1 : 0.05})`,
              }}
            >
              <div data-pupil className="absolute inset-0 flex items-center justify-center">
                <div className="h-[92%] rounded-full bg-[radial-gradient(circle,#000_32%,#5b0b0d_36%,#2a0506_70%)]" style={{ aspectRatio: "1" }} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
