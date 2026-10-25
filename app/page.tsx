"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { AnimatePresence, MotionConfig, motion, useInView } from "motion/react";
import { useReducedMotion } from "@/components/use-reduced-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Bell,
  Check,
  ChevronDown,
  CreditCard,
  Globe2,
  Layers3,
  LockKeyhole,
  Menu,
  MoveUpRight,
  Plus,
  X,
} from "lucide-react";
import { LanguageContext, useCopy, type Language } from "@/components/language";
import { PhonePreview, type PreviewTab } from "@/components/phone-preview";
import { WaitlistForm } from "@/components/waitlist-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { FeatureCard } from "@/components/feature-card";
import { SiteBackground } from "@/components/site-background";
import { GlowLink } from "@/components/glow-link";
import { LogoMark } from "@/components/logo-mark";
import { ClarityNetwork } from "@/components/clarity-network";
import { HeroWidgets } from "@/components/hero-widgets";
import { FingerprintInteraction } from "@/components/fingerprint-interaction";
import { NotificationStack } from "@/components/notification-stack";

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      href="#home"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Convert home"
    >
      <LogoMark className="brand-symbol" />
      convert<span className="brand-period">.</span>
    </a>
  );
}

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 28 }}
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

function Landing({
  language,
  setLanguage,
}: {
  language: Language;
  setLanguage: (value: Language) => void;
}) {
  const t = useCopy();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tab, setTab] = useState<PreviewTab>("overview");
  const [faq, setFaq] = useState<number | null>(null);
  const privacyRef = useRef<HTMLDialogElement>(null);
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const heroVisible = useInView(heroRef, { margin: "80px" });
  const openPrivacy = () => privacyRef.current?.showModal();
  const nav = [
    { href: "#features", label: t("Features", "შესაძლებლობები") },
    { href: "#how-it-works", label: t("How it works", "როგორ მუშაობს") },
    { href: "#about", label: t("Our vision", "ჩვენი ხედვა") },
  ];

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="site-shell" data-language={language}>
        <SiteBackground />
        <a className="skip-link" href="#main">
          {t("Skip to content", "შინაარსზე გადასვლა")}
        </a>
        <header className="site-header">
          <div className="nav-container">
            <Brand />
            <nav
              className="desktop-nav"
              aria-label={t("Main navigation", "მთავარი ნავიგაცია")}
            >
              {nav.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="nav-actions">
              <ThemeToggle />
              <button
                className="language-switch"
                onClick={() => setLanguage(language === "en" ? "ka" : "en")}
                aria-label={
                  language === "en" ? "Switch to Georgian" : "Switch to English"
                }
              >
                <Globe2 size={15} />
                <span>{language === "en" ? "EN" : "ქარ"}</span>
                <ChevronDown size={11} />
              </button>
              <GlowLink className="button button-dark nav-cta" href="#waitlist">
                {t("Join the waitlist", "შემოუერთდი სიას")}
                <ArrowUpRight size={16} />
              </GlowLink>
              <button
                className="menu-toggle"
                aria-label={t("Toggle menu", "მენიუს გადართვა")}
                aria-expanded={menuOpen}
                aria-controls="mobile-nav"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {menuOpen && (
              <motion.nav
                id="mobile-nav"
                className="mobile-nav"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {[
                  ...nav,
                  {
                    href: "#waitlist",
                    label: t("Join the waitlist", "შემოუერთდი სიას"),
                  },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                    <ArrowUpRight size={16} />
                  </a>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </header>

        <main id="main">
          <section
            id="home"
            className="hero"
            ref={heroRef}
            data-motion={heroVisible && !reduce ? "running" : "paused"}
          >
            <div className="container hero-grid">
              <div className="hero-copy">
                <Reveal>
                  <div className="eyebrow pill-eyebrow">
                    <span className="status-dot" />
                    {t(
                      "A clearer financial future is coming",
                      "ნათელი ფინანსური მომავალი ახლოვდება",
                    )}
                  </div>
                </Reveal>
                <h1
                  aria-label={t(
                    "Less juggling. More living.",
                    "ნაკლები საზრუნავი. მეტი ცხოვრება.",
                  )}
                >
                  {[
                    t("Less juggling.", "ნაკლები საზრუნავი."),
                    t("More living.", "მეტი ცხოვრება."),
                  ].map((line, i) => (
                    <span className={`hero-line line-${i}${i === 1 ? " georgian-accent" : ""}`} key={line}>
                      <motion.span
                        initial={{ y: reduce ? 0 : "110%" }}
                        animate={{ y: 0 }}
                        transition={{
                          duration: 0.85,
                          delay: 0.12 + i * 0.12,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))}
                </h1>
                <Reveal delay={0.25}>
                  <p className="hero-description">
                    {t(
                      "Your loans, bills, taxes, and everything in between. Finally, one place to make sense of it all.",
                      "სესხები, გადასახადები და სხვა ვალდებულებები. ბოლოს და ბოლოს, ყველაფერი ერთ სივრცეში.",
                    )}
                  </p>
                  <div className="hero-actions">
                    <GlowLink className="button button-accent" href="#waitlist">
                      {t(
                        "Find your financial calm",
                        "იპოვე ფინანსური სიმშვიდე",
                      )}
                      <ArrowUpRight size={18} />
                    </GlowLink>
                    <a className="text-link" href="#experience">
                      <span className="play-icon">
                        <ArrowDown size={14} />
                      </span>
                      {t("Take a look inside", "შეხედე შიგნიდან")}
                    </a>
                  </div>
                  <div className="hero-meta">
                    <span>
                      <span className="tiny-cross">✦</span>
                      {t(
                        "Made for life in Georgia",
                        "შექმნილია საქართველოსთვის",
                      )}
                    </span>
                    <span className="meta-divider" />
                    <span>
                      {t(
                        "Coming to iOS & Android",
                        "მალე iOS-სა და Android-ზე",
                      )}
                    </span>
                  </div>
                </Reveal>
              </div>
              <div className="hero-stage">
                <div className="orbit orbit-one" />

                <motion.div
                  className="hero-phone"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                  whileHover={reduce ? undefined : { x: 3, y: -5, rotate: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 24,
                    opacity: {
                      type: "tween",
                      duration: 1,
                      delay: 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  }}
                >
                  <PhonePreview compact />
                </motion.div>
                <HeroWidgets />
              </div>
            </div>
          </section>

          <div className="obligations-strip">
            <div className="container strip-inner">
              {[
                t("Loans", "სესხები"),
                t("Utility bills", "კომუნალური"),
                t("Taxes", "გადასახადები"),
                t("Fines", "ჯარიმები"),
                t("More peace of mind", "მეტი სიმშვიდე"),
              ].map((label, i) => (
                <span className={i === 4 ? "strip-last georgian-accent" : ""} key={label}>
                  <Plus size={13} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <section className="problem-section section-padding" id="the-shift">
            <div className="container">
              <Reveal className="section-topline">
                <span className="eyebrow">
                  {t("THE SHIFT", "ცვლილება")}
                </span>
              </Reveal>
              <div className="problem-grid">
                <Reveal>
                  <h2>
                    {t("Life is full enough.", "ცხოვრება ისედაც სავსეა.")}
                    <br />
                    <span className="muted-text">
                      {t(
                        "Your finances shouldn’t add to it.",
                        "ფინანსებმა არ უნდა დაგამძიმოს.",
                      )}
                    </span>
                  </h2>
                </Reveal>
                <Reveal delay={0.1}>
                  <p className="section-description">
                    {t(
                      "A bill in one app. A loan in another. A deadline somewhere in your messages. Keeping up shouldn’t feel like a second job.",
                      "ქვითარი ერთ აპში. სესხი — მეორეში. გადახდის ვადა — სადღაც შეტყობინებებში. ყველაფრის გახსენება მეორე სამსახურს არ უნდა ჰგავდეს.",
                    )}
                    <br />
                    <br />
                    {t(
                      "We’re building Convert to bring it all into focus. One calm space for what you owe, when it’s due, and what comes next.",
                      "Convert-ს ვქმნით, რომ ყველაფერი გასაგები გახდეს. ერთი მშვიდი სივრცე თანხებისთვის, ვადებისთვის და შემდეგი ნაბიჯებისთვის.",
                    )}
                  </p>
                </Reveal>
              </div>
              <Reveal className="clarity-diagram">
                <ClarityNetwork />
              </Reveal>
            </div>
          </section>

          <section
            className="experience-section section-padding"
            id="experience"
          >
            <div className="container experience-grid">
              <div className="experience-copy">
                <Reveal>
                  <span className="eyebrow">
                    {t("MEET YOUR FINANCIAL CALM", "შენი ფინანსური სიმშვიდე")}
                  </span>
                  <h2>
                    {t("Your whole picture.", "სრული სურათი.")}
                    <br />
                    <em className="georgian-accent">{t("In your pocket.", "შენს ჯიბეში.")}</em>
                  </h2>
                  <p>
                    {t(
                      "Know where you stand. See what’s ahead. Make a plan that feels like yours.",
                      "იცოდე, სად ხარ. დაინახე, რა გელის. შექმენი გეგმა, რომელიც შენზეა მორგებული.",
                    )}
                  </p>
                </Reveal>
                <div
                  className="experience-tabs"
                  aria-label={t("Explore the app", "შეისწავლე აპლიკაცია")}
                >
                  {[
                    {
                      key: "overview",
                      icon: Layers3,
                      title: t("Everything, in focus", "ყველაფერი ნათლად"),
                      description: t(
                        "One view for all your obligations. No more mental math.",
                        "ყველა ვალდებულება ერთ ხედში. ნაკლები გონებრივი გამოთვლა.",
                      ),
                    },
                    {
                      key: "timeline",
                      icon: Bell,
                      title: t(
                        "A step ahead, always",
                        "ყოველთვის ერთი ნაბიჯით წინ",
                      ),
                      description: t(
                        "See upcoming deadlines before they become surprises.",
                        "დაინახე მოახლოებული ვადები მოულოდნელობამდე.",
                      ),
                    },
                    {
                      key: "plan",
                      icon: MoveUpRight,
                      title: t(
                        "A way forward, made yours",
                        "შენზე მორგებული გზა",
                      ),
                      description: t(
                        "Explore a repayment rhythm that works for your life.",
                        "იპოვე გადახდის რიტმი, რომელიც შენს ცხოვრებას ერგება.",
                      ),
                    },
                  ].map((item) => (
                    <button
                      className={`experience-tab ${tab === item.key ? "active" : ""}`}
                      key={item.key}
                      onClick={() => setTab(item.key as PreviewTab)}
                      aria-pressed={tab === item.key}
                    >
                      <span className="experience-tab-icon">
                        <item.icon size={21} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <p>{item.description}</p>
                      </span>
                      <ArrowUpRight size={18} />
                      {tab === item.key && (
                        <motion.span
                          className="experience-tab-indicator"
                          layoutId="experience-tab-indicator"
                          aria-hidden="true"
                          transition={{
                            duration: reduce ? 0 : 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="experience-phone-stage">
                <div className="preview-halo" />
                <PhonePreview tab={tab} onTabChange={setTab} />
                <div className="preview-footnote">
                  {t(
                    "An early look at what we’re building.",
                    "პირველი შეხედვა იმაზე, რასაც ვქმნით.",
                  )}
                  <br />
                  {t(
                    "Fictional amounts. No live connections or payments.",
                    "გამოგონილი თანხები. ცოცხალი კავშირებისა და გადახდების გარეშე.",
                  )}
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="features-section section-padding">
            <div className="container">
              <Reveal className="section-heading-row">
                <div>
                  <span className="eyebrow">
                    {t("THOUGHTFULLY CONNECTED", "გააზრებულად დაკავშირებული")}
                  </span>
                  <h2>
                    {t("Less to keep track of.", "ნაკლები გასახსენებელი.")}
                    <br />
                    <span className="muted-text">
                      {t(
                        "More to look forward to.",
                        "მეტი სასიამოვნო მოლოდინი.",
                      )}
                    </span>
                  </h2>
                </div>
                <p className="section-description narrow">
                  {t(
                    "Thoughtful tools for the everyday. Designed around your life, not the other way around.",
                    "გააზრებული ხელსაწყოები ყოველდღიურობისთვის. შექმნილია შენი ცხოვრების გარშემო.",
                  )}
                </p>
              </Reveal>
              <div className="feature-grid">
                <FeatureCard className="feature-card feature-wide">
                  <div className="feature-icon">
                    <Layers3 size={22} />
                  </div>
                  <h3>
                    {t("One home for it all.", "ერთი სახლი ყველაფრისთვის.")}
                  </h3>
                  <p>
                    {t(
                      "Loans, taxes, fines, and bills. A unified dashboard to see your obligations and balances at a glance.",
                      "სესხები, გადასახადები, ჯარიმები და ქვითრები. ვალდებულებები და ბალანსები ერთი შეხედვით.",
                    )}
                  </p>
                  <div className="mini-dashboard">
                    <div>
                      <span>
                        {t(
                          "Your financial overview",
                          "შენი ფინანსური მიმოხილვა",
                        )}
                      </span>
                    </div>
                    <div className="dashboard-bars">
                      {[
                        {
                          label: t("Loans", "სესხები"),
                          width: "86%",
                          amount: "₾4,200",
                          color: "emerald",
                        },
                        {
                          label: t("Taxes", "გადასახადები"),
                          width: "36%",
                          amount: "₾320",
                          color: "mint",
                        },
                        {
                          label: t("Bills", "ქვითრები"),
                          width: "18%",
                          amount: "₾68.50",
                          color: "lilac",
                        },
                      ].map((item, index) => (
                        <div key={item.amount}>
                          <span>{item.label}</span>
                          <div>
                            <i
                              className={item.color}
                              style={{
                                width: item.width,
                                animationDelay: `${index * 0.22}s`,
                              }}
                            />
                          </div>
                          <b>{item.amount}</b>
                        </div>
                      ))}
                    </div>
                  </div>
                </FeatureCard>
                <FeatureCard
                  className="feature-card feature-reminders"
                  delay={0.08}
                >
                  <div className="feature-icon">
                    <Bell size={22} />
                  </div>
                  <h3>
                    {t(
                      "A gentle nudge. Right on time.",
                      "მშვიდი შეხსენება. დროულად.",
                    )}
                  </h3>
                  <p>
                    {t(
                      "Smart reminders and clear deadlines, so you can think about the things that matter more.",
                      "ჭკვიანი შეხსენებები და ნათელი ვადები — მეტი დრო უფრო მნიშვნელოვანი საქმეებისთვის.",
                    )}
                  </p>
                  <NotificationStack />
                </FeatureCard>
                <FeatureCard className="feature-card feature-plan">
                  <div className="feature-icon">
                    <MoveUpRight size={22} />
                  </div>
                  <h3>
                    {t("Progress you can feel.", "პროგრესი, რომელსაც გრძნობ.")}
                  </h3>
                  <p>
                    {t(
                      "Build a repayment plan, explore timelines, and watch every small step add up.",
                      "შექმენი დაფარვის გეგმა, შეადარე ვადები და დაინახე ყოველი ნაბიჯის შედეგი.",
                    )}
                  </p>
                  <div
                    className="feature-chart"
                    aria-label={t(
                      "Illustrative balance decreasing over time",
                      "დროთა განმავლობაში ბალანსის შემცირების ილუსტრაცია",
                    )}
                  >
                    <svg viewBox="0 0 400 100">
                      <defs>
                        <linearGradient
                          id="chartFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop stopColor="var(--accent-strong)" stopOpacity=".2" />
                          <stop
                            offset="1"
                            stopColor="var(--accent-strong)"
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>
                      <path
                        className="repayment-area"
                        d="M0 10 C60 10 40 35 100 35 S145 50 200 60 S260 72 300 78 S350 88 400 95 V100 H0Z"
                        fill="url(#chartFill)"
                      />
                      <path
                        className="repayment-line"
                        pathLength="1"
                        d="M0 10 C60 10 40 35 100 35 S145 50 200 60 S260 72 300 78 S350 88 400 95"
                        fill="none"
                        stroke="var(--accent-strong)"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                </FeatureCard>
                <FeatureCard
                  className="feature-card feature-payments"
                  delay={0.08}
                >
                  <span className="planned-badge">
                    {t("ON OUR ROADMAP", "სამომავლო გეგმა")}
                  </span>
                  <div className="feature-icon">
                    <CreditCard size={22} />
                  </div>
                  <h3>
                    {t(
                      "From keeping track to taking care.",
                      "თვალყურის დევნიდან მოქმედებამდე.",
                    )}
                  </h3>
                  <p>
                    {t(
                      "Our ambition: pay supported obligations directly in Convert. Fewer app switches. One smoother experience.",
                      "ჩვენი მიზანია მხარდაჭერილი ვალდებულებების პირდაპირ Convert-ში გადახდა. ნაკლები აპი. უფრო მარტივი გამოცდილება.",
                    )}
                  </p>
                </FeatureCard>
              </div>
            </div>
          </section>

          <section id="how-it-works" className="how-section section-padding">
            <div className="container">
              <Reveal className="how-heading">
                <span className="eyebrow">
                  {t("A SIMPLER RHYTHM", "უფრო მარტივი რიტმი")}
                </span>
                <h2>
                  {t("Find your flow.", "იპოვე შენი რიტმი.")}
                  <br />
                  <em className="georgian-accent">{t("Three small steps.", "სამი პატარა ნაბიჯი.")}</em>
                </h2>
              </Reveal>
              <div className="steps-grid">
                {[
                  {
                    icon: Plus,
                    title: t("Bring it together", "მოაქციე ერთად"),
                    text: t(
                      "Add your obligations in one place.",
                      "დაამატე ვალდებულებები ერთ სივრცეში.",
                    ),
                  },
                  {
                    icon: Layers3,
                    title: t("See the bigger picture", "დაინახე სრული სურათი"),
                    text: t(
                      "Get a clear view of your balances, payment dates, and progress. Understand today. Feel ready for tomorrow.",
                      "მიიღე ბალანსების, გადახდის ვადებისა და პროგრესის ნათელი სურათი. გაიგე აწმყო და მოემზადე მომავლისთვის.",
                    ),
                  },
                  {
                    icon: ArrowUpRight,
                    title: t("Move forward, your way", "წინ, შენი გზით"),
                    text: t(
                      "Plan repayments, set reminders, and take the next step with confidence. A little more control, every day.",
                      "დაგეგმე გადახდები, დააყენე შეხსენებები და გადადგი შემდეგი ნაბიჯი თავდაჯერებით. მეტი კონტროლი ყოველდღე.",
                    ),
                  },
                ].map((step, i) => (
                  <Reveal className="step" key={i} delay={i * 0.08}>
                    <div className="step-top">
                      <span>0{i + 1}</span>
                      <step.icon size={24} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="about" className="trust-section section-padding">
            <div className="container trust-grid">
              <Reveal className="trust-visual">
                <FingerprintInteraction />
              </Reveal>
              <Reveal>
                <span className="eyebrow">
                  {t("BUILT AROUND YOU", "შენს გარშემო შექმნილი")}
                </span>
                <h2>
                  {t("Your peace of mind.", "შენი სიმშვიდე.")}
                  <br />
                  <span className="muted-text">
                    {t("Our starting point.", "ჩვენი საწყისი წერტილი.")}
                  </span>
                </h2>
                <p className="section-description">
                  {t(
                    "Money is personal. We believe the technology around it should be thoughtful, transparent, and entirely on your side.",
                    "ფინანსები პირადია. გვჯერა, რომ მათთან დაკავშირებული ტექნოლოგია უნდა იყოს გააზრებული, გამჭვირვალე და შენს მხარეს.",
                  )}
                </p>
                <div className="trust-principles">
                  {[
                    {
                      icon: LockKeyhole,
                      title: t(
                        "Privacy by intention",
                        "კონფიდენციალურობა მიზანმიმართულად",
                      ),
                      text: t(
                        "Collect only what’s needed. Explain why. Give you control.",
                        "მხოლოდ საჭირო მონაცემები. ნათელი მიზეზები. კონტროლი შენს ხელში.",
                      ),
                    },
                    {
                      icon: Check,
                      title: t("Your consent comes first", "ჯერ შენი თანხმობა"),
                    },
                  ].map((item) => (
                    <div key={item.title}>
                      <item.icon size={18} />
                      <div>
                        <h3>{item.title}</h3>
                        {"text" in item && <p>{item.text}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          <section className="faq-section">
            <div className="container faq-grid">
              <Reveal>
                <h2>
                  {t("Good questions.", "კარგი კითხვები.")}
                  <br />
                  <span className="muted-text">
                    {t("Straight answers.", "პირდაპირი პასუხები.")}
                  </span>
                </h2>
              </Reveal>
              <div className="faq-list">
                {[
                  {
                    q: t(
                      "Can I use Convert today?",
                      "შემიძლია Convert-ის გამოყენება დღეს?",
                    ),
                    a: t(
                      "Not just yet. We’re developing the app for iOS and Android. This website is an interactive concept, and we haven’t announced a launch date. Join the waitlist for updates when registration opens.",
                      "ჯერ არა. ვქმნით აპლიკაციას iOS-ისა და Android-ისთვის. ეს საიტი ინტერაქტიული კონცეფციაა და გამოშვების თარიღი ჯერ არ გამოგვიცხადებია. რეგისტრაციის გახსნისას შემოუერთდი სიას.",
                    ),
                  },
                  {
                    q: t(
                      "Will it connect to my bank or tax account?",
                      "დაუკავშირდება ჩემს ბანკს ან საგადასახადო ანგარიშს?",
                    ),
                    a: t(
                      "Connections to financial, utility, and government services are planned. No banking or government integration is live, and no partnership is implied. Availability will depend on supported services and your explicit consent.",
                      "ფინანსურ, კომუნალურ და სახელმწიფო სერვისებთან კავშირები დაგეგმილია. ამჟამად არცერთი საბანკო ან სახელმწიფო ინტეგრაცია არ მოქმედებს. ხელმისაწვდომობა დამოკიდებული იქნება მხარდაჭერილ სერვისებზე და შენს თანხმობაზე.",
                    ),
                  },
                  {
                    q: t(
                      "Can I make payments inside the app?",
                      "შევძლებ აპლიკაციიდან გადახდას?",
                    ),
                    a: t(
                      "Direct payments are a future ambition, not a current feature. The preview cannot move money or access real accounts. We’ll clearly communicate supported payment options before they become available.",
                      "პირდაპირი გადახდები სამომავლო მიზანია. დემო ვერ გადარიცხავს ფულს და ვერ შედის რეალურ ანგარიშებზე. მხარდაჭერილ გადახდის მეთოდებს ხელმისაწვდომობამდე მკაფიოდ განვმარტავთ.",
                    ),
                  },
                  {
                    q: t(
                      "Is Convert made for Georgia?",
                      "Convert საქართველოსთვის იქმნება?",
                    ),
                    a: t(
                      "Yes. We’re starting with everyday financial life in Georgia, with Georgian and English language support and balances in Georgian lari (₾). Details about availability and pricing will be shared closer to launch.",
                      "დიახ. ვიწყებთ საქართველოს ყოველდღიური ფინანსური საჭიროებებით, ქართული და ინგლისური ენებითა და ლარის (₾) მხარდაჭერით. ხელმისაწვდომობისა და ფასების შესახებ დეტალებს გამოშვებასთან ახლოს გაგიზიარებთ.",
                    ),
                  },
                ].map((item, i) => (
                  <div className="faq-item" key={i}>
                    <h3>
                      <button
                        onClick={() => setFaq(faq === i ? null : i)}
                        aria-expanded={faq === i}
                        aria-controls={`faq-answer-${i}`}
                      >
                        {item.q}
                        <Plus
                          className={faq === i ? "rotated" : ""}
                          size={19}
                        />
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {faq === i && (
                        <motion.div
                          id={`faq-answer-${i}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: reduce ? 0 : 0.25 }}
                        >
                          <p>{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="waitlist" className="waitlist-section">
            <div className="container waitlist-content">
              <Reveal>
                <h2>
                  {t("More clarity.", "მეტი სიცხადე.")}
                  <br />
                  <em className="georgian-accent">{t("More possibility.", "მეტი შესაძლებლობა.")}</em>
                </h2>
                <p>
                  {t(
                    "Be among the first to find a little more financial calm.",
                    "იყავი პირველი, ვინც მეტ ფინანსურ სიმშვიდეს იპოვის.",
                  )}
                  <br />
                  {t(
                    "Join the Convert waitlist.",
                    "შემოუერთდი Convert-ის მოლოდინის სიას.",
                  )}
                </p>
                <WaitlistForm language={language} openPrivacy={openPrivacy} />
              </Reveal>
            </div>
          </section>
        </main>

        <footer className="site-footer">
          <div className="container footer-top">
            <div>
              <Brand />
            </div>
            <div className="footer-links">
              <a href="#features">{t("Features", "შესაძლებლობები")}</a>
              <a href="#about">{t("Our vision", "ჩვენი ხედვა")}</a>
              <button onClick={openPrivacy}>
                {t("Privacy", "კონფიდენციალურობა")}
              </button>
              <a
                href="#home"
                className="back-to-top"
                aria-label={t("Back to top", "თავში დაბრუნება")}
              >
                <ArrowUpRight size={20} />
              </a>
            </div>
          </div>
          <div className="container footer-bottom">
            <span>
              © 2026 Convert.{" "}
              {t("All rights reserved.", "ყველა უფლება დაცულია.")}
            </span>
          </div>
        </footer>

        <dialog
          ref={privacyRef}
          className="privacy-dialog"
          onClick={(event) => {
            if (event.target === event.currentTarget)
              privacyRef.current?.close();
          }}
        >
          <div>
            <button
              className="dialog-close"
              onClick={() => privacyRef.current?.close()}
              aria-label={t("Close privacy notice", "წესების დახურვა")}
            >
              <X size={21} />
            </button>
            <span className="eyebrow">CONVERT</span>
            <h2>{t("Waitlist privacy", "სიის კონფიდენციალურობა")}</h2>
            <p>
              {t(
                "We store your email address, chosen language, consent, and signup time to send Convert launch and product updates. We don’t request financial or banking information.",
                "ვინახავთ ელფოსტას, არჩეულ ენას, თანხმობას და რეგისტრაციის დროს, რათა გაგიზიაროთ Convert-ის სიახლეები. არ ვითხოვთ ფინანსურ ან საბანკო ინფორმაციას.",
              )}
            </p>
            <p>
              {t(
                "Registration data is stored in Supabase and accessible to authorized operators and our hosting provider. When welcome emails are enabled, we share your email address with Resend to deliver your confirmation. We do not sell waitlist data.",
                "რეგისტრაციის მონაცემები ინახება Supabase-ში და ხელმისაწვდომია უფლებამოსილი ოპერატორებისა და ჰოსტინგის პროვაიდერისთვის. მისასალმებელი წერილების ჩართვისას თქვენს ელფოსტას Resend-ს ვუზიარებთ დასტურის გამოსაგზავნად. მონაცემებს არ ვყიდით.",
              )}
            </p>
            <p>
              {t(
                "You can request deletion by replying to any launch email. The interactive preview uses fictional data and never connects to your accounts.",
                "წაშლის მოთხოვნით უპასუხეთ ნებისმიერ საინფორმაციო წერილს. დემო იყენებს გამოგონილ მონაცემებს და არ უკავშირდება თქვენს ანგარიშებს.",
              )}
            </p>
            <p className="privacy-small">
              {t(
                "Language and theme preferences are saved in this browser. No advertising or analytics cookies are used by this page.",
                "ენისა და თემის არჩევანი ინახება ამ ბრაუზერში. გვერდი არ იყენებს სარეკლამო ან ანალიტიკურ ქუქი-ფაილებს.",
              )}
            </p>
            <button
              className="button button-dark"
              onClick={() => privacyRef.current?.close()}
            >
              {t("Got it", "გასაგებია")}
              <Check size={16} />
            </button>
          </div>
        </dialog>
      </div>
    </MotionConfig>
  );
}

let languageFallback: Language = "en";
function getLanguage(): Language {
  try {
    return localStorage.getItem("convert-language") === "ka" ? "ka" : "en";
  } catch {
    return languageFallback;
  }
}
function subscribeLanguage(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("convert-language", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("convert-language", callback);
  };
}
function setLanguage(value: Language) {
  languageFallback = value;
  try {
    localStorage.setItem("convert-language", value);
  } catch {}
  window.dispatchEvent(new Event("convert-language"));
}
export default function Home() {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguage,
    () => "en" as Language,
  );
  return (
    <LanguageContext.Provider value={language}>
      <Landing language={language} setLanguage={setLanguage} />
    </LanguageContext.Provider>
  );
}
