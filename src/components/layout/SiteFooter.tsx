import { party } from "@/config/party";
import { ScrollVar } from "@/components/fx/ScrollVar";
import { FogCanvas } from "@/components/fx/FogCanvas";
import { Figure } from "@/components/fx/Figure";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-night-line px-5 pt-24 pb-10 sm:px-10">
      {/* ele esperou até o fim */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <FogCanvas className="absolute inset-0 h-full w-full opacity-70" />
        <div className="absolute bottom-[18%] left-1/2 h-[38%] -translate-x-1/2 opacity-80">
          <Figure className="h-full w-auto fill-black blur-[1.5px]" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-night)_0%,transparent_35%,transparent_70%,var(--color-night)_100%)]" />
      </div>
      {/* o título sobe do chão conforme você chega ao fim */}
      <ScrollVar className="relative">
        <p
          className="poster-title pointer-events-none text-center text-[clamp(3rem,13vw,13rem)] font-light whitespace-nowrap select-none"
          style={{
            transform: "translateY(calc((1 - var(--p)) * 45%))",
            color: "rgba(217, 211, 201, calc(0.02 + var(--p) * 0.08))",
          }}
          aria-hidden="true"
        >
          Rocky Horror
        </p>
      </ScrollVar>

      <p className="meta relative mt-10 text-center text-ivory-dim italic">Ele esperou até o fim.</p>

      <div className="meta relative mt-16 flex flex-col items-center justify-between gap-6 text-ivory-dim sm:flex-row">
        <span>
          {party.dateShort} <span className="mx-2 text-lipstick-glow">/</span> {party.timeLabel}{" "}
          <span className="mx-2 text-lipstick-glow">/</span> {party.city}
        </span>
        <span className="flex gap-8">
          <a href={`https://wa.me/${party.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-ivory">
            WhatsApp
          </a>
          <a href={`mailto:${party.email}`} className="hover:text-ivory">
            E-mail
          </a>
        </span>
      </div>
    </footer>
  );
}
