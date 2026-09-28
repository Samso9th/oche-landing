import { GitBranch, MonitorSmartphone, PauseCircle, RotateCcw, Sparkles } from "lucide-react";
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

const POINTS = [
  { icon: MonitorSmartphone, text: "Same run from the Ship button in the dashboard, with the plan shown before you confirm." },
  { icon: PauseCircle, text: "Stops and tells you when a PR is waiting for review. Run it again and finished steps are skipped." },
  { icon: GitBranch, text: "Starts from the branch you're on and commits everything that changed, after listing the files." },
];

export function Ship() {
  return (
    <section id="ship" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <SectionHead eyebrow="oche ship" title="One command from your branch to production.">
            It commits what changed with an AI-written message, pushes, and takes it through dev, staging and main. You confirm once. The run lives on the server, so closing
            your laptop doesn't stop it.
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
          <Terminal />
        </Reveal>
      </div>
    </section>
  );
}
