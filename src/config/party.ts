/* ══════════════════════════════════════════════════════════════════════
   ✏️  EDITE AQUI — todo o conteúdo do site mora neste arquivo.
   Endereço, WhatsApp e e-mail ainda são exemplos.
   ══════════════════════════════════════════════════════════════════════ */

export const party = {
  /* ── Identidade ────────────────────────────────────────────────── */
  name: "The Rocky Horror Party",
  titleTop: "The Rocky Horror",
  titleBottom: "Party",
  tagline: "Uma noite. Seis horas. Nenhuma saída.",

  /* ── Quando ────────────────────────────────────────────────────── */
  // ISO com fuso de Brasília. A contagem regressiva lê daqui.
  startsAt: "2026-11-07T23:00:00-03:00",
  dateShort: "07.11.2026",
  dateLabel: "Sábado, 7 de novembro de 2026",
  timeLabel: "23h — 05h",

  /* ── Onde ──────────────────────────────────────────────────────── */
  venue: "Mansão dos Horrores",
  address: "Rua Major Diogo, 518 — Bela Vista",
  city: "São Paulo, SP",
  mapsQuery: "Rua Major Diogo 518, Bela Vista, São Paulo",

  /* ── Contato / RSVP ────────────────────────────────────────────── */
  whatsapp: "5511900000000", // só números, com país e DDD
  email: "contato@exemplo.com",
  rsvpDeadline: "3 de novembro",

  /* ── Texto de abertura (aparece palavra por palavra ao rolar) ─── */
  manifesto:
    "Às 23h, as portas se fecham atrás de você. Lá dentro, a luz é pouca, o som é alto e ninguém é exatamente quem parece. Até o amanhecer, a casa não pertence mais a nós.",

  /* ── Aviso de classificação ────────────────────────────────────── */
  rating: "18",
  advisory: ["Sustos", "Sangue cenográfico", "Luz estroboscópica", "Neblina artificial"],
} as const;

/* ── A noite, em atos ────────────────────────────────────────────── */
export type Act = { time: string; title: string; text: string };

export const night: Act[] = [
  { time: "23:00", title: "As portas fecham", text: "A casa recebe os convidados. Depois que a porta fecha, não há volta." },
  { time: "00:00", title: "Meia-noite", text: "As luzes se apagam. O que acontece a seguir, só quem está lá dentro vê." },
  { time: "01:00", title: "A pista", text: "Som alto, pouca luz e nenhum lugar para se esconder." },
  { time: "05:00", title: "O amanhecer", text: "As portas se abrem. Quem ficou até o fim, sobreviveu." },
];

/* ── Cardápio ────────────────────────────────────────────────────── */
// image   = foto em /public/img (sem a barra inicial do "public")
// flavors = sabores/cores/marcas; cada um pode ter a sua própria foto
// color   = cor de destaque (brilho atrás da foto)
// kind    = desenho de reserva, usado quando o item ainda não tem foto
// limited = selo "Estoque limitadíssimo"
export type Flavor = { name: string; image: string; color?: string };
export type MenuItem = {
  name: string;
  color: string;
  image?: string;
  kind?: "garrafa" | "longneck" | "lata" | "pet";
  flavors?: Flavor[];
  limited?: boolean;
};
export type MenuCategory = {
  id: string;
  title: string;
  subtitle: string;
  items: MenuItem[];
};

export const menu: MenuCategory[] = [
  {
    id: "destilados",
    title: "Destilados",
    subtitle: "Para os que não têm medo do escuro",
    items: [
      { name: "Vodka", image: "/img/vodka.webp", color: "#cfe3ea" },
      {
        name: "Askov",
        color: "#2f6bff",
        flavors: [
          { name: "Azul", image: "/img/askov_azul.webp", color: "#2f6bff" },
          { name: "Vermelha", image: "/img/askov_vermelha.webp", color: "#d11a1a" },
          { name: "Amarela", image: "/img/askov_amarela.webp", color: "#f2c230" },
        ],
      },
      {
        name: "Gin",
        color: "#2f4fd8",
        flavors: [
          { name: "Azul", image: "/img/gin_azul.webp", color: "#2f4fd8" },
          { name: "Rosa", image: "/img/gin_rosa.webp", color: "#ff6fa8" },
        ],
      },
      { name: "Tekiloca", image: "/img/tequiloka.webp", color: "#e0b04a" },
      { name: "Jurupinga", image: "/img/jurupinga.webp", color: "#c47a2c" },
    ],
  },
  {
    id: "mistas",
    title: "Mistas & Ice",
    subtitle: "Geladas, doces e perigosas",
    items: [
      {
        name: "Skol Beats",
        color: "#2f6bff",
        flavors: [
          { name: "Azul", image: "/img/skol_beats_azul.webp", color: "#2f6bff" },
          { name: "GT", image: "/img/skol_beats_gt.webp", color: "#d4dd6a" },
          { name: "Rosa", image: "/img/skol_beats_rosa.webp", color: "#ff6fa8" },
        ],
      },
      {
        name: "Ice",
        color: "#7ed957",
        limited: true,
        flavors: [
          { name: "Maçã verde", image: "/img/ice_maca_verde.webp", color: "#7ed957" },
          { name: "Frutas tropicais", image: "/img/ice_frutas_tropicais.webp", color: "#ff9d2e" },
        ],
      },
    ],
  },
  {
    id: "cervejas",
    title: "Cervejas & Vinho",
    subtitle: "Para brindar com os mortos",
    items: [
      { name: "Brahma Duplo Malte", image: "/img/brahma_duplo_malte.webp", color: "#e0a526" },
      { name: "Dom Bosco", image: "/img/dom_bosco.webp", color: "#7a1030" },
    ],
  },
  {
    id: "sem-alcool",
    title: "Sem álcool",
    subtitle: "Para misturar ou sobreviver",
    items: [
      { name: "Coca-Cola", image: "/img/coca_cola.webp", color: "#d11a1a" },
      { name: "Guaraná", image: "/img/guarana.webp", color: "#3fa34d" },
      { name: "Fanta Uva", image: "/img/fanta_uva.webp", color: "#7b3fb8" },
      {
        name: "Energético",
        color: "#4cc9f0",
        flavors: [
          { name: "Vibe", image: "/img/energetico_vibe.webp", color: "#d6c400" },
          { name: "Baly Maçã verde", image: "/img/energetico_baly_maca_verde.webp", color: "#7ed957" },
          { name: "Baly Melancia", image: "/img/energetico_baly_melancia.webp", color: "#ff4d6d" },
        ],
      },
      { name: "Água", image: "/img/agua.webp", color: "#8fd3ff" },
    ],
  },
];
