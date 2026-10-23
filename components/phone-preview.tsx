"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { useReducedMotion } from "./use-reduced-motion";
import { motionEase, motionTiming, staggerContent, stopEntryMotion } from "./motion-style";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CreditCard,
  House,
  LayoutGrid,
  SlidersHorizontal,
  Signal,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";
import { useCopy } from "./language";

export type PreviewTab = "overview" | "timeline" | "plan";
const previewTabs: PreviewTab[] = ["overview", "timeline", "plan"];

type ViewMotion = { direction: number; reduce: boolean };
const viewVariants = {
  enter: ({ direction, reduce }: ViewMotion) => ({ opacity: reduce ? 1 : 0, x: reduce ? 0 : direction * 16 }),
  visible: { opacity: 1, x: 0 },
  exit: ({ direction, reduce }: ViewMotion) => ({
    opacity: reduce ? 1 : 0,
    x: reduce ? 0 : direction * -12,
    transition: { duration: reduce ? 0 : motionTiming.detail, ease: motionEase },
  }),
};

function PreviewView({ children, label, tab, direction, reduce, revealContent }: {
  children: ReactNode;
  label: string;
  tab: PreviewTab;
  direction: number;
  reduce: boolean;
  revealContent: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const present = useIsPresent();
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (revealContent && present && !reduce) {
      staggerContent(root.querySelector(".timeline-view, .plan-view") ?? root, { direction, axis: "x" });
    }
    return () => stopEntryMotion(root);
  }, [direction, present, reduce, revealContent]);

  return (
    <motion.div
      ref={ref}
      custom={{ direction, reduce }}
      variants={viewVariants}
      initial="enter"
      animate="visible"
      exit="exit"
      transition={{ duration: reduce ? 0 : motionTiming.panel, ease: motionEase }}
      className="phone-view"
      data-preview-tab={tab}
      role="region"
      aria-label={label}
      aria-hidden={!present}
      inert={!present}
      tabIndex={present ? 0 : -1}
    >
      {children}
    </motion.div>
  );
}

export function PhonePreview({
  tab: controlledTab,
  onTabChange,
  compact = false,
}: {
  tab?: PreviewTab;
  onTabChange?: (tab: PreviewTab) => void;
  compact?: boolean;
}) {
  const [localTab, setLocalTab] = useState<PreviewTab>("overview");
  const [payment, setPayment] = useState(450);
  const [selected, setSelected] = useState<string | null>(null);
  const [reminder, setReminder] = useState(false);
  const reduce = useReducedMotion();
  const t = useCopy();
  const tab = controlledTab ?? localTab;
  const [navigation, setNavigation] = useState({ tab, direction: 1, hasNavigated: false });
  // Also track changes made by the experience section's external controls.
  if (navigation.tab !== tab) {
    setNavigation({
      tab,
      direction: previewTabs.indexOf(tab) > previewTabs.indexOf(navigation.tab) ? 1 : -1,
      hasNavigated: true,
    });
  }
  const changeTab = (next: PreviewTab) => {
    setLocalTab(next);
    onTabChange?.(next);
    setSelected(null);
  };
  const months = Math.ceil(4200 / payment);
  const obligations = [
    {
      name: t("Personal loan", "პირადი სესხი"),
      type: t("Monthly installment", "ყოველთვიური შენატანი"),
      amount: "450.00",
      days: t("In 3 days", "3 დღეში"),
      icon: CreditCard,
      color: "emerald",
      detail: t(
        "₾4,200 remaining · 10 estimated payments at ₾450/month, excluding interest and fees.",
        "დარჩენილია ₾4,200 · დაახლოებით 10 გადახდა თვეში ₾450-ით, პროცენტისა და საკომისიოს გარეშე.",
      ),
    },
    {
      name: t("Electricity", "ელექტროენერგია"),
      type: t("Utility bill", "კომუნალური"),
      amount: "68.50",
      days: t("In 5 days", "5 დღეში"),
      icon: Zap,
      color: "lilac",
      detail: t(
        "Example electricity bill. Payment reminder planned 2 days before the due date.",
        "ელექტროენერგიის სანიმუშო ქვითარი. შეხსენება დაგეგმილია ვადამდე 2 დღით ადრე.",
      ),
    },
    {
      name: t("Property tax", "ქონების გადასახადი"),
      type: t("Annual payment", "წლიური გადახდა"),
      amount: "320.00",
      days: t("In 18 days", "18 დღეში"),
      icon: House,
      color: "mint",
      detail: t(
        "Fictional annual property tax. Actual tax obligations and deadlines must be verified with the relevant authority.",
        "ქონების გამოგონილი წლიური გადასახადი. რეალური თანხა და ვადა გადაამოწმეთ შესაბამის უწყებასთან.",
      ),
    },
  ];

  return (
    <div
      className={`phone ${compact ? "phone-compact" : ""}`}
      aria-label={t(
        "Interactive app concept. Fictional demo data.",
        "აპლიკაციის ინტერაქტიული კონცეფცია. გამოგონილი მონაცემები.",
      )}
    >
      <div className="phone-status">
        <span>9:41</span>
        <div className="phone-island" />
        <span className="status-icons">
          <Signal size={14} strokeWidth={2.5} aria-hidden="true" />
          <Wifi size={13} />
          <span className="battery" />
        </span>
      </div>
      <div className="phone-content">
        <div className="phone-greeting">
          <div>
            <span className="tiny-muted">
              {t("A little more peace of mind.", "მეტი სიმშვიდე ყოველდღე.")}
            </span>
            <h3>
              {t("Hello, Nino", "გამარჯობა, ნინო")}{" "}
              <span className="greeting-spark">✳</span>
            </h3>
          </div>
          <button
            className={`notification-button ${reminder ? "is-on" : ""}`}
            onClick={() => setReminder(!reminder)}
            aria-label={t("Toggle demo reminder", "დემო შეხსენების გადართვა")}
            aria-pressed={reminder}
          >
            <Bell size={17} />
            <i />
          </button>
        </div>
        {reminder && (
          <div className="demo-reminder" role="status">
            <Bell size={13} />
            {t(
              "Loan reminder: due in 3 days",
              "სესხის შეხსენება: ვადა 3 დღეში",
            )}
          </div>
        )}
        <div
          className="phone-tabs"
          aria-label={t("Preview views", "დემო ხედები")}
        >
          {(["overview", "timeline", "plan"] as const).map((item, i) => (
            <button
              key={item}
              onClick={() => changeTab(item)}
              aria-pressed={tab === item}
              className={tab === item ? "active" : ""}
            >
              {
                [
                  t("Overview", "მიმოხილვა"),
                  t("Timeline", "ვადები"),
                  t("My plan", "გეგმა"),
                ][i]
              }
            </button>
          ))}
        </div>
        <div className="phone-view-stage" data-motion-direction={navigation.direction}>
        <AnimatePresence mode="sync" initial={false} custom={{ direction: navigation.direction, reduce }}>
          <PreviewView
            key={tab}
            tab={tab}
            direction={navigation.direction}
            reduce={reduce}
            revealContent={navigation.hasNavigated}
            label={t("App preview content", "აპის დემოს შიგთავსი")}
          >
            {tab === "overview" && (
              <>
                <div className="balance-card">
                  <div className="balance-top">
                    <span>{t("Total remaining", "სულ დარჩენილია")}</span>
                    <ArrowUpRight size={16} />
                  </div>
                  <div className="balance-amount">
                    <span>₾</span>4,588<span>.50</span>
                  </div>
                  <div className="balance-bottom">
                    <span>
                      <ArrowDownLeft size={12} />
                      12.8% {t("this month", "ამ თვეში")}
                    </span>
                    <span>{t("Demo balance", "დემო ბალანსი")}</span>
                  </div>
                  <svg
                    className="balance-waves"
                    viewBox="0 0 300 100"
                    aria-hidden="true"
                  >
                    <path d="M-20 100 Q70 -15 150 64 T330 0" />
                    <path d="M-20 115 Q70 0 150 79 T330 15" />
                    <path d="M-20 130 Q70 15 150 94 T330 30" />
                  </svg>
                </div>
                <div className="phone-section-heading">
                  <h4>{t("Coming up", "მოახლოებული")}</h4>
                  <span>
                    {t("This month", "ამ თვეში")} <ChevronRight size={11} />
                  </span>
                </div>
                <div className="obligation-list">
                  {obligations.map((item) => (
                    <button
                      key={item.amount}
                      className="obligation"
                      onClick={() =>
                        setSelected(selected === item.name ? null : item.name)
                      }
                      aria-expanded={selected === item.name}
                    >
                      <span className={`obligation-icon ${item.color}`}>
                        <item.icon size={17} />
                      </span>
                      <span className="obligation-label">
                        <strong>{item.name}</strong>
                        <small>{item.type}</small>
                      </span>
                      <span className="obligation-number">
                        <strong>₾{item.amount}</strong>
                        <small>{item.days}</small>
                      </span>
                      {selected === item.name && (
                        <span className="obligation-detail">{item.detail}</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="progress-card">
                  <span className="progress-icon">
                    <Sparkles size={17} />
                  </span>
                  <div>
                    <strong>
                      {t(
                        "A little closer to debt-free",
                        "უფრო ახლოს თავისუფლებასთან",
                      )}
                    </strong>
                    <small>
                      {t(
                        "You’ve repaid 32% of your demo loan",
                        "დემო სესხის 32% დაფარულია",
                      )}
                    </small>
                    <div className="mini-progress">
                      <motion.span
                        style={{ width: "32%" }}
                        initial={{ scaleX: reduce ? 1 : 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: reduce ? 0 : motionTiming.reveal, ease: motionEase }}
                      />
                    </div>
                  </div>
                  <b>32%</b>
                </div>
              </>
            )}
            {tab === "timeline" && (
              <div className="timeline-view">
                <div className="phone-section-heading">
                  <h4>{t("Your next 30 days", "შემდეგი 30 დღე")}</h4>
                  <CalendarDays size={16} />
                </div>
                <div className="timeline-summary">
                  <small>{t("Upcoming payments", "მომავალი გადახდები")}</small>
                  <strong>₾838.50</strong>
                  <span>
                    {t(
                      "3 obligations. One clear picture.",
                      "3 ვალდებულება. ერთი ნათელი სურათი.",
                    )}
                  </span>
                </div>
                {obligations.map((item, i) => (
                  <div className="timeline-item" key={item.amount}>
                    <div className="timeline-dot" />
                    <div>
                      <small>{item.days}</small>
                      <strong>{item.name}</strong>
                      <span>₾{item.amount}</span>
                    </div>
                    <span className={`timeline-badge ${i === 0 ? "soon" : ""}`}>
                      {i === 0
                        ? t("Up next", "შემდეგი")
                        : t("Planned", "დაგეგმილი")}
                    </span>
                  </div>
                ))}
                <p className="phone-note">
                  {t(
                    "A sample schedule, not live account information.",
                    "სანიმუშო განრიგი, არა ანგარიშის რეალური ინფორმაცია.",
                  )}
                </p>
              </div>
            )}
            {tab === "plan" && (
              <div className="plan-view">
                <div className="phone-section-heading">
                  <h4>
                    {t("Make room for your future", "დაგეგმე შენი მომავალი")}
                  </h4>
                  <Sparkles size={16} />
                </div>
                <div className="plan-ring">
                  <svg viewBox="0 0 180 180" aria-hidden="true">
                    <circle cx="90" cy="90" r="75" className="ring-track" />
                    <motion.circle
                      cx="90"
                      cy="90"
                      r="75"
                      className="ring-fill"
                      strokeDasharray="471"
                      animate={{ strokeDashoffset: 471 * (1 - payment / 1500) }}
                      transition={{ duration: reduce ? 0 : motionTiming.reveal, ease: motionEase }}
                    />
                  </svg>
                  <div>
                    <motion.strong
                      key={months}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: reduce ? 0 : 0.3, ease: motionEase }}
                    >
                      {months}
                    </motion.strong>
                    <span>{t("months to go", "თვე დარჩა")}</span>
                  </div>
                </div>
                <div className="range-heading">
                  <label htmlFor={compact ? "payment-hero" : "payment-main"}>
                    {t("Monthly repayment", "თვიური გადახდა")}
                  </label>
                  <strong>₾{payment}</strong>
                </div>
                <input
                  id={compact ? "payment-hero" : "payment-main"}
                  type="range"
                  min="150"
                  max="1500"
                  step="50"
                  value={payment}
                  onChange={(e) => setPayment(Number(e.target.value))}
                />
                <div className="range-labels">
                  <span>₾150</span>
                  <span>₾1,500</span>
                </div>
                <div className="plan-insight">
                  <Check size={16} />
                  <span>
                    {t(
                      `At ₾${payment}/month, a ₾4,200 balance takes about ${months} months.`,
                      `თვეში ₾${payment}-ით, ₾4,200-ის დაფარვას დაახლოებით ${months} თვე სჭირდება.`,
                    )}
                  </span>
                </div>
                <p className="phone-note">
                  {t(
                    "Illustrative estimate. Excludes interest and fees; not financial advice.",
                    "საილუსტრაციო გამოთვლა. პროცენტისა და საკომისიოს გარეშე; არ არის ფინანსური რჩევა.",
                  )}
                </p>
              </div>
            )}
          </PreviewView>
        </AnimatePresence>
        </div>
      </div>
      <div className="phone-bottom-nav">
        {([LayoutGrid, CalendarDays, SlidersHorizontal] as const).map(
          (Icon, i) => (
            <button
              key={i}
              onClick={() =>
                changeTab((["overview", "timeline", "plan"] as const)[i])
              }
              className={
                tab === (["overview", "timeline", "plan"] as const)[i]
                  ? "active"
                  : ""
              }
              aria-label={
                [
                  t("Overview", "მიმოხილვა"),
                  t("Timeline", "ვადები"),
                  t("Repayment planner", "გადახდის გეგმა"),
                ][i]
              }
            >
              <Icon size={18} />
              <span>
                {
                  [
                    t("Home", "მთავარი"),
                    t("Payments", "გადახდები"),
                    t("Plan", "გეგმა"),
                  ][i]
                }
              </span>
            </button>
          ),
        )}
      </div>
      <div className="home-indicator" />
    </div>
  );
}
