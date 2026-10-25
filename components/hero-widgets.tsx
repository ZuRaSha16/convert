"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Bell, BellRing, Check, RotateCcw, Sparkles } from "lucide-react";
import { useCopy } from "./language";
import { useReducedMotion } from "./use-reduced-motion";

function FloatingWidget({
  kind,
  label,
  children,
}: {
  kind: "reminder" | "progress";
  label: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.aside
      className={`hero-widget-position hero-widget-${kind}`}
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : kind === "reminder" ? 0.35 : 0.5 }}
    >
      <div className={`floating-card ${kind}-float hero-widget-surface`}>
        {children}
      </div>
    </motion.aside>
  );
}

export function HeroWidgets() {
  const t = useCopy();
  const [reminderSet, setReminderSet] = useState(false);
  const [paymentPreview, setPaymentPreview] = useState(false);
  const progress = paymentPreview ? 40 : 32;
  const reduce = useReducedMotion();

  return (
    <div className="hero-widgets">
      <FloatingWidget kind="reminder" label={t("Payment reminder", "გადახდის შეხსენება")}>
        <div className="widget-heading">
          <span className="float-icon" data-active={reminderSet}>
            {reminderSet ? <Check size={19} aria-hidden="true" /> : <Bell size={19} aria-hidden="true" />}
          </span>
          <div className="widget-heading-copy">
            <span className="widget-eyebrow">{t("PAYMENT REMINDER", "გადახდის შეხსენება")}</span>
            <strong>{t("One less thing to remember.", "ერთი საზრუნავით ნაკლები.")}</strong>
          </div>
        </div>
        <div className="widget-payment-row">
          <span>{t("Personal loan", "პირადი სესხი")}</span>
          <strong>₾450<span>.00</span></strong>
        </div>
        <div className="widget-reminder-footer">
          <span className="widget-due"><span />{t("Due in 3 days", "ვადა 3 დღეში")}</span>
          <button
            type="button"
            className="widget-action widget-reminder-action"
            aria-pressed={reminderSet}
            onClick={() => setReminderSet(!reminderSet)}
          >
            {reminderSet ? <Check size={13} aria-hidden="true" /> : <BellRing size={13} aria-hidden="true" />}
            <span aria-live="polite">{reminderSet ? t("Reminder set", "შეხსენება ჩართულია") : t("Remind me", "შემახსენე")}</span>
          </button>
        </div>
      </FloatingWidget>

      <FloatingWidget kind="progress" label={t("Your progress", "თქვენი პროგრესი")}>
        <div className="widget-heading">
          <span className="mini-ring">
            <svg viewBox="0 0 48 48" aria-hidden="true">
              <circle className="widget-ring-track" cx="24" cy="24" r="20" />
              <motion.circle className="widget-ring-fill" cx="24" cy="24" r="20" pathLength="100"
                initial={false} animate={{ strokeDasharray: `${progress} 100` }}
                transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div className="widget-heading-copy">
            <span className="widget-eyebrow">{t("YOUR PROGRESS", "თქვენი პროგრესი")}</span>
            <strong>{t("Small steps. Real progress.", "პატარა ნაბიჯები. რეალური პროგრესი.")}</strong>
          </div>
        </div>
        <div className="widget-progress-summary">
          <strong>
            <span className="widget-progress-number">
              <motion.span key={progress} initial={reduce ? false : { y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                {progress}
              </motion.span>
            </span><span>%</span>
          </strong>
          <span className="widget-progress-caption" aria-live="polite">
            {paymentPreview ? t("+8% repaid", "+8% დაფარულია") : t("repaid so far", "უკვე დაფარულია")}
          </span>
        </div>
        <div className="widget-progress" role="progressbar" aria-label={t("Loan repaid", "დაფარული სესხი")} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <motion.span initial={false} animate={{ width: `${progress}%` }}
            transition={{ duration: reduce ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        <div className="widget-progress-footer">
          <span className="widget-progress-detail">
            <span>{t(`${100 - progress}% to go`, `დარჩა ${100 - progress}%`)}</span>
            <small>{t("Next goal: 50%", "შემდეგი მიზანი: 50%")}</small>
          </span>
          <button
            type="button"
            className="widget-action widget-progress-action"
            onClick={() => setPaymentPreview(!paymentPreview)}
          >
            {paymentPreview ? <RotateCcw size={13} aria-hidden="true" /> : <ArrowUpRight size={13} aria-hidden="true" />}
            {paymentPreview ? t("Undo payment", "გადახდის გაუქმება") : t("Add payment", "გადახდის დამატება")}
          </button>
        </div>
      </FloatingWidget>
    </div>
  );
}
