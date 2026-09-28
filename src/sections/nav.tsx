import clsx from "clsx";
import { useEffect, useState } from "react";
import { APP_URL } from "../links.ts";
import { Wordmark } from "../components/logo.tsx";
import { ButtonLink } from "../components/ui.tsx";

const LINKS = [
  { href: "#road", label: "How it works" },
  { href: "#guard", label: "Guard" },
  { href: "#ship", label: "Ship" },
  { href: "#deploys", label: "Deploys" },
  { href: "#team", label: "Teams" },
  { href: "#cli", label: "CLI" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        className={clsx(
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-2xl px-3 pl-4 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          scrolled ? "bg-bg/70 shadow-[inset_0_1px_0_rgb(255_245_235/0.05),0_0_0_1px_var(--line)] backdrop-blur-xl backdrop-saturate-150" : "bg-transparent",
        )}
      >
        <a href="#top" aria-label="Oche home" className="text-ink">
          <Wordmark height={21} />
        </a>
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="rounded-lg px-3 py-1.5 text-[13.5px] text-muted transition-colors duration-150 hover:text-ink">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1.5">
          <ButtonLink href={APP_URL} variant="ghost" size="sm" className="hidden sm:inline-flex">
            Sign in
          </ButtonLink>
          <ButtonLink href="#waitlist" size="sm">
            Join waitlist
          </ButtonLink>
        </div>
      </nav>
    </header>
  );
}
