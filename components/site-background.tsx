"use client";

import { useSyncExternalStore, type CSSProperties } from "react";
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
  return (
    <div
      className="site-atmosphere"
      data-motion={visible && !reduce ? "running" : "paused"}
      aria-hidden="true"
    >
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
