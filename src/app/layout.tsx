import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";
import { party } from "@/config/party";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Intro } from "@/components/fx/Intro";
import { Cursor } from "@/components/fx/Cursor";
import { Presence } from "@/components/fx/Presence";
import { JumpScare } from "@/components/fx/JumpScare";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: party.name,
  description: `${party.tagline} ${party.dateLabel}, ${party.timeLabel}, ${party.city}.`,
  openGraph: {
    title: party.name,
    description: `${party.dateShort} · ${party.timeLabel} · ${party.tagline}`,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${plexMono.variable} ${inter.variable}`}>
      <body className="relative">
        <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
          <div className="grain" />
          <div className="vhs-band absolute inset-x-0 top-0" />
        </div>
        <Intro />
        <Cursor />
        <Presence />
        <JumpScare />

        <a href="#conteudo" className="btn btn-red sr-only focus:not-sr-only focus:fixed focus:top-20 focus:left-4 focus:z-70">
          Pular para o conteúdo
        </a>

        <SiteHeader />
        <main id="conteudo">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
