"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useIsPresent } from "motion/react";
import { motionEase, motionTiming, staggerContent, stopEntryMotion } from "./motion-style";
import { useReducedMotion } from "./use-reduced-motion";

export function MobileNavigation({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const present = useIsPresent();
  const reduce = useReducedMotion();
  useEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    if (present && !reduce) staggerContent(menu);
    return () => stopEntryMotion(menu);
  }, [present, reduce]);

  return (
    <motion.nav
      ref={ref}
      id="mobile-nav"
      className="mobile-nav"
      aria-label={label}
      aria-hidden={!present}
      inert={!present}
      initial={{ y: reduce ? 0 : -10, opacity: reduce ? 1 : 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: reduce ? 0 : -6, opacity: 0 }}
      transition={{ duration: reduce ? 0 : motionTiming.detail, ease: motionEase }}
    >
      {children}
    </motion.nav>
  );
}
