import { NextResponse } from "next/server";
import { parseRsvp, readRsvps, saveRsvp, summarize } from "@/lib/rsvp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Envio malformado." }, { status: 400 });
  }

  const parsed = parseRsvp(body);
  if (!parsed.ok) {
    return NextResponse.json({ errors: parsed.errors }, { status: 422 });
  }

  try {
    const { entry, replaced } = await saveRsvp(parsed.value);
    const list = await readRsvps();
    return NextResponse.json(
      {
        entry,
        replaced,
        position: list.findIndex((r) => r.id === entry.id) + 1,
        summary: summarize(list),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("Falha ao gravar RSVP:", err);
    return NextResponse.json({ error: "Não conseguimos gravar sua confirmação. Tente de novo." }, { status: 500 });
  }
}

export async function GET() {
  const list = await readRsvps();
  return NextResponse.json({ summary: summarize(list), total: list.length });
}
