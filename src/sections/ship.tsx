import clsx from "clsx";
import { AlertTriangle, Check, GitPullRequest, Loader2, PauseCircle, Rocket, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal, SectionHead, prefersReducedMotion, useInView } from "../components/ui.tsx";

/*
 * A real `oche ship`, line for line in the CLI's own format (cli/src/ship.ts
 * and ship-run.ts), played back when the terminal scrolls into view.
 */

const dim = (s: ReactNode) => <span className="text-faint">{s}</span>;
const ok = <span className="text-prod">✓</span>;
const bold = (s: ReactNode) => <span className="font-semibold text-ink">{s}</span>;

type Line = { at: number; node?: ReactNode; type?: string; typed?: string };

const MESSAGE = "feat(wallet): cap daily transfers per account tier";

const SCRIPT: Line[] = [
  { at: 0, node: <span className="text-muted">~/acme/storefront <span className="text-dev">feature/wallet-limits</span></span> },
  { at: 200, typed: "oche ship", node: <span className="text-ember">$ </span> },
  { at: 1100, node: dim("Writing a commit message…") },
  { at: 2000, node: " " },
  { at: 2000, typed: MESSAGE, type: "message" },
  { at: 3300, node: " " },
  { at: 3400, node: <>{bold("Ship feature/wallet-limits to production")}  {dim("acme/storefront · fast")}</> },
  { at: 3400, node: " " },
  { at: 3550, node: "  1. Commit 4 files" },
  { at: 3650, node: <>  2. Push feature/wallet-limits{dim("  (new on GitHub)")}</> },
  { at: 3750, node: <>  3. feature/wallet-limits → develop{dim("  open a PR and merge")}</> },
  { at: 3850, node: "  4. develop → staging" },
  { at: 3950, node: "  5. wait for staging to deploy healthy on Coolify" },
  { at: 4050, node: "  6. staging → main" },
  { at: 4150, node: "  7. wait for production to deploy healthy" },
  { at: 4150, node: " " },
  { at: 4400, node: <>Ship it? {dim("[Y/n · e edit · r rewrite]")}</>, typed: " y", type: "answer" },
  { at: 5300, node: " " },
  { at: 5300, node: dim("Ship #48 is running on the server.") },
  { at: 6100, node: <>{ok} feature/wallet-limits → develop  {dim("#212")}</> },
  { at: 7000, node: <>{ok} develop → staging  {dim("#213")}</> },
  { at: 7600, node: dim("… Staging deploys and is healthy  building (48s)") },
  { at: 9000, node: <>{ok} Staging deploys and is healthy</> },
  { at: 9700, node: <>{ok} staging → main  {dim("#214")}</> },
  { at: 10300, node: dim("… Production deploys and is healthy  building (31s)") },
  { at: 11600, node: <>{ok} Production deploys and is healthy</> },
  { at: 12100, node: <>{ok} {bold("Shipped to production")}</> },
];
function Typed({ text, speed = 18 }: { text: string; speed?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= text.length) return;
    const t = window.setTimeout(() => setN((x) => x + 1), speed + Math.random() * speed);
    return () => clearTimeout(t);
  }, [n, text, speed]);
  return <>{text.slice(0, n)}</>;
}

function Terminal() {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -25% 0px" });
  const reduced = useRef(prefersReducedMotion());
  const [shown, setShown] = useState(reduced.current ? SCRIPT.length : 0);
  const [run, setRun] = useState(0);
  const done = shown >= SCRIPT.length;

  useEffect(() => {
    if (!inView || reduced.current) return;
    setShown(0);
    const timers = SCRIPT.map((l, i) => window.setTimeout(() => setShown(i + 1), l.at));
    return () => timers.forEach(clearTimeout);
  }, [inView, run]);

  return (
    <div ref={ref} className="relative">
      <div className="absolute -inset-16 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(255_106_66/0.10),transparent)] blur-2xl" />
      <div className="card overflow-hidden rounded-2xl bg-[#0e0d0c]">
        <div className="flex h-10 items-center gap-2 border-b border-line px-4">
          <span className="size-3 rounded-full bg-[#ff5f57]/85" />
          <span className="size-3 rounded-full bg-[#febc2e]/85" />
          <span className="size-3 rounded-full bg-[#28c840]/85" />
          <span className="ml-3 font-mono text-[11.5px] text-faint">zsh · storefront</span>
          <span className="ml-2 rounded-full bg-ember-soft px-2 py-0.5 text-[10.5px] font-medium text-ember">preview</span>
          {done && !reduced.current && (
            <button
              onClick={() => setRun((r) => r + 1)}
              className="pressable ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[11px] text-muted hover:bg-surface-2 hover:text-ink"
            >
              <RotateCcw className="size-3" /> replay
            </button>
          )}
        </div>
        <pre className="h-[640px] overflow-hidden p-4 font-mono text-[11.5px] leading-[1.7] whitespace-pre-wrap text-ink-2 sm:h-[560px] sm:p-5 sm:text-[13px] sm:leading-[1.75]">
          {SCRIPT.slice(0, shown).map((l, i) => {
            const last = i === shown - 1;
            if (l.type === "message")
              return (
                <div key={`${run}-${i}`} className="pl-4 font-semibold text-ink">
                  <Typed text={l.typed!} />
                  <span className="ml-2 rounded bg-ember-soft px-1.5 py-px align-middle font-sans text-[10.5px] font-medium text-ember">
                    <Sparkles className="mr-1 inline size-2.5" />
                    written by AI
                  </span>
                </div>
              );
            return (
              <div key={`${run}-${i}`} className="line-in">
                {l.node}
                {l.typed && (
                  <span className="text-ink">
                    <Typed text={l.typed} speed={l.type === "answer" ? 60 : 45} />
                  </span>
                )}
                {last && !done && !l.typed && <span className="caret ml-0.5" />}
              </div>
            );
          })}
          {done && (
            <div>
              <span className="text-ember">$ </span>
              <span className="caret" />
            </div>
          )}
        </pre>
      </div>
    </div>
  );
}

/* ---------------- the dashboard's Ship dialog, played back ---------------- */

type StepState = "pending" | "running" | "done";
const PLAN = [
  { plan: "develop → staging", run: "develop → staging", pr: 213 },
  { plan: "Wait for staging to deploy and pass its health check", run: "Staging deploys and is healthy", wait: "building (48s)" },
  { plan: "staging → main", run: "staging → main", pr: 214 },
  { plan: "Wait for production to deploy and pass its health check", run: "Production deploys and is healthy", wait: "building (31s)" },
];
// [ms, step states] — the plan, the press, then each step in turn.
const FRAMES: [number, StepState[] | "plan" | "press"][] = [
  [0, "plan"],
  [1900, "press"],
  [2300, ["running", "pending", "pending", "pending"]],
  [3000, ["done", "running", "pending", "pending"]],
  [4900, ["done", "done", "running", "pending"]],
  [5500, ["done", "done", "done", "running"]],
  [7200, ["done", "done", "done", "done"]],
];
const LOOP = 10500;

function ShipDialog() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const reduced = prefersReducedMotion();
  const [frame, setFrame] = useState(reduced ? FRAMES.length - 1 : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    let timers: number[] = [];
    const run = () => {
      timers = FRAMES.map((f, i) => window.setTimeout(() => setFrame(i), f[0]));
      timers.push(window.setTimeout(run, LOOP));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [inView, reduced]);

  const f = FRAMES[frame]![1];
  const planning = f === "plan" || f === "press";
  const states: StepState[] = planning ? ["pending", "pending", "pending", "pending"] : f;
  const finished = states.every((s) => s === "done");

  return (
    <div ref={ref} className="relative">
      <div className="absolute -inset-16 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(255_106_66/0.10),transparent)] blur-2xl" />
      <div className="card rounded-2xl p-5 sm:p-6">
        <p key={planning ? "a" : finished ? "c" : "b"} className="swap text-[16px] font-semibold tracking-[-0.01em] text-ink">
          {planning ? "Ship develop to production?" : finished ? "Shipped storefront to production" : "Shipping develop to production"}
        </p>
        <p className="mt-1 text-[13.5px] text-muted">Production only moves once staging is deployed and healthy.</p>

        <div className={clsx("grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)]", planning ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
          <div className="overflow-hidden">
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-staging/12 px-3 py-2 text-[13px] text-ink-2">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-staging" />
              storefront-api in production is missing SENTRY_DSN.
            </p>
          </div>
        </div>

        <ol className="mt-4 space-y-1">
          {PLAN.map((s, i) => {
            const st = states[i]!;
            return (
              <li key={i} className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] odd:bg-surface-2/50">
                <span className="grid size-5 shrink-0 place-items-center">
                  {st === "done" ? (
                    <Check className="swap size-3.5 text-prod" strokeWidth={3} />
                  ) : st === "running" ? (
                    <Loader2 className="spin size-3.5 text-staging" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-faint" />
                  )}
                </span>
                <span className={clsx("min-w-0 flex-1 truncate", st === "pending" && !planning ? "text-muted" : "text-ink-2")}>{planning ? s.plan : s.run}</span>
                {st === "running" && s.wait && <span className="swap font-mono text-[11.5px] text-muted">{s.wait}</span>}
                {st === "done" && s.pr && <span className="swap font-mono text-[11.5px] text-muted">#{s.pr}</span>}
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex items-center justify-end gap-2">
          {planning ? (
            <>
              <span className="rounded-lg px-3 py-1.5 text-[13px] text-muted">Cancel</span>
              <span
                className={clsx(
                  "inline-flex items-center gap-1.5 rounded-lg bg-ember px-3 py-1.5 text-[13px] font-medium text-ember-ink transition-transform duration-150",
                  f === "press" && "scale-[0.97] brightness-110",
                )}
              >
                <Rocket className="size-3.5" /> Ship anyway
              </span>
            </>
          ) : finished ? (
            <span className="swap inline-flex items-center gap-1.5 rounded-lg bg-prod/15 px-3 py-1.5 text-[13px] font-medium text-prod">
              <Check className="size-3.5" strokeWidth={3} /> Deployed and healthy
            </span>
          ) : (
            <span className="rounded-lg px-3 py-1.5 text-[13px] text-muted">Runs on the server. Close this any time.</span>
          )}
        </div>
      </div>
    </div>
  );
}

const POINTS = [
  { icon: GitPullRequest, text: "Ship a whole repo, or any open PR into dev: Oche merges it first, then carries on." },
  { icon: AlertTriangle, text: "Before you confirm, it warns about env vars missing in production and a staging that isn't healthy." },
  { icon: PauseCircle, text: "Stops and says why when a PR needs review. Ship again and finished steps are skipped." },
];

export function Ship() {
  return (
    <section id="ship" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <SectionHead eyebrow="Ship" title="One confirmation from dev to production.">
            Press Ship and Oche takes it through staging and main, waiting on Coolify between steps. The run lives on the server, so closing the tab doesn't stop it.
          </SectionHead>
          <ul className="mt-10 space-y-4">
            {POINTS.map((p, i) => (
              <Reveal as="li" key={i} i={i + 3} className="flex gap-3 text-[14.5px] leading-relaxed text-muted">
                <p.icon className="mt-0.5 size-4.5 shrink-0 text-ink-2" />
                {p.text}
              </Reveal>
            ))}
          </ul>
        </div>
        <Reveal i={1}>
          <ShipDialog />
        </Reveal>
      </div>
    </section>
  );
}

/** The CLI isn't published yet: shown as a preview. */
export function CliSoon() {
  return (
    <section id="cli" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <Reveal i={1} className="order-2 lg:order-1">
          <Terminal />
        </Reveal>
        <div className="order-1 lg:order-2">
          <Reveal as="p" className="eyebrow flex items-center gap-2">
            oche CLI <span className="rounded-full bg-ember-soft px-2 py-0.5 font-sans text-[11px] font-medium text-ember">Coming soon</span>
          </Reveal>
          <Reveal as="h2" i={1} className="headline sheen mt-4 text-[clamp(34px,5vw,56px)]">
            The same ship, from your terminal.
          </Reveal>
          <Reveal as="p" i={2} className="lede mt-5 text-[17px] leading-relaxed text-ink-2">
            <code className="font-mono text-[15px] text-ink">oche ship</code> will commit what changed with an AI-written message, push, and take it to production after
            one confirmation. It isn't published yet.
          </Reveal>
        </div>
      </div>
    </section>
  );
}
