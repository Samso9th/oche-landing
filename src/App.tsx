import { Closing, Footer } from "./sections/closing.tsx";
import { Deploys } from "./sections/deploys.tsx";
import { Guard } from "./sections/guard.tsx";
import { Hero } from "./sections/hero.tsx";
import { Modes } from "./sections/modes.tsx";
import { Nav } from "./sections/nav.tsx";
import { Road } from "./sections/road.tsx";
import { CliSoon, Ship } from "./sections/ship.tsx";
import { Team } from "./sections/team.tsx";

export function App() {
  return (
    <>
      <div className="grain" aria-hidden />
      <Nav />
      <main>
        <Hero />
        <Road />
        <div className="hairline mx-auto max-w-6xl" />
        <Guard />
        <Ship />
        <Deploys />
        <Modes />
        <Team />
        <CliSoon />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
