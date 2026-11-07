"use client";

import { useState } from "react";
import { party } from "@/config/party";
import type { Attending, Rsvp as RsvpEntry } from "@/lib/rsvp";
import { Reveal } from "@/components/ui/Reveal";
import { Scramble } from "@/components/fx/Scramble";

type Status = "idle" | "sending" | "done" | "error";

const attendingOptions: Array<{ value: Attending; label: string }> = [
  { value: "sim", label: "Estarei lá" },
  { value: "talvez", label: "Talvez" },
  { value: "nao", label: "Não vou" },
];

const emptyForm = {
  name: "",
  phone: "",
  attending: "sim" as Attending,
  guests: 0,
  message: "",
};

export function Rsvp() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ entry: RsvpEntry; replaced: boolean } | null>(null);
  const [failure, setFailure] = useState("");

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrors({});
    setFailure("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.status === 422) {
        setErrors(data.errors ?? {});
        setStatus("error");
        setFailure("Confira os campos marcados.");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setFailure(data.error ?? "Algo deu errado. Tente de novo.");
        return;
      }

      setResult({ entry: data.entry, replaced: data.replaced });
      setStatus("done");
    } catch {
      setStatus("error");
      setFailure("Sem conexão. Tente novamente em um instante.");
    }
  }

  const coming = form.attending !== "nao";

  return (
    <section id="rsvp" className="relative overflow-hidden border-t border-night-line px-5 py-28 sm:px-10 sm:py-36">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(142,14,18,0.28),transparent_70%)]"
        aria-hidden="true"
      />
      {/* bordas pulsando como coração */}
      <div className="heartbeat pointer-events-none absolute inset-0" aria-hidden="true" />
      {/* o nome digitado, ecoando no fundo */}
      {form.name.trim().length > 1 && status !== "done" && (
        <p
          className="poster-title name-echo pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 truncate px-5 text-center text-[clamp(4rem,14vw,14rem)] text-lipstick-glow select-none"
          aria-hidden="true"
        >
          {form.name}
        </p>
      )}

      <div className="relative mx-auto grid max-w-6xl gap-16 md:grid-cols-[1fr_1.1fr] md:gap-24">
        <Reveal>
          <p className="eyebrow text-lipstick-glow">
            <Scramble text="IV — A lista" />
          </p>
          <h2 className="poster-title mt-6 text-[clamp(2.6rem,6vw,5.5rem)]">
            Seu nome
            <br />
            na porta
          </h2>
          <p className="mt-8 max-w-sm text-ivory-dim">
            A entrada é só para quem está na lista. Confirme até {party.rsvpDeadline} — se mudar de ideia, envie
            de novo com o mesmo nome.
          </p>
          <p className="meta mt-10 text-ivory-dim">
            Dúvidas:{" "}
            <a href={`https://wa.me/${party.whatsapp}`} target="_blank" rel="noreferrer" className="text-ivory underline-offset-4 hover:underline">
              WhatsApp
            </a>{" "}
            ·{" "}
            <a href={`mailto:${party.email}`} className="text-ivory underline-offset-4 hover:underline">
              E-mail
            </a>
          </p>
        </Reveal>

        <Reveal delay={150}>
          {status === "done" && result ? (
            <div className="border border-night-line bg-night-soft/80 px-8 py-14">
              <p className="meta flex items-center gap-2 text-lipstick-glow">
                <span className="live-dot block h-1.5 w-1.5 rounded-full bg-lipstick-glow" aria-hidden="true" />
                {result.entry.attending === "sim"
                  ? "Confirmado"
                  : result.entry.attending === "talvez"
                    ? "Anotado como talvez"
                    : "Ausência registrada"}
              </p>
              <p className="poster-title mt-8 text-5xl">{result.entry.name}</p>
              {result.entry.attending !== "nao" && result.entry.guests > 0 && (
                <p className="meta mt-3 text-ivory-dim">
                  + {result.entry.guests} acompanhante{result.entry.guests > 1 ? "s" : ""}
                </p>
              )}
              <p className="mt-8 text-ivory-dim">
                {result.entry.attending === "nao"
                  ? "Sentiremos sua falta."
                  : result.replaced
                    ? "Sua resposta anterior foi substituída."
                    : `Seu nome está na lista. ${party.dateShort}, ${party.timeLabel}.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setResult(null);
                  setForm(emptyForm);
                }}
                className="btn btn-line mt-10"
              >
                Confirmar outra pessoa
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-10" noValidate>
              <fieldset>
                <legend className="meta text-ivory-dim">Presença</legend>
                <div className="mt-4 grid grid-cols-3 border border-night-line">
                  {attendingOptions.map((opt) => {
                    const checked = form.attending === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`meta cursor-pointer border-r border-night-line py-4 text-center transition-colors last:border-r-0 has-focus-visible:outline has-focus-visible:outline-lipstick-glow ${
                          checked ? "bg-ivory text-night" : "text-ivory-dim hover:text-ivory"
                        }`}
                      >
                        <input
                          type="radio"
                          name="attending"
                          value={opt.value}
                          checked={checked}
                          onChange={() => set("attending", opt.value)}
                          className="sr-only"
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
                {errors.attending && <p className="mt-2 text-sm text-lipstick-glow">{errors.attending}</p>}
              </fieldset>

              <div>
                <label htmlFor="rsvp-nome" className="meta text-ivory-dim">
                  Nome completo
                </label>
                <input
                  id="rsvp-nome"
                  name="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="field"
                  autoComplete="name"
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "erro-nome" : undefined}
                />
                {errors.name && (
                  <p id="erro-nome" className="mt-2 text-sm text-lipstick-glow">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="grid gap-10 sm:grid-cols-2">
                <div>
                  <label htmlFor="rsvp-tel" className="meta text-ivory-dim">
                    WhatsApp <span className="text-ivory-dim/60">(opcional)</span>
                  </label>
                  <input
                    id="rsvp-tel"
                    name="phone"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className="field"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "erro-tel" : undefined}
                  />
                  {errors.phone && (
                    <p id="erro-tel" className="mt-2 text-sm text-lipstick-glow">
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="rsvp-acomp" className="meta text-ivory-dim">
                    Acompanhantes
                  </label>
                  <select
                    id="rsvp-acomp"
                    name="guests"
                    value={form.guests}
                    onChange={(e) => set("guests", Number(e.target.value))}
                    className="field disabled:opacity-40"
                    disabled={!coming}
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? "Nenhum" : `+ ${n}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="rsvp-recado" className="meta text-ivory-dim">
                  Mensagem <span className="text-ivory-dim/60">(opcional)</span>
                </label>
                <textarea
                  id="rsvp-recado"
                  name="message"
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  rows={2}
                  className="field resize-y"
                />
              </div>

              {status === "error" && failure && (
                <p className="border border-lipstick px-4 py-3 text-sm" role="alert">
                  {failure}
                </p>
              )}

              <button type="submit" disabled={status === "sending"} className="btn btn-red btn-bleed w-full disabled:opacity-60">
                {status === "sending" ? "Enviando…" : "Colocar meu nome na lista"}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
