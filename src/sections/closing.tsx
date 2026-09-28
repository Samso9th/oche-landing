import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { PointerEvent } from "react";
import { Mark, Wordmark } from "../components/logo.tsx";
import { Reveal } from "../components/ui.tsx";
import { WaitlistForm } from "../components/waitlist-form.tsx";
import { APP_URL } from "../links.ts";

/** The wordmark on a slab that tilts toward the pointer, on a spring. */
function TiltMark() {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 140, damping: 18, mass: 0.6 };
  const rx = useSpring(useTransform(py, [-0.5, 0.5], [10, -10]), spring);
  const ry = useSpring(useTransform(px, [-0.5, 0.5], [-14, 14]), spring);
  const glareX = useTransform(px, [-0.5, 0.5], ["20%", "80%"]);
  const glare = useTransform(glareX, (x) => `radial-gradient(500px circle at ${x} 30%, rgb(255 245 235 / 0.10), transparent 60%)`);

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => {
    px.set(0);
    py.set(0);
  };

  return (
    <div onPointerMove={move} onPointerLeave={leave} className="mx-auto w-full max-w-3xl" style={{ perspective: 1200 }}>
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="card relative grid aspect-[2.1/1] place-items-center overflow-hidden rounded-[28px] bg-[radial-gradient(ellipse_at_50%_0%,#221e1b,#141211_70%)]"
      >
        <motion.div className="pointer-events-none absolute inset-0" style={{ background: glare }} />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: "linear-gradient(rgb(255 245 235 / 0.035) 1px, transparent 1px), linear-gradient(90deg, rgb(255 245 235 / 0.035) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          }}
        />
        <div style={{ transform: "translateZ(60px)" }} className="text-ink drop-shadow-[0_24px_40px_rgb(0_0_0/0.6)]">
          <Wordmark height={128} className="h-[clamp(64px,13vw,128px)] w-auto" />
        </div>
      </motion.div>
    </div>
  );
}

export function Closing() {
  return (
    <section id="waitlist" className="relative overflow-hidden px-5 pt-20 pb-28 sm:px-8 sm:pb-36">
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 mx-auto h-[480px] max-w-4xl rounded-full bg-[radial-gradient(closest-side,rgb(255_106_66/0.12),transparent)] blur-3xl" />
      <Reveal>
        <TiltMark />
      </Reveal>
      <div className="mx-auto mt-16 max-w-2xl text-center">
        <Reveal as="h2" className="headline sheen text-[clamp(34px,5.2vw,60px)]">
          Put every change on the same road.
        </Reveal>
        <Reveal as="p" i={1} className="lede mx-auto mt-5 max-w-lg text-[17px] leading-relaxed text-ink-2">
          Oche is invite-only for now. Join the waitlist, and once you're in, your GitHub account can sign in and start guarding repos.
        </Reveal>
        <Reveal i={2} className="mt-9">
          <WaitlistForm />
        </Reveal>
        <Reveal as="p" i={3} className="mt-6 text-[13.5px] text-muted">
          Already invited?{" "}
          <a href={APP_URL} className="inline-flex items-center gap-1 text-ink-2 hover:text-ink">
            Sign in <ArrowRight className="size-3.5" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:flex-row sm:items-start sm:justify-between sm:px-8">
        <div className="max-w-sm">
          <Wordmark height={22} className="text-ink" />
          <p className="mt-4 flex gap-2.5 text-[13px] leading-relaxed text-muted">
            <Mark size={16} className="mt-0.5 text-ink-2" />
            Oche is an Idoma name. The mark is an O in bands, after Idoma striped cloth, with an ember band for each stage.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-[13.5px]">
          <a href="#road" className="text-muted hover:text-ink">
            How it works
          </a>
          <a href={APP_URL} className="text-muted hover:text-ink">
            Dashboard
          </a>
          <a href="#cli" className="text-muted hover:text-ink">
            CLI <span className="text-faint">(soon)</span>
          </a>
          <a href={APP_URL} className="text-muted hover:text-ink">
            Sign in
          </a>
          <a href="#deploys" className="text-muted hover:text-ink">
            Coolify
          </a>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-10 font-mono text-[11.5px] text-faint sm:px-8">© {new Date().getFullYear()} Oche</div>
    </footer>
  );
}
