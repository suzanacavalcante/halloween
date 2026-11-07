import { night, party } from "@/config/party";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollVar } from "@/components/fx/ScrollVar";
import { Scramble } from "@/components/fx/Scramble";
import { WatchingEyes } from "@/components/fx/WatchingEyes";

/* cada letra acende em um momento, como letreiro com defeito */
function FlickerText({ text }: { text: string }) {
  return (
    <span aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden="true" className="flick" style={{ animationDelay: `${((i * 37) % 13) * 0.07}s` }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(party.mapsQuery)}`;

export function EventDetails() {
  return (
    <>
      {/* ── a noite, em atos ── */}
      <section id="atos" className="border-t border-night-line px-5 py-28 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-6xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-lipstick-glow">
                <Scramble text="II — A noite" />
              </p>
              <h2 className="poster-title mt-6 text-[clamp(2.6rem,6vw,5.5rem)]">Quatro atos</h2>
            </div>
            <p className="meta text-ivory-dim">{party.timeLabel}</p>
          </Reveal>

          <ScrollVar className="relative mt-16">
          {/* linha vermelha que corre conforme a noite avança */}
          <span
            className="absolute top-0 left-0 z-10 h-px w-full origin-left bg-lipstick-glow shadow-[0_0_12px_rgba(209,26,26,0.8)]"
            style={{ transform: "scaleX(clamp(0, calc((var(--p) - 0.2) * 3.2), 1))" }}
            aria-hidden="true"
          />
          <ol className="grid border-t border-night-line md:grid-cols-4">
            {night.map((act, i) => (
              <li
                key={act.time}
                className="group relative border-b border-night-line py-10 md:border-r md:border-b-0 md:px-8 md:first:pl-0 md:last:border-r-0"
                style={{ opacity: `clamp(0.12, calc((var(--p) - ${0.22 + i * 0.07}) * 9), 1)` }}
              >
                <span className="absolute top-0 left-0 h-px w-0 bg-lipstick-glow transition-all duration-700 group-hover:w-full" />
                <Reveal delay={i * 120}>
                  <p className="meta text-ivory-dim">Ato {["I", "II", "III", "IV"][i]}</p>
                  <p className="font-display mt-6 text-6xl font-light tabular-nums">{act.time}</p>
                  <h3 className="font-display mt-6 text-2xl text-ivory">{act.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ivory-dim">{act.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
          </ScrollVar>
        </div>
      </section>

      {/* ── local e classificação ── */}
      <section id="local" className="relative overflow-hidden border-t border-night-line px-5 py-28 sm:px-10 sm:py-36">
        <WatchingEyes
          pairs={[
            { top: "10%", left: "90%", size: 14, delay: 0.8 },
            { top: "84%", left: "46%", size: 20, delay: 2 },
          ]}
        />
        <div className="mx-auto grid max-w-6xl gap-20 md:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <p className="eyebrow text-lipstick-glow">
              <Scramble text="III — O endereço" />
            </p>
            <h2 className="poster-title mt-6 text-[clamp(2.6rem,6vw,5.5rem)]">
              <FlickerText text={party.venue} />
            </h2>
            <p className="mt-8 text-lg text-ivory-dim">
              {party.address}
              <br />
              {party.city}
            </p>
            <p className="meta mt-8 text-ivory">{party.dateLabel}</p>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn btn-line mt-10" data-magnetic>
              Ver no mapa
            </a>
          </Reveal>

          {/* bloco de classificação, como no fim de um trailer */}
          <Reveal delay={150}>
            <div className="border border-ivory/30 p-6">
              <div className="flex items-stretch gap-5">
                <span className="flex w-20 shrink-0 items-center justify-center bg-ivory font-sans text-4xl font-bold text-night">
                  {party.rating}
                </span>
                <div className="meta leading-relaxed text-ivory">
                  Não recomendado para menores de {party.rating} anos
                </div>
              </div>
              <p className="meta mt-6 border-t border-ivory/20 pt-5 leading-loose text-ivory-dim">
                Contém: {party.advisory.join(" · ")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
