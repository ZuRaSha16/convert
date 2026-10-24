"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { LogoMark } from "./logo-mark";
import { useCopy } from "./language";
import { useReducedMotion } from "./use-reduced-motion";

export function NotificationStack() {
  const t = useCopy();
  const root = useRef<HTMLDivElement>(null);
  const visible = useInView(root, { amount: 0.3 });
  const reduce = useReducedMotion();
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (!visible || reduce) return;
    const timer = window.setTimeout(
      () => setCount(current => current === 5 ? 0 : current + 1),
      count === 0 ? 650 : count === 5 ? 2800 : 2100,
    );
    return () => window.clearTimeout(timer);
  }, [count, visible, reduce]);

  const messages = [
    {
      title: t("A gentle nudge.", "მშვიდი შეხსენება."),
      text: t("Your loan payment is due in 3 days. You’ve got this.", "სესხის გადახდა 3 დღეშია. ყველაფერი გამოგივა."),
    },
    {
      title: t("One less thing to remember.", "ერთი საზრუნავით ნაკლები."),
      text: t("Your electricity bill is due in 5 days.", "ელექტროენერგიის გადახდის ვადა 5 დღეშია."),
    },
    {
      title: t("A little heads-up.", "პატარა შეხსენება."),
      text: t("Your property tax is due in 18 days.", "ქონების გადასახადის ვადა 18 დღეშია."),
    },
    {
      title: t("Your next 30 days.", "შემდეგი 30 დღე."),
      text: t("3 obligations. One clear picture.", "3 ვალდებულება. ერთი ნათელი სურათი."),
    },
    {
      title: t("Progress you can feel.", "პროგრესი, რომელსაც გრძნობ."),
      text: t("Small steps. Real progress.", "პატარა ნაბიჯები. რეალური პროგრესი."),
    },
  ];
  const stack = messages
    .slice(0, reduce ? 1 : count)
    .map((message, id) => ({ ...message, id }))
    .slice(-3)
    .reverse();

  return (
    <div ref={root} className="notification-stack" role="img" aria-label={t("Convert notification preview", "Convert-ის შეტყობინებების დემო")}>
      <div aria-hidden="true">
        <AnimatePresence>
          {stack.map((message, position) => (
            <motion.div
              key={message.id}
              className="notification-banner"
              data-notification={message.id + 1}
              initial={reduce ? false : { y: -42, scale: 0.97, opacity: 0 }}
              animate={{ y: position * 22, scale: 1 - position * 0.035, opacity: 1 - position * 0.15 }}
              exit={{ y: 38, opacity: 0, scale: 0.96, transition: { duration: 0.4 } }}
              transition={{ type: "spring", stiffness: 230, damping: 25, mass: 0.8 }}
              style={{ zIndex: 5 - position }}
            >
              <span className="notification-app-icon"><LogoMark width={29} height={29} /></span>
              <div className="notification-banner-copy">
                <div className="notification-banner-meta"><strong>convert</strong><span>{t("now", "ახლა")}</span></div>
                <h4>{message.title}</h4>
                <p>{message.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
