"use client";

import { useEffect, useState } from "react";
import { party } from "@/config/party";
import { SoundToggle } from "@/components/fx/SoundToggle";

const links = [
  { href: "/#noite", label: "A casa" },
  { href: "/#atos", label: "A noite" },
  { href: "/#local", label: "Endereço" },
  { href: "/cardapio", label: "Cardápio" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled ? "border-b border-night-line bg-night/80 backdrop-blur-md" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-6 px-5 py-5 sm:px-10">
        <a href="/#topo" className="meta text-ivory" aria-label={`${party.name} — início`}>
          The Rocky Horror <span className="text-lipstick-glow">Party</span>
        </a>

        <nav className="flex items-center gap-8" aria-label="Seções do site">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="meta hidden text-ivory-dim transition-colors hover:text-ivory lg:inline">
              {l.label}
            </a>
          ))}
          <SoundToggle />
        </nav>
      </div>
    </header>
  );
}
