import { Hero } from "@/components/sections/Hero";
import { DoorScene } from "@/components/sections/DoorScene";
import { Manifesto } from "@/components/sections/Manifesto";
import { Lineup } from "@/components/sections/Lineup";
import { EventDetails } from "@/components/sections/EventDetails";
import { Marquee } from "@/components/fx/Marquee";
import { ScrollClock } from "@/components/fx/ScrollClock";

export default function Home() {
  return (
    <>
      <ScrollClock />
      <Hero />
      <DoorScene />
      <Manifesto />
      <Marquee text="Não há saída" />
      <Lineup />
      <EventDetails />
      <Marquee text="Até o amanhecer" reverse />
    </>
  );
}
