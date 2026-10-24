"use client";

import { useRef } from "react";
import { Fingerprint } from "lucide-react";
import { useInView } from "motion/react";
import { useCopy } from "./language";
import { useReducedMotion } from "./use-reduced-motion";

export function FingerprintInteraction() {
  const t = useCopy();
  const root = useRef<HTMLDivElement>(null);
  const visible = useInView(root, { margin: "40px" });
  const reduce = useReducedMotion();

  return (
    <div
      ref={root}
      className="fingerprint-interaction"
      data-motion={visible && !reduce ? "running" : "paused"}
    >
      <div className="trust-orbit" aria-hidden="true">
        <div />
        <div />
        <div />
      </div>
      <div
        className="fingerprint-disc"
        role="img"
        aria-label={t("Fingerprint", "თითის ანაბეჭდი")}
      >
        <Fingerprint size={92} strokeWidth={1} aria-hidden="true" />
      </div>
    </div>
  );
}
