"use client";

import { useEffect, useState } from "react";
import { Figure } from "@/components/fx/Figure";
import Image from "next/image";

export type ScareKind = "figure" | "ghostface" | "michael";

const PHOTOS: Partial<Record<ScareKind, { src: string; focus: string }>> = {
  ghostface: { src: "/killers/ghostface.jpg", focus: "55% 45%" },
  michael: { src: "/killers/michael.jpg", focus: "38% 10%" },
};
type Scare = { kind: ScareKind; caption?: string; id: number };

const EVENT = "rhp:scare";

/* Dispara um susto — no máximo uma vez por sessão para cada chave.
   Qualquer componente chama; o <JumpScare/> global mostra, e o
   <SoundToggle/> toca o estouro se o som estiver ligado. */
const fired = new Set<string>();
export function scare(key: string, kind: ScareKind, caption?: string) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (fired.has(key)) return;
  try {
    if (window.sessionStorage.getItem(`rhp-scare-${key}`)) return;
    window.sessionStorage.setItem(`rhp-scare-${key}`, "1");
  } catch {
    /* sem storage: vale só a memória desta página */
  }
  fired.add(key);
  window.dispatchEvent(new CustomEvent<{ kind: ScareKind; caption?: string }>(EVENT, { detail: { kind, caption } }));
}

export function onScare(handler: (kind: ScareKind) => void) {
  const fn = (e: Event) => handler((e as CustomEvent<{ kind: ScareKind }>).detail.kind);
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

const DURATION = 1100;

export function JumpScare() {
  const [current, setCurrent] = useState<Scare | null>(null);

  // deixa as fotos no cache: o susto não pode esperar download
  useEffect(() => {
    const t = window.setTimeout(() => {
      Object.values(PHOTOS).forEach((ph) => {
        if (ph) new window.Image().src = ph.src;
      });
    }, 2500);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    let timer = 0;
    const fn = (e: Event) => {
      const { kind, caption } = (e as CustomEvent<{ kind: ScareKind; caption?: string }>).detail;
      setCurrent({ kind, caption, id: Date.now() });
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setCurrent(null);
      }, DURATION);
    };
    window.addEventListener(EVENT, fn);
    return () => {
      window.removeEventListener(EVENT, fn);
      window.clearTimeout(timer);
    };
  }, []);

  if (!current) return null;

  return (
    <div key={current.id} className="scare pointer-events-none fixed inset-0 z-[95] overflow-hidden bg-black" aria-hidden="true">
      <div className="scare-glow absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_45%,#6b0b0e,#0a0000_75%)]" />
      <div className="scare-shaker absolute inset-0">
      <div className="scare-lunge absolute inset-0 flex items-center justify-center">
        {PHOTOS[current.kind] ? (
          <div className="relative h-full w-full">
            <Image
              src={PHOTOS[current.kind]!.src}
              alt=""
              fill
              sizes="100vw"
              priority
              unoptimized
              className="scare-photo object-cover"
              style={{ objectPosition: PHOTOS[current.kind]!.focus }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_40%,transparent_30%,#000_85%)]" />
            <div className="absolute inset-0 bg-[#8e0e12] mix-blend-multiply opacity-60" />
          </div>
        ) : (
          <Figure className="h-[140vh] w-auto translate-y-[18vh] fill-black blur-[2px]" />
        )}
      </div>
      </div>
      <div className="scare-flash absolute inset-0 bg-white" />
      {current.caption && (
        <p className="scare-caption font-display absolute inset-x-0 bottom-[12%] px-5 text-center text-[clamp(1.6rem,4vw,3.2rem)] font-light text-ivory italic">
          {current.caption}
        </p>
      )}
    </div>
  );
}
