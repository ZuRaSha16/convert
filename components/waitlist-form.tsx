"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { useCopy } from "./language";

export function WaitlistForm({
  language,
  openPrivacy,
}: {
  language: "en" | "ka";
  openPrivacy: () => void;
}) {
  const t = useCopy();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    const data = new FormData(event.currentTarget);
    setState("loading");
    setMessage("");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.get("email"),
          consent: data.get("consent") === "on",
          website: data.get("website"),
          language,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.code || "failed");
      setState("success");
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error && error.message === "not_configured"
          ? t(
              "Registration isn’t open just yet. Your email has not been saved. Please check back soon.",
              "რეგისტრაცია ჯერ არ გახსნილა. თქვენი ელფოსტა არ შენახულა. გთხოვთ, მოგვიანებით დაბრუნდეთ.",
            )
          : t(
              "We couldn’t save your registration. Please check your email address and try again.",
              "რეგისტრაცია ვერ შევინახეთ. გადაამოწმეთ ელფოსტა და სცადეთ ხელახლა.",
            ),
      );
    }
  }
  if (state === "success")
    return (
      <div className="waitlist-success" role="status">
        <span>
          <Check size={25} />
        </span>
        <h3>{t("You’re on the list.", "თქვენ სიაში ხართ.")}</h3>
        <p>
          {t(
            "We’ll email you when there’s something worth sharing. Thank you for being here from the beginning.",
            "მოგწერთ, როცა სიახლეები გვექნება. მადლობა, რომ თავიდანვე ჩვენთან ხართ.",
          )}
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} className="waitlist-form">
      <label className="sr-only" htmlFor="waitlist-email">
        {t("Email address", "ელფოსტა")}
      </label>
      <div className="email-field">
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={t("Your email address", "თქვენი ელფოსტა")}
          required
          maxLength={254}
          aria-describedby={state === "error" ? "waitlist-message" : undefined}
        />
        <button type="submit" disabled={state === "loading"}>
          {state === "loading" ? (
            <LoaderCircle size={20} className="spin" />
          ) : (
            <>
              {t("Get early access", "ადრეული წვდომა")}
              <ArrowUpRight size={19} />
            </>
          )}
        </button>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          {t(
            "I agree to receive launch updates and the ",
            "ვეთანხმები სიახლეების მიღებას და ",
          )}
          <button type="button" onClick={openPrivacy}>
            {t("privacy notice", "კონფიდენციალურობის წესებს")}
          </button>
          .
        </span>
      </label>
      {state === "error" && (
        <p id="waitlist-message" className="form-message" role="alert">
          {message}
        </p>
      )}
      <p className="form-footnote">
        {t(
          "Only meaningful updates. Unsubscribe whenever you like.",
          "მხოლოდ მნიშვნელოვანი სიახლეები. გამოწერის გაუქმება ნებისმიერ დროს.",
        )}
      </p>
    </form>
  );
}
