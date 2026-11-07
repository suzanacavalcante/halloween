"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { MenuCategory, MenuItem } from "@/config/party";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* ── desenhos das embalagens ─────────────────────────────────────── */
const shapes: Record<NonNullable<MenuItem["kind"]>, { d: string; level: number; cap?: boolean }> = {
  garrafa: {
    d: "M40 10 h20 v8 h-3 v22 c0 14 20 22 20 48 v78 a8 8 0 0 1 -8 8 H31 a8 8 0 0 1 -8 -8 V88 c0 -26 20 -34 20 -48 V18 h-3 z",
    level: 72,
    cap: true,
  },
  longneck: {
    d: "M44 6 h12 v8 h-1 v50 c0 14 15 22 15 42 v60 a8 8 0 0 1 -8 8 H38 a8 8 0 0 1 -8 -8 v-60 c0 -20 15 -28 15 -42 V14 h-1 z",
    level: 80,
    cap: true,
  },
  lata: {
    d: "M28 38 q0 -8 8 -8 h28 q8 0 8 8 v104 q0 8 -8 8 H36 q-8 0 -8 -8 z",
    level: 56,
  },
  pet: {
    d: "M42 8 h16 v10 h-2 c0 8 16 14 16 34 v110 a10 10 0 0 1 -10 10 H38 a10 10 0 0 1 -10 -10 V52 c0 -20 16 -26 16 -34 h-2 z",
    level: 62,
    cap: true,
  },
};

function Pack({ kind = "garrafa", color }: { kind?: MenuItem["kind"]; color: string }) {
  const id = useId();
  const s = shapes[kind];
  return (
    <svg viewBox="0 0 100 180" className="h-full w-auto drop-shadow-[0_18px_22px_rgba(0,0,0,0.6)]" aria-hidden="true">
      <defs>
        <clipPath id={id}>
          <path d={s.d} />
        </clipPath>
      </defs>
      <path d={s.d} fill="rgba(255,255,255,0.06)" />
      <g clipPath={`url(#${id})`}>
        <rect x="0" y={s.level} width="100" height="180" style={{ fill: color, transition: "fill 0.45s" }} opacity="0.92" />
        <rect x="0" y={s.level - 1} width="100" height="3" fill="#fff" opacity="0.35" />
        <rect x="34" y="0" width="7" height="180" fill="#fff" opacity="0.16" />
        <rect x="58" y="0" width="3" height="180" fill="#000" opacity="0.18" />
      </g>
      <rect x="31" y="104" width="38" height="34" rx="2" fill="#050505" opacity="0.45" clipPath={`url(#${id})`} />
      <path d={s.d} fill="none" stroke="rgba(217,211,201,0.55)" strokeWidth="2" strokeLinejoin="round" />
      {s.cap && <rect x={kind === "pet" ? 42 : kind === "longneck" ? 44 : 40} y={kind === "longneck" ? 3 : 6} width={kind === "garrafa" ? 20 : kind === "pet" ? 16 : 12} height="6" rx="1.5" fill="#d9d3c9" opacity="0.85" />}
      {kind === "lata" && <ellipse cx="50" cy="31" rx="18" ry="2.5" fill="none" stroke="rgba(217,211,201,0.5)" strokeWidth="1.5" />}
    </svg>
  );
}

/* ── card 3D ─────────────────────────────────────────────────────── */
function DrinkCard({ item, index }: { item: MenuItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  const flavor = item.flavors?.[shown];
  const tint = flavor?.color ?? item.color;
  const photos = item.flavors ? item.flavors.map((f) => f.image) : item.image ? [item.image] : [];
  const hasPhoto = photos.length > 0;
  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.classList.remove("is-idle");
    el.style.setProperty("--ry", `${(x - 0.5) * 18}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 18}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--glare", "1");
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.classList.add("is-idle");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--glare", "0");
  }

  return (
    <li className="menu-scene menu-card-in" style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}>
      <div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        className="menu-tilt is-idle relative flex h-full flex-col border border-night-line bg-night-soft"
      >
        <div className="menu-glare pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* palco do produto */}
        <div
          className={`relative flex h-72 items-center justify-center overflow-hidden px-4 py-5 ${hasPhoto ? "bg-[#f4f1ea]" : ""}`}
          style={hasPhoto ? { backgroundImage: `radial-gradient(ellipse 70% 55% at 50% 100%, ${tint}55, transparent 75%)` } : undefined}
        >
          {hasPhoto ? (
            <div className="menu-z3 relative h-full w-full">
              {photos.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={i === shown ? `${item.name}${flavor ? ` ${flavor.name}` : ""}` : ""}
                  aria-hidden={i !== shown}
                  loading="lazy"
                  draggable={false}
                  className={`absolute inset-0 h-full w-full object-contain mix-blend-multiply drop-shadow-[0_14px_14px_rgba(0,0,0,0.25)] transition-all duration-500 ${
                    i === shown ? "scale-100 opacity-100" : "scale-90 opacity-0"
                  }`}
                />
              ))}
            </div>
          ) : (
            <>
              <div
                className="pointer-events-none absolute inset-x-6 top-8 bottom-2 rounded-full blur-3xl"
                style={{ background: tint, opacity: 0.28 }}
                aria-hidden="true"
              />
              <div className="menu-z3 menu-float relative h-52">
                <Pack kind={item.kind} color={tint} />
              </div>
            </>
          )}
          {item.limited && (
            <span className="menu-z2 eyebrow absolute top-3 left-3 inline-flex items-center gap-2 border border-lipstick-glow bg-night/90 px-2.5 py-1 text-[0.55rem] text-lipstick-glow">
              <span className="live-dot block h-1.5 w-1.5 rounded-full bg-lipstick-glow" aria-hidden="true" />
              Estoque limitadíssimo
            </span>
          )}
        </div>

        {/* informações */}
        <div className="menu-z1 flex flex-1 flex-col px-5 pt-3 pb-5">
          <h3 className="font-display text-2xl">{item.name}</h3>

          {item.flavors && (
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={`Opções de ${item.name}`}>
              {item.flavors.map((f, i) => {
                const on = shown === i;
                return (
                  <button
                    key={f.name}
                    type="button"
                    onMouseEnter={() => setShown(i)}
                    onFocus={() => setShown(i)}
                    onClick={() => setShown(i)}
                    aria-pressed={on}
                    className={`meta inline-flex min-h-11 items-center gap-2 border px-3.5 transition-colors ${
                      on ? "border-ivory bg-ivory text-night" : "border-night-line text-ivory hover:border-ivory-dim"
                    }`}
                  >
                    <span className="block h-3 w-3 rounded-full border border-ivory/30" style={{ background: f.color }} aria-hidden="true" />
                    {f.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

/* ── tela ────────────────────────────────────────────────────────── */
export function MenuBoard({ categories }: { categories: MenuCategory[] }) {
  const [active, setActive] = useState("todos");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = norm(query.trim());
    return categories
      .filter((c) => active === "todos" || c.id === active)
      .map((c) => ({
        ...c,
        items: c.items.filter((i) => !q || norm(i.name).includes(q) || i.flavors?.some((f) => norm(f.name).includes(q)) || norm(c.title).includes(q)),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, active, query]);

  const tabs = [{ id: "todos", title: "Tudo" }].concat(categories.map((c) => ({ id: c.id, title: c.title })));
  let counter = 0;

  return (
    <div>
      {/* barra fixa de filtros */}
      <div className="sticky top-[4.4rem] z-30 -mx-5 mt-10 border-y border-night-line bg-night/90 px-5 py-3 backdrop-blur-md sm:mx-0 sm:border-x sm:px-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Categorias">
            {tabs.map((t) => {
              const on = active === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(t.id)}
                  className={`meta min-h-11 shrink-0 border px-4 whitespace-nowrap transition-colors ${
                    on ? "border-ivory bg-ivory text-night" : "border-night-line text-ivory-dim hover:text-ivory"
                  }`}
                >
                  {t.title}
                </button>
              );
            })}
          </div>
          <input
            type="search"
            aria-label="Buscar bebida ou sabor"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar: gin, rosa…"
            className="field mt-0! min-h-11 sm:w-52"
            autoComplete="off"
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="meta mt-16 text-center text-ivory-dim" aria-live="polite">
          Nada encontrado para “{query}”.{" "}
          <button
            type="button"
            className="text-ivory underline underline-offset-4"
            onClick={() => {
              setQuery("");
              setActive("todos");
            }}
          >
            Limpar busca
          </button>
        </p>
      ) : (
        visible.map((cat) => (
          <section key={cat.id} className="mt-14" aria-labelledby={`cat-${cat.id}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h2 id={`cat-${cat.id}`} className="poster-title text-3xl sm:text-4xl">
                {cat.title}
              </h2>
              <p className="text-sm italic text-ivory-dim">{cat.subtitle}</p>
            </div>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item) => (
                <DrinkCard key={item.name} item={item} index={counter++} />
              ))}
            </ul>
          </section>
        ))
      )}

      <p className="meta mt-14 text-ivory-dim">Bebidas alcoólicas apenas para maiores de 18 anos. Beba com moderação.</p>
    </div>
  );
}
