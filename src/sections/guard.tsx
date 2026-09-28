import clsx from "clsx";
import { Check, GitMerge, GitPullRequest, History, Loader2, LockOpen, ShieldAlert, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Mark } from "../components/logo.tsx";
import { Card, Reveal, SectionHead, prefersReducedMotion, useInView } from "../components/ui.tsx";

/*
 * A PR aimed at main from a feature branch. The card plays what Oche does to
 * it: the check runs, fails, the base moves to dev, the bot says why, and the
 * check goes green. It loops while it's on screen.
 */
type Phase = 0 | 1 | 2 | 3 | 4;
const TIMELINE: [Phase, number][] = [
  [0, 0],
  [1, 1100],
  [2, 2500],
  [3, 3600],
  [4, 4700],
];
const LOOP_MS = 8200;

function usePhase(active: boolean): Phase {
  const [phase, setPhase] = useState<Phase>(prefersReducedMotion() ? 4 : 0);
  useEffect(() => {
    if (!active || prefersReducedMotion()) return;
    let timers: number[] = [];
    const run = () => {
      timers = TIMELINE.map(([p, at]) => window.setTimeout(() => setPhase(p), at));
      timers.push(window.setTimeout(run, LOOP_MS));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [active]);
  return phase;
}

/** Text that swaps with a quick blur, so the change reads as one thing morphing. */
function Swap({ k, children, className }: { k: string; children: ReactNode; className?: string }) {
  return (
    <span key={k} className={clsx("swap inline-flex items-center", className)}>
      {children}
    </span>
  );
}

function PullRequestCard() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const phase = usePhase(inView);
  const moved = phase >= 2;

  return (
    <div ref={ref} className="relative">
      {/* The glow behind the card shifts from red to green with the check. */}
      <div
        className="absolute -inset-10 -z-10 rounded-[48px] blur-3xl transition-[background-color] duration-1000"
        style={{ backgroundColor: phase === 1 || phase === 2 ? "rgb(248 113 113 / 0.10)" : phase >= 3 ? "rgb(61 220 132 / 0.08)" : "rgb(255 106 66 / 0.06)" }}
      />
      <Card className="p-0">
        <div className="flex items-start gap-3 border-b border-line p-5">
          <GitPullRequest className="mt-1 size-4.5 shrink-0 text-prod" />
          <div className="min-w-0">
            <p className="text-[16px] font-medium text-ink">
              Cap daily transfers per tier <span className="font-normal text-muted">#212</span>
            </p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
              <span className="font-medium text-ink-2">amaka</span> wants to merge into
              <span className="relative inline-flex overflow-hidden rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[12.5px] shadow-[0_0_0_1px_var(--line)]">
                <Swap k={moved ? "dev" : "main"} className={moved ? "text-dev" : "text-ink-2"}>
                  {moved ? "develop" : "main"}
                </Swap>
              </span>
              from
              <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[12.5px] text-ink-2 shadow-[0_0_0_1px_var(--line)]">feature/wallet-limits</span>
            </p>
          </div>
        </div>

        {/* bot comment */}
        <div className={clsx("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out)]", phase >= 2 ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className={clsx("flex gap-3 border-b border-line p-5 transition-[opacity,filter,translate] duration-500", phase >= 2 ? "opacity-100 blur-none" : "translate-y-1 opacity-0 blur-sm")}>
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-2 text-ink shadow-[0_0_0_1px_var(--line)]">
                <Mark size={15} />
              </span>
              <div className="min-w-0 text-[13.5px]">
                <p className="text-muted">
                  <span className="font-medium text-ink">oche</span> <span className="rounded bg-surface-2 px-1 text-[11px]">bot</span> changed the base branch from{" "}
                  <span className="font-mono text-ink-2">main</span> to <span className="font-mono text-dev">develop</span>
                </p>
                <p className="mt-2 leading-relaxed text-ink-2">
                  Only staging or develop can merge into main. I've pointed this PR at <code className="font-mono text-[12.5px] text-ink">develop</code> instead. Once it's merged
                  there, it reaches <code className="font-mono text-[12.5px] text-ink">main</code> through a promotion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* checks */}
        <div className="p-5">
          <div className="flex items-center gap-3 rounded-xl bg-surface-2/70 p-3 shadow-[0_0_0_1px_var(--line)]">
            <span className="grid size-6 shrink-0 place-items-center">
              {phase === 0 || phase === 3 ? (
                <Loader2 className="spin size-4 text-staging" />
              ) : phase >= 4 ? (
                <span className="swap grid size-5 place-items-center rounded-full bg-prod text-bg">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              ) : (
                <span className="swap grid size-5 place-items-center rounded-full bg-danger text-bg">
                  <X className="size-3.5" strokeWidth={3} />
                </span>
              )}
            </span>
            <div className="min-w-0 flex-1 text-[13px]">
              <p className="font-medium text-ink">Oche flow</p>
              <p className="truncate text-muted">
                {phase === 0 && <Swap k="0">Checking the route…</Swap>}
                {(phase === 1 || phase === 2) && (
                  <Swap k="1" className="text-danger">
                    Not allowed by the branch flow
                  </Swap>
                )}
                {phase === 3 && <Swap k="3">Checking the route…</Swap>}
                {phase >= 4 && <Swap k="4">feature → develop, no review needed in fast mode</Swap>}
              </p>
            </div>
            <span
              className={clsx(
                "hidden items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors duration-300 sm:inline-flex",
                phase >= 4 ? "bg-prod/15 text-prod" : "bg-surface-3 text-faint",
              )}
            >
              <GitMerge className="size-3.5" /> Merge
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

const FACTS = [
  {
    icon: History,
    title: "Deleted branches come back",
    body: "Delete staging by accident and Oche puts it back.",
  },
  {
    icon: ShieldAlert,
    title: "Direct pushes get flagged",
    body: "A push straight to main shows up in the activity log, with who pushed it.",
  },
  {
    icon: LockOpen,
    title: "No branch protection needed",
    body: "The rules run from a GitHub App, so private repos on the Free plan get them too.",
  },
];

export function Guard() {
  return (
    <section id="guard" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <SectionHead eyebrow="Guard" title="Anything else gets sent back to dev.">
          A PR from a feature branch aimed at staging or main fails the Oche flow check, and Oche moves it to dev or
          closes it. Nobody has to remember the rules.
        </SectionHead>
        <Reveal i={2}>
          <PullRequestCard />
        </Reveal>
      </div>

      <div className="mt-20 grid gap-3 sm:grid-cols-3">
        {FACTS.map((f, i) => (
          <Reveal key={f.title} i={i}>
            <Card className="h-full p-5">
              <f.icon className="size-4.5 text-ember" />
              <h3 className="mt-4 text-[15px] font-medium text-ink">{f.title}</h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{f.body}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
