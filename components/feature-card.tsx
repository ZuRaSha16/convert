"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "motion/react";
import { useReducedMotion } from "./use-reduced-motion";

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

  return (
    <motion.div
      ref={ref}
      className={className}
      data-animate={visible && !reduce ? "active" : "paused"}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reduce ? 0 : 0.65,
        delay,
        ease: [0.2, 0.7, 0.2, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
