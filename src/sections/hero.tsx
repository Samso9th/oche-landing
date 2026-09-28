import { ArrowDown, ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { HeroCanvas } from "../components/hero-canvas.tsx";
import { Branch } from "../components/ui.tsx";
import { APP_URL } from "../links.ts";

const LINES = [["Every", "change", "takes"], ["the", "same", "road"], ["to", "production."]];

export function Hero() {
  let n = 0;
  return (
    <section id="top" className="relative isolate flex min-h-[640px] flex-col overflow-hidden h-[100svh] max-h-[1100px]">
      <HeroCanvas className="absolute inset-0 -z-10" />
      {/* Keep the headline readable over the scene, and melt the scene into the page below. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_18%_62%,rgb(12_11_10/0.82),transparent_70%)] max-md:bg-[linear-gradient(0deg,rgb(12_11_10/0.95)_25%,transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-bg" />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-5 pb-20 sm:px-8 md:justify-center md:pb-0">
        <p className="hero-in eyebrow flex items-center gap-2" style={{ "--d": "0ms" } as CSSProperties}>
          <span className="pulse relative size-1.5 rounded-full bg-prod text-prod" />
          GitHub + Coolify · works on the Free plan
        </p>

        <h1 className="display mt-5 text-[clamp(44px,6.6vw,88px)]">
          {LINES.map((line, li) => (
            <span key={li} className="block">
              {line.map((w) => (
                <span key={w} className="hero-word sheen inline-block pr-[0.22em] pb-[0.06em]" style={{ "--d": `${120 + n++ * 55}ms` } as CSSProperties}>
                  {w}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p className="hero-in lede mt-7 max-w-[34rem] text-[17px] leading-relaxed text-ink-2 sm:text-[18px]" style={{ "--d": "650ms" } as CSSProperties}>
          Oche guards dev, staging and main on GitHub. It promotes with one click, and watches each Coolify deploy along the way.
        </p>

        <div className="hero-in mt-9 flex flex-wrap items-center gap-3" style={{ "--d": "750ms" } as CSSProperties}>
          <a
            href={APP_URL}
            className="pressable group inline-flex h-12 items-center gap-2 rounded-xl bg-ember px-5 text-[15px] font-medium text-ember-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_0_0_1px_rgb(255_106_66/0.5),0_10px_32px_-8px_rgb(255_106_66/0.65)] hover:brightness-[1.08]"
          >
            Open Oche
            <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
          </a>
          <a
            href="#road"
            className="pressable inline-flex h-12 items-center gap-2 rounded-xl bg-surface-2/60 px-5 text-[15px] font-medium text-ink shadow-[inset_0_1px_0_rgb(255_245_235/0.06),0_0_0_1px_var(--line-strong)] backdrop-blur hover:bg-surface-3/80"
          >
            See how it works
          </a>
        </div>

        <div className="hero-in mt-10 flex flex-wrap items-center gap-1.5 text-[12.5px] text-muted" style={{ "--d": "850ms" } as CSSProperties}>
          <Branch name="feature/*" />
          <span>→</span>
          <Branch name="dev" stage="dev" />
          <span>→</span>
          <Branch name="staging" stage="staging" />
          <span>→</span>
          <Branch name="main" stage="prod" />
        </div>
      </div>

      <a
        href="#road"
        aria-label="Scroll to how it works"
        className="hero-in absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-faint transition-colors hover:text-ink md:block"
        style={{ "--d": "1200ms" } as CSSProperties}
      >
        <ArrowDown className="size-4 animate-bounce [animation-duration:2s]" />
      </a>
    </section>
  );
}
