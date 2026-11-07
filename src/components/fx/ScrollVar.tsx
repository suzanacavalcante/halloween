"use client";

import { useEffect, useRef } from "react";

type Mode = "through" | "sticky";

/* Mede quanto de um elemento já passou pela tela e grava em --p (0..1).
   O CSS faz o resto com calc(var(--p)), sem re-render do React.
   - through: 0 quando o topo entra por baixo, 1 quando o fim sai por cima
   - sticky:  0 quando o topo encosta no topo da tela, 1 quando o fim encosta no fim */
export function useScrollVar<T extends HTMLElement>(mode: Mode = "through", onChange?: (p: number) => void) {
  const ref = useRef<T>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = mode === "sticky" ? -r.top / Math.max(1, r.height - vh) : (vh - r.top) / (vh + r.height);
      const p = Math.min(1, Math.max(0, raw));
      el.style.setProperty("--p", p.toFixed(4));
      cb.current?.(p);
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
  }, [mode]);

  return ref;
}

/* Versão em componente, para usar dentro de páginas do servidor. */
export function ScrollVar({
  mode = "through",
  className,
  style,
  children,
}: {
  mode?: Mode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const ref = useScrollVar<HTMLDivElement>(mode);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
