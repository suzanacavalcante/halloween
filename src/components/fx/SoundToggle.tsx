"use client";

import { useEffect, useRef, useState } from "react";
import { onScare } from "@/components/fx/JumpScare";

/* Som ambiente gerado na hora (nenhum arquivo de áudio): um zumbido
   grave desafinado, vento filtrado e, de vez em quando, um batimento.
   Começa desligado — o navegador só permite som depois de um clique. */
export function SoundToggle() {
  const [on, setOn] = useState(false);
  const audio = useRef<{ ctx: AudioContext; master: GainNode; timer: number } | null>(null);
  const onRef = useRef(false);
  onRef.current = on;

  /* estouro de susto: ruído rasgado + acorde dissonante, ataque seco */
  useEffect(
    () =>
      onScare(() => {
        const a = audio.current;
        if (!a || !onRef.current) return;
        const { ctx } = a;
        const t = ctx.currentTime;
        const out = ctx.createGain();
        out.gain.setValueAtTime(0.0001, t);
        out.gain.exponentialRampToValueAtTime(0.9, t + 0.015);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
        out.connect(ctx.destination);

        for (const f of [277, 293, 415, 622]) {
          const o = ctx.createOscillator();
          o.type = "sawtooth";
          o.frequency.setValueAtTime(f, t);
          o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 1);
          const g = ctx.createGain();
          g.gain.value = 0.12;
          o.connect(g).connect(out);
          o.start(t);
          o.stop(t + 1.15);
        }
        const len = Math.floor(ctx.sampleRate * 0.6);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const n = ctx.createBufferSource();
        n.buffer = buf;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 2400;
        bp.Q.value = 0.8;
        n.connect(bp).connect(out);
        n.start(t);
      }),
    [],
  );

  function start() {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // zumbido: duas senoides quase iguais batendo entre si
    for (const freq of [55, 55.6, 82.4]) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = freq;
      g.gain.value = freq > 80 ? 0.05 : 0.12;
      osc.connect(g).connect(master);
      osc.start();
    }

    // vento: ruído marrom num passa-baixa que respira
    const len = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 260;
    lfo.connect(lfoGain).connect(lp.frequency);
    lfo.start();
    const ng = ctx.createGain();
    ng.gain.value = 0.35;
    noise.connect(lp).connect(ng).connect(master);
    noise.start();

    // batimento cardíaco, a cada tanto
    const beat = () => {
      const t = ctx.currentTime;
      for (const offset of [0, 0.28]) {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.setValueAtTime(60, t + offset);
        o.frequency.exponentialRampToValueAtTime(30, t + offset + 0.18);
        g.gain.setValueAtTime(0.0001, t + offset);
        g.gain.exponentialRampToValueAtTime(0.5, t + offset + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.25);
        o.connect(g).connect(master);
        o.start(t + offset);
        o.stop(t + offset + 0.3);
      }
    };
    const timer = window.setInterval(beat, 7000);

    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.5);
    audio.current = { ctx, master, timer };
  }

  function toggle() {
    if (!on) {
      if (!audio.current) start();
      else {
        audio.current.ctx.resume();
        audio.current.master.gain.linearRampToValueAtTime(0.5, audio.current.ctx.currentTime + 1.5);
      }
      setOn(true);
    } else if (audio.current) {
      const { ctx, master } = audio.current;
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      window.setTimeout(() => ctx.suspend(), 900);
      setOn(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="meta flex items-center gap-2 text-ivory-dim transition-colors hover:text-ivory"
      aria-pressed={on}
      aria-label={on ? "Desligar som ambiente" : "Ligar som ambiente"}
    >
      <span className="flex h-3 items-end gap-[2px]" aria-hidden="true">
        {[0.5, 1, 0.7, 0.9].map((h, i) => (
          <span
            key={i}
            className="block w-[2px] bg-current transition-all duration-500"
            style={{ height: on ? `${h * 100}%` : "20%" }}
          />
        ))}
      </span>
      Som {on ? "on" : "off"}
    </button>
  );
}
