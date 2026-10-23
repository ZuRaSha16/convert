"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "./use-reduced-motion";

export const motionEase = [0.22, 1, 0.36, 1] as const;
export const motionEasing = "cubic-bezier(0.22, 1, 0.36, 1)";
export const motionTiming = {
  reveal: 0.4,
  section: 0.42,
  panel: 0.38,
  detail: 0.32,
  stagger: 0.035,
  maxDelay: 0.1,
};

export const revealOffsets = {
  rise: { x: 0, y: 14 },
  fromLeft: { x: -14, y: 0 },
  fromRight: { x: 14, y: 0 },
  soft: { x: 0, y: 6 },
};

const animationPrefix = "convert-entry";

export function stopEntryMotion(root: Element) {
  for (const animation of root.getAnimations({ subtree: true })) {
    if (animation.id.startsWith(animationPrefix)) animation.cancel();
  }
}

// Animate existing elements so grids, text wrapping and scroll regions keep
// their original geometry. No extra wrappers or measured heights are needed.
export function staggerContent(
  root: Element,
  { direction = 1, selector = ":scope > *", axis = "y", delay = 0 } = {},
) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const items = [...root.querySelectorAll<HTMLElement>(selector)]
    .filter(item => item.getClientRects().length > 0);
  items.forEach((item, index) => {
    stopEntryMotion(item);
    item.dataset.motionItem = "";
    const offset = axis === "x" ? `${direction * 6}px 0` : `0 ${direction * 6}px`;
    const animation = item.animate(
      // Independent translation leaves existing transforms (e.g. SVGs and
      // progress indicators) intact instead of replacing them during entry.
      [{ opacity: 0, translate: offset }, { opacity: 1, translate: "none" }],
      {
        id: `${animationPrefix}-stagger`,
        duration: motionTiming.detail * 1000,
        delay: Math.min(delay + index * motionTiming.stagger, motionTiming.maxDelay) * 1000,
        easing: motionEasing,
        fill: "backwards",
      },
    );
    animation.onfinish = () => animation.cancel();
  });
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "rise",
  stagger = false,
  "aria-label": label,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: keyof typeof revealOffsets;
  stagger?: boolean;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    return () => { if (root) stopEntryMotion(root); };
  }, []);
  return (
    <motion.div
      ref={ref}
      className={className}
      aria-label={label}
      data-motion-reveal={variant}
      initial={{ opacity: 0, ...(reduce ? { x: 0, y: 0 } : revealOffsets[variant]) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      onViewportEnter={() => {
        if (stagger && ref.current) staggerContent(ref.current, { delay });
      }}
      transition={{
        duration: reduce ? 0 : motionTiming.reveal,
        delay: reduce ? 0 : Math.min(delay, motionTiming.maxDelay),
        ease: motionEase,
      }}
    >
      {children}
    </motion.div>
  );
}
