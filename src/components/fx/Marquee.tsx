import { ScrollVar } from "@/components/fx/ScrollVar";

/* Faixa de texto gigante vazado que desliza conforme a página rola. */
export function Marquee({ text, reverse = false }: { text: string; reverse?: boolean }) {
  const line = Array.from({ length: 6 }, () => text).join("  ·  ");
  return (
    <ScrollVar className="overflow-hidden border-y border-night-line py-8 sm:py-12">
      <div aria-hidden="true">
        <p
          className="poster-title marquee-text whitespace-nowrap text-[clamp(4rem,12vw,12rem)] will-change-transform"
          style={{
            transform: reverse
              ? "translateX(calc(-45% + var(--p) * 35%))"
              : "translateX(calc(var(--p) * -35% - 5%))",
          }}
        >
          {line}
        </p>
      </div>
      <span className="sr-only">{text}</span>
    </ScrollVar>
  );
}
