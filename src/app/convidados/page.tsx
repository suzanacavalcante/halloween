import type { Metadata } from "next";
import Link from "next/link";
import { party } from "@/config/party";
import { readRsvps, summarize } from "@/lib/rsvp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Lista de convidados — ${party.name}`,
  description: "Quem já confirmou presença na festa.",
};

const attendingBadge = {
  sim: { text: "Confirmado", className: "bg-lipstick text-ivory" },
  talvez: { text: "Talvez", className: "border border-ivory-dim text-ivory-dim" },
  nao: { text: "Não vem", className: "border border-night-line text-ivory-dim" },
} as const;

const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

export default async function ConvidadosPage() {
  const list = await readRsvps();
  const summary = summarize(list);
  const recent = [...list].reverse();

  const stats = [
    { label: "Pessoas esperadas", value: summary.pessoas },
    { label: "Confirmados", value: summary.confirmados },
    { label: "Talvez", value: summary.talvez },
    { label: "Não vêm", value: summary.ausentes },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-5 pt-32 pb-24">
      <p className="eyebrow text-lipstick-glow">{party.name}</p>
      <h1 className="poster-title mt-6 text-5xl sm:text-7xl">Lista de convidados</h1>

      <dl className="mt-12 grid grid-cols-2 gap-px bg-night-line sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-night px-5 py-6">
            <dt className="eyebrow text-[0.6rem] text-ivory-dim">{s.label}</dt>
            <dd className="font-display mt-3 text-4xl tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      {summary.total === 0 ? (
        <p className="meta mt-16 text-center text-ivory-dim">Ninguém na lista ainda.</p>
      ) : (
        <ul className="mt-12">
          {recent.map((r) => {
            const badge = attendingBadge[r.attending];
            return (
              <li key={r.id} className="border-b border-night-line py-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-display text-2xl">
                    {r.name}
                    {r.attending !== "nao" && r.guests > 0 && (
                      <span className="ml-2 text-base text-ivory-dim">+ {r.guests}</span>
                    )}
                  </p>
                  <span className={`eyebrow px-3 py-1 text-[0.6rem] ${badge.className}`}>{badge.text}</span>
                </div>
                <p className="mt-1 text-sm text-ivory-dim">
                  {formatter.format(new Date(r.createdAt))}
                  {r.phone && ` · ${r.phone}`}
                </p>
                {r.message && <p className="mt-3 italic text-ivory/80">“{r.message}”</p>}
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-16 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-line">
          Voltar
        </Link>
        <Link href="/#rsvp" className="btn btn-red">
          Nova confirmação
        </Link>
      </div>
    </div>
  );
}
