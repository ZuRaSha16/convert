"use client";

import { useRef, useSyncExternalStore, type CSSProperties } from "react";
import { useInView } from "motion/react";
import { useReducedMotion } from "./use-reduced-motion";

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function visiblePage() {
  return document.visibilityState !== "hidden";
}

export function AmbientBackground({
  variant = "quiet",
  seed = 1,
}: {
  variant?: "hero" | "quiet" | "immersive" | "closing";
  seed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "80px" });
  const pageVisible = useSyncExternalStore(
    subscribeVisibility,
    visiblePage,
    () => true,
  );
  const reduce = useReducedMotion();
  const count = variant === "hero" ? 26 : 16;

  return (
    <div
      ref={ref}
      className={`ambient-background ambient-${variant}`}
      data-motion={inView && pageVisible && !reduce ? "running" : "paused"}
      aria-hidden="true"
    >
      <div className="ambient-light ambient-light-emerald" />
      <div className="ambient-light ambient-light-blue" />
      <svg
        className="ambient-currents"
        viewBox="0 0 1200 700"
        preserveAspectRatio="none"
      >
        <path
          className="ambient-current-track"
          d="M-80 560 C160 650 320 160 610 340 S990 520 1280 100"
        />
        <path
          className="ambient-current-flow"
          d="M-80 560 C160 650 320 160 610 340 S990 520 1280 100"
        />
        <path
          className="ambient-current-track"
          d="M-80 590 C160 680 320 190 610 370 S990 550 1280 130"
        />
      </svg>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`ambient-particle ${i % 5 === 0 ? "ambient-particle-spark" : ""}`}
          style={
            {
              left: `${((i * 43 + seed * 17) % 97) + 1}%`,
              top: `${((i * 29 + seed * 11) % 92) + 4}%`,
              "--particle-size": `${i % 5 === 0 ? 4 : 2}px`,
              "--drift-x": `${(i % 2 ? 1 : -1) * (20 + (i % 7) * 8)}px`,
              "--drift-y": `${-35 - (i % 6) * 14}px`,
              "--particle-duration": `${14 + (i % 9) * 2}s`,
              "--particle-delay": `${-(i * 3 + seed) % 25}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
