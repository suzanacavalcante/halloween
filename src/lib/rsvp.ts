import { promises as fs } from "node:fs";
import path from "node:path";

export const ATTENDING = ["sim", "talvez", "nao"] as const;

export type Attending = (typeof ATTENDING)[number];

export type Rsvp = {
  id: string;
  createdAt: string;
  name: string;
  attending: Attending;
  guests: number;
  phone: string;
  message: string;
};

export type RsvpInput = Omit<Rsvp, "id" | "createdAt">;

const FILE = path.join(process.cwd(), "data", "rsvps.json");

/* Uma fila em memória evita que dois envios simultâneos leiam o mesmo
   arquivo e um sobrescreva o outro. Suficiente para uma festa. */
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(job: () => Promise<T>): Promise<T> {
  const run = queue.then(job, job);
  queue = run.catch(() => undefined);
  return run;
}

export async function readRsvps(): Promise<Rsvp[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Rsvp[]) : [];
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    // arquivo corrompido: melhor devolver vazio do que derrubar a página
    return [];
  }
}

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

export async function saveRsvp(input: RsvpInput): Promise<{ entry: Rsvp; replaced: boolean }> {
  return serialize(async () => {
    const all = await readRsvps();
    const entry: Rsvp = {
      ...input,
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
    };

    // Mandou duas vezes? A última confirmação vale.
    const at = all.findIndex((r) => normalize(r.name) === normalize(entry.name));
    const replaced = at >= 0;
    if (replaced) all[at] = entry;
    else all.push(entry);

    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, `${JSON.stringify(all, null, 2)}\n`, "utf8");
    return { entry, replaced };
  });
}

export type RsvpSummary = {
  total: number;
  confirmados: number;
  talvez: number;
  ausentes: number;
  pessoas: number;
};

export function summarize(list: Rsvp[]): RsvpSummary {
  let confirmados = 0;
  let talvez = 0;
  let ausentes = 0;
  let pessoas = 0;

  for (const r of list) {
    if (r.attending === "sim") {
      confirmados += 1;
      pessoas += 1 + r.guests;
    } else if (r.attending === "talvez") {
      talvez += 1;
    } else {
      ausentes += 1;
    }
  }

  return { total: list.length, confirmados, talvez, ausentes, pessoas };
}

/* ── validação do que chega do formulário ── */

const asString = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function parseRsvp(body: unknown): { ok: true; value: RsvpInput } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const data = (body ?? {}) as Record<string, unknown>;

  const name = asString(data.name, 80);
  if (name.length < 2) errors.name = "Escreva seu nome (pelo menos 2 letras).";

  const attending = ATTENDING.includes(data.attending as Attending) ? (data.attending as Attending) : null;
  if (!attending) errors.attending = "Diga se você vem.";

  const rawGuests = Number(data.guests);
  const guests = Number.isFinite(rawGuests) ? Math.trunc(rawGuests) : 0;
  if (guests < 0 || guests > 5) errors.guests = "De 0 a 5 acompanhantes.";

  const phone = asString(data.phone, 32);
  if (phone && phone.replace(/\D/g, "").length < 8) errors.phone = "Telefone parece incompleto.";

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      name,
      attending: attending as Attending,
      guests: attending === "nao" ? 0 : guests,
      phone,
      message: asString(data.message, 500),
    },
  };
}
