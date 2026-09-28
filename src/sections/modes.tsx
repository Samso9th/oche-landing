import clsx from "clsx";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Branch, Card, Reveal, SectionHead } from "../components/ui.tsx";

type Mode = "fast" | "strict";

const ROWS: { from: ReactNode; to: ReactNode; fast: string; strict: string }[] = [
  { from: <span className="font-mono text-[12.5px] text-muted">any branch</span>, to: <Branch name="dev" stage="dev" />, fast: "no review", strict: "1 approval" },
  { from: <Branch name="dev" stage="dev" />, to: <Branch name="staging" stage="staging" />, fast: "one click", strict: "1 approval" },
  { from: <Branch name="staging" stage="staging" />, to: <Branch name="main" stage="prod" />, fast: "one click", strict: "1 approval" },
  { from: <Branch name="dev" stage="dev" />, to: <Branch name="main" stage="prod" />, fast: "staging synced after", strict: "1 approval, staging synced after" },
];

/**
 * Segmented control. The active pill is a clipped copy of the labels, so the
 * colour change travels with the pill instead of fading on each label.
 */
function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  const list = useRef<HTMLDivElement>(null);
  const [clip, setClip] = useState("inset(0 50% 0 0 round 10px)");
  useLayoutEffect(() => {
    const el = list.current;
    const btn = el?.querySelector<HTMLElement>(`[data-mode="${mode}"]`);
    if (!el || !btn) return;
    const left = btn.offsetLeft;
    const right = el.offsetWidth - (left + btn.offsetWidth);
    setClip(`inset(0 ${right}px 0 ${left}px round 10px)`);
  }, [mode]);

  const labels = (active: boolean) =>
    (["fast", "strict"] as const).map((m) => (
      <button
        key={m}
        data-mode={m}
        tabIndex={active ? -1 : 0}
        aria-hidden={active || undefined}
        aria-pressed={!active ? mode === m : undefined}
        onClick={() => onChange(m)}
        className={clsx("h-9 rounded-[10px] px-5 text-[14px] font-medium capitalize", active ? "text-ember-ink" : "text-muted hover:text-ink-2")}
      >
        {m}
      </button>
    ));

  return (
    <div className="relative inline-flex rounded-xl bg-surface-2 p-1 shadow-[0_0_0_1px_var(--line)]">
      <div ref={list} className="relative flex">
        {labels(false)}
        <div
          className="pointer-events-none absolute inset-0 flex bg-ember transition-[clip-path] duration-300 ease-[var(--ease-out)]"
          style={{ clipPath: clip, borderRadius: 10 }}
        >
          {labels(true)}
        </div>
      </div>
    </div>
  );
}

export function Modes() {
  const [mode, setMode] = useState<Mode>("fast");
  return (
    <section id="modes" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <SectionHead eyebrow="Modes" title="Fast for side projects. Strict for the ones with customers.">
          Pick per repo. Fast mode promotes on one click. Strict mode wants approvals at every step, including dev straight to main, and you choose how many.
        </SectionHead>

        <Reveal i={2}>
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] font-medium text-ink">
                How <span className="font-mono">storefront</span> is guarded
              </p>
              <ModeSwitch mode={mode} onChange={setMode} />
            </div>
            <ul className="mt-6 space-y-1">
              {ROWS.map((r, i) => (
                <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2 py-2.5 text-[13px] odd:bg-surface-2/40">
                  {r.from}
                  <span className="text-faint">→</span>
                  {r.to}
                  <span key={mode} className={clsx("swap ml-auto", mode === "strict" ? "text-staging" : "text-muted")}>
                    {r[mode]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-line pt-4 text-[13px] leading-relaxed text-muted">
              Anything else aimed at staging or main is moved to dev or closed. Deleted branches come back, and pushes straight to main show up in the activity log.
            </p>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}
