import type { Metadata } from "next";
import Link from "next/link";
import { menu, party } from "@/config/party";
import { MenuBoard } from "@/components/sections/MenuBoard";

export const metadata: Metadata = {
  title: `Cardápio — ${party.name}`,
  description: "As bebidas da noite.",
};

export default function CardapioPage() {
  const categories = menu.filter((c) => c.items.length > 0);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-5 pt-32 pb-32">
      <p className="eyebrow text-lipstick-glow">{party.name}</p>
      <h1 className="poster-title mt-6 text-5xl sm:text-7xl">Cardápio</h1>
      <p className="mt-6 max-w-md text-ivory-dim">
        {party.venue} · {party.dateShort}. Confira o que será servido durante a noite.
      </p>

      {categories.length === 0 ? (
        <p className="meta mt-16 text-center text-ivory-dim">O cardápio será revelado em breve.</p>
      ) : (
        <MenuBoard categories={categories} />
      )}

      <div className="mt-16">
        <Link href="/" className="btn btn-line">
          Voltar
        </Link>
      </div>
    </div>
  );
}
