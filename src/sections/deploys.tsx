import clsx from "clsx";
import { Bell, Check, ClipboardCopy, Cloud, Loader2, Lock, Server, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Card, Reveal, SectionHead, prefersReducedMotion, useInView, type Stage } from "../components/ui.tsx";

function CardHead({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-5 pb-0 sm:p-6 sm:pb-0">
      <h3 className="text-[15.5px] font-medium text-ink">{title}</h3>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{children}</p>
    </div>
  );
}

/* ---------------- failed build, explained ---------------- */

const LOG: { t: string; bad?: boolean }[] = [
  { t: "#9 [build 3/8] COPY package.json package-lock.json ./" },
  { t: "#10 [build 4/8] RUN npm ci" },
  { t: "#10 21.37 added 812 packages in 21s" },
  { t: "#11 [build 5/8] COPY . ." },
  { t: "#12 [build 6/8] RUN npm run build" },
  { t: "#12 0.912 > storefront@1.4.0 build" },
  { t: "#12 0.913 > next build" },
  { t: "#12 14.20 Creating an optimized production build ..." },
  { t: "#12 61.84 <--- Last few GCs --->" },
  { t: "#12 61.85 FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory", bad: true },
  { t: '#12 ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 134', bad: true },
];
const EXPLANATION =
  "The build ran out of memory while Next.js was compiling (exit code 134 is Node hitting its heap limit). Add NODE_OPTIONS=--max-old-space-size=4096 to the app's build variables, or build on a server with more RAM.";

function FailedBuild() {
  const [ref, inView] = useInView<HTMLDivElement>({ margin: "0px 0px -30% 0px" });
  const reduced = prefersReducedMotion();
  const [pressed, setPressed] = useState(reduced);
  const [chars, setChars] = useState(reduced ? EXPLANATION.length : 0);

  useEffect(() => {
    if (!inView || reduced) return;
    const t = window.setTimeout(() => setPressed(true), 1300);
    return () => clearTimeout(t);
  }, [inView, reduced]);

  useEffect(() => {
    if (!pressed || chars >= EXPLANATION.length) return;
    const t = window.setTimeout(() => setChars((c) => Math.min(EXPLANATION.length, c + 3)), chars === 0 ? 900 : 16);
    return () => clearTimeout(t);
  }, [pressed, chars]);

  return (
    <div ref={ref} className="flex h-full flex-col">
      <CardHead title="When a build fails, you see why">
        The failing lines are pulled out of the log. Copy a report for an issue, or have AI explain what went wrong.
      </CardHead>
      <div className="m-3 mt-5 flex flex-1 flex-col overflow-hidden rounded-xl bg-[#0e0d0c] shadow-[0_0_0_1px_var(--line)] sm:m-4 sm:mt-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-2 rounded-full bg-danger" />
          <span className="text-[13px] font-medium text-ink">storefront-api</span>
          <span className="text-[12.5px] text-muted">production · failed 2m ago</span>
          <span className="ml-auto flex gap-1.5">
            <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-surface-2 px-2.5 text-[12px] text-ink-2 shadow-[0_0_0_1px_var(--line)]">
              <ClipboardCopy className="size-3.5" /> Copy report
            </span>
            <span
              className={clsx(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-[transform,background-color,color] duration-150",
                pressed ? "scale-[0.97] bg-ember text-ember-ink" : "bg-ember-soft text-ember",
              )}
            >
              <Sparkles className="size-3.5" /> Explain
            </span>
          </span>
        </div>
        <div className="flex flex-1 flex-col justify-end overflow-x-auto px-4 py-3 font-mono text-[11.5px] leading-[1.8]">
          {LOG.map((l, i) => (
            <div key={i} className={clsx("-mx-2 rounded px-2 whitespace-nowrap", l.bad ? "bg-danger/10 text-danger" : "text-faint")}>
              {l.t}
            </div>
          ))}
        </div>
        <div className={clsx("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out)]", pressed ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="m-3 mt-0 rounded-lg bg-ember-soft/60 p-3.5 text-[13.5px] leading-relaxed text-ink-2 shadow-[inset_0_0_0_1px_rgb(255_106_66/0.2)]">
              <p className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ember">
                {chars < EXPLANATION.length ? <Loader2 className="spin size-3" /> : <Sparkles className="size-3" />}
                {chars === 0 ? "Reading the log…" : "What went wrong"}
              </p>
              {EXPLANATION.slice(0, chars)}
              {chars === 0 && <span className="text-faint">…</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- health gate ---------------- */

type Status = "waiting" | "building" | "healthy";

function StageRow({ stage, name, status, host }: { stage: Stage; name: string; status: Status; host: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-surface-2/70 px-3.5 py-3 shadow-[0_0_0_1px_var(--line)]">
      <span className="relative grid size-7 shrink-0 place-items-center rounded-full" style={{ background: `color-mix(in oklab, var(--${stage}) 16%, transparent)` }}>
        {status === "waiting" && <Lock className="size-3.5 text-muted" />}
        {status === "building" && <Loader2 className="spin size-3.5" style={{ color: `var(--${stage})` }} />}
        {status === "healthy" && <Check key="ok" className="swap size-3.5" strokeWidth={3} style={{ color: `var(--${stage})` }} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-medium text-ink">{name}</p>
        <p className="truncate font-mono text-[11.5px] text-faint">{host}</p>
      </div>
      <span key={status} className={clsx("swap text-[12px]", status === "healthy" ? "text-prod" : status === "building" ? "text-ink-2" : "text-muted")}>
        {status === "waiting" ? "waits for staging" : status === "building" ? "deploying" : "healthy"}
      </span>
    </div>
  );
}

function HealthGate() {
  const [ref, inView] = useInView<HTMLDivElement>({ once: false, margin: "0px" });
  const [phase, setPhase] = useState(prefersReducedMotion() ? 2 : 0);
  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;
    let timers: number[] = [];
    const run = () => {
      setPhase(0);
      timers = [window.setTimeout(() => setPhase(1), 2200), window.setTimeout(() => setPhase(2), 4200), window.setTimeout(run, 7200)];
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [inView]);

  return (
    <div ref={ref} className="flex h-full flex-col">
      <CardHead title="Production waits for a healthy staging">If staging fails to deploy or its health check fails, the ship stops before main.</CardHead>
      <div className="mt-auto space-y-2 p-4 pt-6 sm:p-5 sm:pt-6">
        <StageRow stage="staging" name="Staging" host="sandbox.acme.com" status={phase === 0 ? "building" : "healthy"} />
        <div className="ml-[26px] h-3 w-px bg-line-strong" />
        <StageRow stage="prod" name="Production" host="api.acme.com" status={phase === 0 ? "waiting" : phase === 1 ? "building" : "healthy"} />
      </div>
    </div>
  );
}

/* ---------------- rollback ---------------- */

const IMAGES = [
  { sha: "a41f9c2", msg: "feat: tiered transfer limits", when: "now", current: true },
  { sha: "7be21d0", msg: "fix: rounding on fees", when: "2h ago" },
  { sha: "3f2a91c", msg: "chore: bump dependencies", when: "yesterday" },
];

function Rollback() {
  return (
    <div className="flex h-full flex-col">
      <CardHead title="One click back">Roll back to any image Coolify still has, or redeploy without the build cache.</CardHead>
      <div className="mt-auto space-y-1 p-4 pt-6 sm:p-5 sm:pt-6">
        {IMAGES.map((img) => (
          <div
            key={img.sha}
            className={clsx(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150",
              img.current ? "bg-surface-2/70 shadow-[0_0_0_1px_var(--line)]" : "hover:bg-surface-2/50",
            )}
          >
            <span className={clsx("size-1.5 shrink-0 rounded-full", img.current ? "bg-prod" : "bg-faint")} />
            <span className="font-mono text-[12px] text-ink-2">{img.sha}</span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-muted">{img.msg}</span>
            {img.current ? (
              <span className="text-[11.5px] text-prod">running</span>
            ) : (
              <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[11.5px] text-ink-2 opacity-60 transition-opacity duration-150 group-hover:opacity-100">
                Roll back
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- env compare ---------------- */

const ENVS: { key: string; staging: boolean; prod: boolean; issue?: { text: string; tone: "warn" | "danger" } }[] = [
  { key: "DATABASE_URL", staging: true, prod: true },
  { key: "PAYSTACK_SECRET_KEY", staging: true, prod: true, issue: { text: "same value in both", tone: "warn" } },
  { key: "SENTRY_DSN", staging: true, prod: false, issue: { text: "missing in production", tone: "danger" } },
  { key: "REDIS_URL", staging: true, prod: true },
];

function EnvCompare() {
  return (
    <div className="flex h-full flex-col">
      <CardHead title="Staging and production env, side by side">Values are compared as hashes. Oche never shows them.</CardHead>
      <div className="mt-auto p-4 pt-6 sm:p-5 sm:pt-6">
        <div className="overflow-hidden rounded-xl shadow-[0_0_0_1px_var(--line)]">
          <div className="grid grid-cols-[1fr_64px_64px] bg-surface-2/60 px-3.5 py-2 text-[11.5px] text-muted">
            <span>Variable</span>
            <span className="text-center">staging</span>
            <span className="text-center">prod</span>
          </div>
          {ENVS.map((e) => (
            <div key={e.key} className="grid grid-cols-[1fr_64px_64px] items-center border-t border-line px-3.5 py-2.5">
              <span className="min-w-0">
                <span className="block truncate font-mono text-[12px] text-ink-2">{e.key}</span>
                {e.issue && <span className={clsx("text-[11.5px]", e.issue.tone === "danger" ? "text-danger" : "text-staging")}>{e.issue.text}</span>}
              </span>
              {[e.staging, e.prod].map((has, i) => (
                <span key={i} className="grid place-items-center">
                  {has ? <Check className="size-3.5 text-ink-2" /> : <span className="h-px w-3 bg-danger" />}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- setup from scratch ---------------- */

const APPS: { stage: Stage; branch: string; host: string }[] = [
  { stage: "prod", branch: "main", host: "api.acme.com" },
  { stage: "staging", branch: "staging", host: "sandbox.acme.com" },
  { stage: "dev", branch: "develop", host: "apidev.acme.com" },
];

function Setup() {
  return (
    <div className="flex h-full flex-col">
      <CardHead title="Starting from nothing">
        Oche reads the repo for Dockerfiles, then creates the Coolify project and one app per branch, domains included.
      </CardHead>
      <div className="mt-auto space-y-1.5 p-4 pt-6 sm:p-5 sm:pt-6">
        {APPS.map((a, i) => (
          <Reveal key={a.stage} i={i} className="flex items-center gap-3 rounded-lg bg-surface-2/60 px-3 py-2.5 shadow-[0_0_0_1px_var(--line)]">
            <span className="size-1.5 rounded-full" style={{ background: `var(--${a.stage})` }} />
            <span className="w-16 font-mono text-[12px] text-ink-2">{a.branch}</span>
            <span className="text-faint">→</span>
            <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink">{a.host}</span>
            <Check className="size-3.5 text-prod" />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

const SMALL = [
  { icon: Bell, text: "Coolify tells Oche when a deploy finishes. Oche sets up that webhook for you." },
  { icon: Cloud, text: "Coolify behind Cloudflare Access? Give Oche a service token and it gets through." },
  { icon: Server, text: "Each repo links to its own Coolify, so projects on different servers are fine." },
];

export function Deploys() {
  return (
    <section id="deploys" className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
      <SectionHead eyebrow="Coolify" title="Deploys, next to the branches that made them.">
        Link a Coolify and Oche finds the apps building each branch. Logs, redeploys and rollbacks sit on the repo page.
      </SectionHead>

      <div className="mt-16 grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-6">
        <Reveal className="lg:col-span-4 lg:row-span-2">
          <Card className="h-full">
            <FailedBuild />
          </Card>
        </Reveal>
        <Reveal i={1} className="lg:col-span-2">
          <Card className="h-full">
            <HealthGate />
          </Card>
        </Reveal>
        <Reveal i={2} className="lg:col-span-2">
          <Card className="h-full">
            <Rollback />
          </Card>
        </Reveal>
        <Reveal className="lg:col-span-3">
          <Card className="h-full">
            <EnvCompare />
          </Card>
        </Reveal>
        <Reveal i={1} className="lg:col-span-3">
          <Card className="h-full">
            <Setup />
          </Card>
        </Reveal>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {SMALL.map((s, i) => (
          <Reveal key={i} i={i}>
            <div className="flex h-full gap-3 rounded-2xl p-5 text-[14px] leading-relaxed text-muted shadow-[0_0_0_1px_var(--line)]">
              <s.icon className="mt-0.5 size-4.5 shrink-0 text-ink-2" />
              {s.text}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
