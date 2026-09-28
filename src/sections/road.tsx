import clsx from "clsx";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Branch, type Stage } from "../components/ui.tsx";

/*
 * How a change travels, told by scrolling. The section is tall; the board
 * sticks while a commit hops across four platforms laid out on a tilted plane
 * (plain CSS 3D, so the labels stay crisp). The last step replays the skip:
 * dev straight to main, then main back into staging.
 */

const S = 128; // platform size on the plane
const T = 22; // platform thickness
const GAP = 58;
const X = [0, 1, 2, 3].map((i) => i * (S + GAP));
const PLANE_W = X[3]! + S;
const PLANE_H = S + 150;
const ROW_Y = 40;
const LAYERS = 12;

const PLATFORMS: { name: string; stage?: Stage; note: string }[] = [
  { name: "feature/*", note: "your branch" },
  { name: "dev", stage: "dev", note: "integration" },
  { name: "staging", stage: "staging", note: "sandbox" },
  { name: "main", stage: "prod", note: "production" },
];

const STEPS: { title: string; body: ReactNode }[] = [
  {
    title: "Work lands in dev",
    body: (
      <>
        Any branch can open a PR into <Branch name="dev" stage="dev" />. Strict mode asks for approvals first; fast mode doesn't.
      </>
    ),
  },
  {
    title: "One click to staging",
    body: (
      <>
        Promote from the dashboard. Oche opens the PR, merges it, and Coolify builds staging.
      </>
    ),
  },
  {
    title: "Production gets what passed",
    body: <>With the health gate on, Oche waits for staging to deploy and report healthy before it touches main.</>,
  },
  {
    title: "Or skip staging",
    body: (
      <>
        When it can't wait, dev goes straight to main. Oche merges main back into staging afterwards, so the two don't drift.
      </>
    ),
  },
];

/* ---------------- packet paths ---------------- */

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (p: number, a: number, b: number) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const cx = (i: number) => X[i]! + S / 2;

/** Main packet: feature → dev → staging → main, hopping. */
function mainPath(p: number) {
  const hops: [number, number, number, number][] = [
    [0.06, 0.2, 0, 1],
    [0.3, 0.44, 1, 2],
    [0.55, 0.69, 2, 3],
  ];
  let x = cx(0);
  let z = 0;
  for (const [a, b, from, to] of hops) {
    if (p >= b) x = cx(to);
    else if (p > a) {
      const e = easeInOut(seg(p, a, b));
      x = cx(from) + (cx(to) - cx(from)) * e;
      z = Math.sin(Math.PI * e) * 70;
      break;
    } else break;
  }
  return { x, z };
}

/** The skip: dev straight to main, arcing high over staging. */
function skipPath(p: number) {
  const e = easeInOut(seg(p, 0.8, 0.92));
  return { x: cx(1) + (cx(3) - cx(1)) * e, z: Math.sin(Math.PI * e) * 150 };
}

/** The sync back: main slides into staging along the plane. */
function syncPath(p: number) {
  const e = easeInOut(seg(p, 0.93, 0.99));
  return { x: cx(3) + (cx(2) - cx(3)) * e, z: Math.sin(Math.PI * e) * 26 };
}

/* ---------------- pieces ---------------- */

function Platform({ i, lit, synced }: { i: number; lit: boolean; synced: boolean }) {
  const p = PLATFORMS[i]!;
  const color = p.stage ? `var(--${p.stage})` : "var(--ink-2)";
  return (
    <div className="absolute" style={{ left: X[i], top: ROW_Y, width: S, height: S, transformStyle: "preserve-3d" }}>
      {/* walls */}
      <div
        className="absolute left-0 w-full"
        style={{ top: S, height: T, transformOrigin: "top", transform: "rotateX(90deg)", background: "linear-gradient(180deg, #24211f, #141211)" }}
      />
      <div
        className="absolute top-0 h-full"
        style={{ left: S, width: T, transformOrigin: "left", transform: "rotateY(-90deg)", background: "linear-gradient(90deg, #1c1a18, #100f0e)" }}
      />
      {/* lit halo on the ground */}
      <div
        className="absolute -inset-6 rounded-[28px] transition-opacity duration-700"
        style={{ background: `radial-gradient(closest-side, color-mix(in oklab, ${color} 45%, transparent), transparent)`, opacity: lit ? 0.55 : 0, filter: "blur(10px)" }}
      />
      {/* top face */}
      <div
        className="absolute inset-0 flex flex-col justify-between rounded-[10px] p-3.5 transition-[box-shadow,background-color] duration-500"
        style={{
          transform: `translateZ(${T}px)`,
          background: lit ? "linear-gradient(135deg, #2a2624, #1b1918)" : "linear-gradient(135deg, #201e1c, #171514)",
          boxShadow: lit
            ? `inset 0 0 0 1px color-mix(in oklab, ${color} 70%, transparent), 0 0 36px -6px color-mix(in oklab, ${color} 70%, transparent)`
            : "inset 0 0 0 1px rgb(255 245 235 / 0.08)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <span className={clsx("size-2 rounded-full transition-opacity duration-500", !lit && "opacity-40")} style={{ background: color }} />
          <span className="font-mono text-[10px] tracking-wide text-muted uppercase">{p.note}</span>
        </span>
        <span className="font-mono text-[17px] font-medium" style={{ color: lit ? "var(--ink)" : "var(--muted)" }}>
          {p.name}
        </span>
        {synced && <span className="absolute top-3 right-3 rounded bg-prod/15 px-1 font-mono text-[9px] text-prod">synced</span>}
      </div>
    </div>
  );
}

/** A small lit cube riding above the plane, with a soft shadow that shrinks as it rises. */
function Packet({ x, z, opacity, color = "var(--ember)", size = 30 }: { x: MotionValue<number>; z: MotionValue<number>; opacity: MotionValue<number>; color?: string; size?: number }) {
  const lift = useTransform(z, (v) => v + T + 2);
  const shadowScale = useTransform(z, (v) => 1 - Math.min(0.6, v / 250));
  const shadowOpacity = useTransform(() => (0.55 - Math.min(0.4, z.get() / 300)) * opacity.get());
  const glowOpacity = useTransform(() => (0.7 - Math.min(0.5, z.get() / 200)) * opacity.get());
  const left = useTransform(x, (v) => v - size / 2);
  const top = ROW_Y + S / 2 - size / 2;
  return (
    <>
      {/* Light pooling on the ground under it, then its shadow. Kept off the cube so its walls stay visible. */}
      <motion.div
        className="absolute rounded-full"
        style={{ left, top, width: size, height: size, z: T + 1, scale: 2.6, opacity: glowOpacity, background: `radial-gradient(closest-side, color-mix(in oklab, ${color} 60%, transparent), transparent)` }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ left, top, width: size, height: size, z: T + 2, scale: shadowScale, opacity: shadowOpacity, background: "black", filter: "blur(6px)" }}
      />
      {/* Opacity goes on the slices, never this wrapper: an opacity animation here makes Chrome flatten the 3D. */}
      <motion.div className="absolute" style={{ left, top, width: size, height: size, z: lift, transformStyle: "preserve-3d" }}>
        {/* A stack of thin slices reads as a solid block from any angle. */}
        {Array.from({ length: LAYERS }, (_, i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-[4px]"
            style={{
              opacity,
              transform: `translateZ(${(i / (LAYERS - 1)) * size}px)`,
              background:
                i === LAYERS - 1
                  ? `linear-gradient(135deg, color-mix(in oklab, ${color} 75%, white), ${color})`
                  : `color-mix(in oklab, ${color} ${45 + (i / LAYERS) * 40}%, black)`,
              boxShadow: i === LAYERS - 1 ? "inset 0 0 0 1px rgb(255 255 255 / 0.3)" : undefined,
            }}
          />
        ))}
      </motion.div>
    </>
  );
}

function useScaleToFit(width: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return [ref, scale] as const;
}

/* ---------------- the section ---------------- */

export function Road() {
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setP(Math.round(v * 200) / 200));

  const mainX = useTransform(scrollYProgress, (v) => mainPath(v).x);
  const mainZ = useTransform(scrollYProgress, (v) => mainPath(v).z);
  const mainO = useTransform(scrollYProgress, [0.72, 0.76], [1, 0]);
  const skipX = useTransform(scrollYProgress, (v) => skipPath(v).x);
  const skipZ = useTransform(scrollYProgress, (v) => skipPath(v).z);
  const skipO = useTransform(scrollYProgress, [0.76, 0.8], [0, 1]);
  const syncX = useTransform(scrollYProgress, (v) => syncPath(v).x);
  const syncZ = useTransform(scrollYProgress, (v) => syncPath(v).z);
  const syncO = useTransform(scrollYProgress, [0.92, 0.94, 0.995, 1], [0, 1, 1, 0.9]);
  const arc = useTransform(scrollYProgress, [0.78, 0.92], [0, 1]);
  const trackFill = useTransform(scrollYProgress, (v) => Math.min(1, Math.max(0, (mainPath(v).x - cx(0)) / (cx(3) - cx(0)))));

  const step = Math.min(3, Math.floor(p * 4));
  const skipping = p >= 0.76;
  const lit = [true, skipping || p >= 0.19, !skipping && p >= 0.43, p >= 0.68];
  const synced = p >= 0.985;

  const [boardRef, scale] = useScaleToFit(PLANE_W * 0.98);

  return (
    <section id="road" ref={section} className="relative" style={{ height: "420vh" }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)] items-center gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
          <div className="order-2 lg:order-1">
            <p className="eyebrow">How it works</p>
            <h2 className="headline sheen mt-4 text-[clamp(30px,4.4vw,52px)]">Four rules, and Oche keeps them.</h2>

            <ol className="relative mt-8 space-y-1 max-lg:hidden">
              <div className="absolute top-2 bottom-2 left-[11px] w-px bg-line" />
              <motion.div className="absolute top-2 left-[11px] w-px origin-top bg-ember" style={{ height: "calc(100% - 16px)", scaleY: scrollYProgress }} />
              {STEPS.map((s, i) => (
                <li key={i} className="relative flex gap-4 py-2.5 pl-0">
                  <span
                    className={clsx(
                      "relative z-10 mt-0.5 grid size-[23px] shrink-0 place-items-center rounded-full font-mono text-[11px] transition-[background-color,color,box-shadow] duration-300",
                      i <= step ? "bg-ember text-ember-ink" : "bg-surface-2 text-muted shadow-[0_0_0_1px_var(--line-strong)]",
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className={clsx("transition-opacity duration-300", i === step ? "opacity-100" : "opacity-40")}>
                    <h3 className="text-[16px] font-medium text-ink">{s.title}</h3>
                    <p
                      className={clsx(
                        "grid text-[14.5px] leading-relaxed text-ink-2 transition-[grid-template-rows,opacity,margin] duration-500 ease-[var(--ease-out)]",
                        i === step ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden">{s.body}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Phones: just the current step. */}
            <div className="mt-6 min-h-[132px] lg:hidden">
              <p className="font-mono text-[12px] text-ember">
                {step + 1} / {STEPS.length}
              </p>
              <h3 key={step} className="reveal mt-1 text-[17px] font-medium" data-in>
                {STEPS[step]!.title}
              </h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{STEPS[step]!.body}</p>
            </div>
          </div>

          <div ref={boardRef} className="order-1 flex h-[42svh] items-center justify-center lg:order-2 lg:h-[70svh]" aria-hidden>
            <div style={{ perspective: 1800 * scale, transform: `scale(${scale})` }}>
              <div
                className="relative"
                style={{ width: PLANE_W, height: PLANE_H, transformStyle: "preserve-3d", transform: "rotateX(52deg) rotateZ(-30deg) translateY(-10px)" }}
              >
                {/* the ground: faint grid that fades out */}
                <div
                  className="absolute -inset-24"
                  style={{
                    backgroundImage: "linear-gradient(rgb(255 245 235 / 0.05) 1px, transparent 1px), linear-gradient(90deg, rgb(255 245 235 / 0.05) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                    maskImage: "radial-gradient(closest-side, black 40%, transparent)",
                  }}
                />
                {/* track under the platforms */}
                <div className="absolute h-[3px] rounded-full bg-line-strong" style={{ left: cx(0), width: cx(3) - cx(0), top: ROW_Y + S / 2 - 1.5 }} />
                <motion.div
                  className="absolute h-[3px] origin-left rounded-full bg-gradient-to-r from-ink-2 via-staging to-prod"
                  style={{ left: cx(0), width: cx(3) - cx(0), top: ROW_Y + S / 2 - 1.5, scaleX: trackFill, boxShadow: "0 0 16px rgb(255 245 235 / 0.35)" }}
                />
                {/* the skip: a dashed arc drawn on the ground from dev to main, and the sync back */}
                <svg className="absolute overflow-visible" style={{ left: 0, top: 0, width: PLANE_W, height: PLANE_H }} fill="none">
                  <motion.path
                    d={`M ${cx(1)} ${ROW_Y + S} C ${cx(1)} ${ROW_Y + S + 110}, ${cx(3)} ${ROW_Y + S + 110}, ${cx(3)} ${ROW_Y + S}`}
                    stroke="var(--ember)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ pathLength: arc, opacity: arc, filter: "drop-shadow(0 0 6px var(--ember))" }}
                  />
                </svg>
                {PLATFORMS.map((_, i) => (
                  <Platform key={i} i={i} lit={lit[i]!} synced={i === 2 && synced} />
                ))}
                <Packet x={mainX} z={mainZ} opacity={mainO} size={34} />
                <Packet x={skipX} z={skipZ} opacity={skipO} size={34} />
                <Packet x={syncX} z={syncZ} opacity={syncO} color="var(--prod)" size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">
        {STEPS.map((s) => s.title).join(". ")}. Stages: {PLATFORMS.map((pl) => pl.name).join(", ")}.
      </span>
    </section>
  );
}
