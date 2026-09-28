import { useEffect, useRef, useState } from "react";
import type { HeroScene } from "../three/hero-scene.ts";
import { Mark } from "./logo.tsx";

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!c.getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * Mounts the three.js hero behind the headline. three loads in its own chunk
 * after first paint, the loop only runs while the hero is on screen and the tab
 * is visible, and without WebGL you get the flat mark instead.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (!webglAvailable()) {
      setFallback(true);
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: HeroScene | null = null;
    let disposed = false;
    let onScreen = true;
    const cleanups: (() => void)[] = [];

    import("../three/hero-scene.ts").then(({ createHeroScene }) => {
      if (disposed || !canvas.current || !wrap.current) return;
      try {
        scene = createHeroScene(canvas.current, { reducedMotion });
      } catch {
        setFallback(true);
        return;
      }
      const s = scene;
      const el = wrap.current;

      const resize = () => s.setSize(el.clientWidth, el.clientHeight);
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();
      cleanups.push(() => ro.disconnect());

      const sync = () => (onScreen && document.visibilityState === "visible" ? s.start() : s.stop());
      const io = new IntersectionObserver(([entry]) => {
        onScreen = !!entry?.isIntersecting;
        sync();
      });
      io.observe(el);
      document.addEventListener("visibilitychange", sync);
      cleanups.push(() => io.disconnect(), () => document.removeEventListener("visibilitychange", sync));

      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== "mouse") return;
        s.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
      };
      const onScroll = () => s.setScroll(window.scrollY / Math.max(1, el.clientHeight));
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      cleanups.push(
        () => window.removeEventListener("pointermove", onMove),
        () => window.removeEventListener("scroll", onScroll),
      );

      sync();
      requestAnimationFrame(() => setReady(true));
    });

    return () => {
      disposed = true;
      cleanups.forEach((f) => f());
      scene?.dispose();
    };
  }, []);

  return (
    <div ref={wrap} className={className} aria-hidden>
      {fallback ? (
        <div className="grid h-full place-items-center md:justify-end md:pr-[12vw]">
          <Mark size={280} className="text-ink opacity-90" />
        </div>
      ) : (
        <canvas
          ref={canvas}
          className="block size-full transition-opacity duration-1000 ease-out"
          style={{ opacity: ready ? 1 : 0 }}
        />
      )}
    </div>
  );
}
