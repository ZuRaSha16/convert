"use client";

import { useId, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Bell, BellRing, Check, ChevronDown, Sparkles } from "lucide-react";
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
  const [showBreakdown, setShowBreakdown] = useState(false);
  const breakdownId = useId();

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
              <circle className="widget-ring-fill" cx="24" cy="24" r="20" pathLength="100" strokeDasharray="32 100" />
            </svg>
            <Sparkles size={18} aria-hidden="true" />
          </span>
          <div className="widget-heading-copy">
            <span className="widget-eyebrow">{t("YOUR PROGRESS", "თქვენი პროგრესი")}</span>
            <strong>{t("Small steps. Real progress.", "პატარა ნაბიჯები. რეალური პროგრესი.")}</strong>
          </div>
        </div>
        <div className="widget-progress-summary">
          <strong>32<span>%</span></strong>
          <span>{t("closer to freedom", "უფრო ახლოს თავისუფლებასთან")}</span>
        </div>
        <div className="widget-progress" role="progressbar" aria-label={t("Loan repaid", "დაფარული სესხი")} aria-valuenow={32} aria-valuemin={0} aria-valuemax={100}>
          <span />
        </div>
        <div className="widget-progress-footer">
          <span className="widget-progress-detail" aria-live="polite">
            <span hidden={showBreakdown}>{t("Your effort is adding up.", "ყოველი ნაბიჯი მნიშვნელოვანია.")}</span>
            <span id={breakdownId} hidden={!showBreakdown}>{t("32% repaid · 68% to go", "32% დაფარულია · დარჩა 68%")}</span>
          </span>
          <button
            type="button"
            className="widget-action widget-progress-action"
            aria-expanded={showBreakdown}
            aria-controls={breakdownId}
            aria-label={showBreakdown ? t("Hide progress breakdown", "პროგრესის დეტალების დამალვა") : t("Show progress breakdown", "პროგრესის დეტალების ჩვენება")}
            onClick={() => setShowBreakdown(!showBreakdown)}
          >
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        </div>
      </FloatingWidget>
    </div>
  );
}
