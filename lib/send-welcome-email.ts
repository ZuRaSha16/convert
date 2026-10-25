import { buildWelcomeEmail } from "./welcome-email";

// Called only after a new signup is saved. Delivery errors cannot undo signup.
export async function sendWelcomeEmail(email: string, language: "en" | "ka", signupId: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.WAITLIST_EMAIL_FROM;
  const siteUrl = process.env.SITE_URL;
  if (!apiKey) return; // Collection works before welcome emails are enabled.

  try {
    if (!from || !siteUrl) {
      console.error("Waitlist welcome email configuration incomplete");
      return;
    }
    const content = buildWelcomeEmail(language, siteUrl);
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `waitlist-welcome/${signupId}`,
      },
      body: JSON.stringify({
        from,
        to: [email],
        ...(process.env.WAITLIST_EMAIL_REPLY_TO ? { reply_to: process.env.WAITLIST_EMAIL_REPLY_TO } : {}),
        ...content,
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    // Never log recipients, credentials, or provider response bodies.
    if (!response.ok) console.error("Waitlist welcome email failed", { status: response.status });
  } catch {
    console.error("Waitlist welcome email unavailable");
  }
}
