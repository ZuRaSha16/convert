"use client";

import { useEffect, useSyncExternalStore, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "./use-reduced-motion";

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

export function SiteBackground() {
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
  const reduce = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, { stiffness: 35, damping: 25 });
  const y = useSpring(pointerY, { stiffness: 35, damping: 25 });

  useEffect(() => {
    if (reduce) return;
    function followPointer(event: globalThis.PointerEvent) {
      if (event.pointerType !== "mouse") return;
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 22);
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 16);
    }
    window.addEventListener("pointermove", followPointer, { passive: true });
    return () => window.removeEventListener("pointermove", followPointer);
  }, [reduce, pointerX, pointerY]);

  return (
    <div
      className="site-atmosphere"
      data-motion={visible && !reduce ? "running" : "paused"}
      aria-hidden="true"
    >
      <motion.div
        className="atmosphere-light-field"
        style={reduce ? undefined : { x, y }}
      >
        <div className="atmosphere-light atmosphere-light-accent" />
        <div className="atmosphere-light atmosphere-light-blue" />
      </motion.div>
      <svg
        className="atmosphere-paths"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <path
          className="atmosphere-track"
          d="M-100 940 C300 940 490 300 890 380 S1320 500 1700 -80"
        />
        <path
          className="atmosphere-tracer"
          d="M-100 940 C300 940 490 300 890 380 S1320 500 1700 -80"
        />
        <path
          className="atmosphere-track atmosphere-track-secondary"
          d="M-100 974 C300 974 490 334 890 414 S1320 534 1700 -46"
        />
      </svg>
      {Array.from({ length: 20 }, (_, index) => (
        <span
          key={index}
          className="atmosphere-particle"
          style={
            {
              left: `${((index * 43 + 19) % 96) + 2}%`,
              top: `${((index * 29 + 13) % 92) + 4}%`,
              "--drift-x": `${(index % 2 ? 1 : -1) * (20 + (index % 5) * 8)}px`,
              "--drift-y": `${-24 - (index % 4) * 16}px`,
              "--duration": `${22 + (index % 7) * 3}s`,
              "--delay": `${-(index * 3 + 2) % 29}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
