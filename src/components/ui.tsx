import clsx from "clsx";
import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

/** True once the element has been on screen (or stays in sync with `once: false`). */
export function useInView<T extends Element>({ once = true, margin = "0px 0px -12% 0px", threshold = 0 } = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const v = !!entry?.isIntersecting;
        if (v && once) {
          setInView(true);
          io.disconnect();
        } else if (!once) setInView(v);
      },
      { rootMargin: margin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, margin, threshold]);
  return [ref, inView] as const;
}

export const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Rises and sharpens into place the first time it scrolls into view. */
export function Reveal({
  as: Tag = "div",
  i = 0,
  className,
  style,
  children,
}: {
  as?: ElementType;
  i?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLElement>();
  return (
    <Tag ref={ref} data-in={inView} className={clsx("reveal", className)} style={{ ...style, "--i": i } as CSSProperties}>
      {children}
    </Tag>
  );
}

export function SectionHead({ eyebrow, title, children, center = false }: { eyebrow: string; title: ReactNode; children?: ReactNode; center?: boolean }) {
  return (
    <div className={clsx("max-w-2xl", center && "mx-auto text-center")}>
      <Reveal as="p" className="eyebrow">
        {eyebrow}
      </Reveal>
      <Reveal as="h2" i={1} className="headline sheen mt-4 text-[clamp(34px,5vw,56px)]">
        {title}
      </Reveal>
      {children && (
        <Reveal as="p" i={2} className="lede mt-5 text-[17px] leading-relaxed text-ink-2">
          {children}
        </Reveal>
      )}
    </div>
  );
}

export type Stage = "dev" | "staging" | "prod";
export const STAGE_TEXT: Record<Stage, string> = { dev: "text-dev", staging: "text-staging", prod: "text-prod" };
export const STAGE_BG: Record<Stage, string> = { dev: "bg-dev", staging: "bg-staging", prod: "bg-prod" };

export function Branch({ name, stage, className }: { name: string; stage?: Stage; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[12.5px] text-ink-2 shadow-[0_0_0_1px_var(--line)]", className)}>
      {stage && <span className={clsx("size-1.5 rounded-full", STAGE_BG[stage])} />}
      {name}
    </span>
  );
}

/** Tracks the pointer inside an element for the .spotlight glow. */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    el.addEventListener("pointermove", move);
    return () => el.removeEventListener("pointermove", move);
  }, []);
  return ref;
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useSpotlight<HTMLDivElement>();
  return (
    <div ref={ref} className={clsx("card spotlight overflow-hidden", className)}>
      {children}
    </div>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={clsx(
        "pressable inline-flex shrink-0 items-center justify-center gap-2 font-medium whitespace-nowrap select-none",
        {
          primary:
            "bg-ember text-ember-ink shadow-[inset_0_1px_0_rgb(255_255_255/0.25),0_0_0_1px_rgb(255_106_66/0.5),0_8px_24px_-8px_rgb(255_106_66/0.6)] hover:brightness-[1.08]",
          secondary: "bg-surface-2/80 text-ink shadow-[inset_0_1px_0_rgb(255_245_235/0.06),0_0_0_1px_var(--line-strong)] backdrop-blur hover:bg-surface-3",
          ghost: "text-ink-2 hover:text-ink",
        }[variant],
        { sm: "h-8 rounded-lg px-3 text-[13px]", md: "h-10 rounded-xl px-4 text-[14px]", lg: "h-12 rounded-xl px-5 text-[15px]" }[size],
        className,
      )}
    >
      {children}
    </a>
  );
}
