"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotion } from "./use-reduced-motion";
import { motionEase, motionTiming, revealOffsets, staggerContent, stopEntryMotion } from "./motion-style";

export function FeatureCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.2 });
  const reduce = useReducedMotion();
  useEffect(() => {
    const root = ref.current;
    return () => { if (root) stopEntryMotion(root); };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      data-animate={visible && !reduce ? "active" : "paused"}
      data-motion-reveal="rise"
      initial={{ opacity: 0, ...(reduce ? { x: 0, y: 0 } : revealOffsets.rise) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      onViewportEnter={() => {
        if (ref.current) staggerContent(ref.current, { selector: ":scope > h3, :scope > p", delay });
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
