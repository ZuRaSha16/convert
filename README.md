# Convert

A bilingual, single-page concept landing site for a Georgian financial obligations app. Built with Next.js App Router, TypeScript, Tailwind CSS, Motion for React, and Lucide.

## Local development

```powershell
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run lint` and `npm run build` before deployment.

Run `npm run test:layout` after building to check both phone previews at 320, 375, 390, and 430px. The Playwright suite uses installed Google Chrome, covers English/Georgian, light/dark themes and tab transitions, and verifies the original desktop geometry. It starts a production server on port 3100; set `LAYOUT_BASE_URL` to use another local port.

## Features

- English and Georgian interface with a browser-saved language preference.
- Light and dark palettes with a header toggle. Starts from the system color scheme, remembers an explicit choice, and resolves the palette before the first paint.
- One continuous animated background across the full page, with restrained blue/emerald lighting, subtle pointer parallax, fine data paths, and reduced-motion support.
- Feature illustrations animate their balance bars, reminder, repayment curve, and roadmap details; each pauses offscreen and stays static with reduced motion enabled.
- A single fixed scene replaces individual section backdrops. Twenty subtle particles become eight on mobile; background motion pauses in hidden tabs and becomes static under reduced motion. Product mockups float independently and pause offscreen.
- Interactive fictional dashboard, obligation details, reminder toggle, payment timeline, and a repayment slider. Planner calculation: `ceil(4200 / monthlyPayment)`, excluding interest and fees.
- Accessible navigation, native privacy dialog, FAQ accordion, mobile navigation, and validated waitlist form.
- No live account access, bank/government partnerships, or payments are implied. All financial values are fictional.

## Enable real waitlist registration

1. Create a Supabase project you control.
2. Run `supabase/waitlist.sql` in its SQL editor.
3. Copy `.env.example` to `.env.local` and configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or configure those secrets in your deployment host).
4. Restart Next.js.

The route writes directly to the `waitlist` table through Supabase REST. It validates email, consent, origin, payload size, language, and a honeypot field. A unique email constraint prevents duplicate rows. Repeat submissions return `alreadyRegistered: true` so the site can show an English or Georgian already-registered notice. Anonymous and authenticated browser roles have no access to the table. Service-role credentials remain server-side.

When unconfigured, the endpoint returns HTTP 503 and the form explicitly says that the address was not saved. It never simulates successful signup. Storage failures are surfaced as errors. Apply host-level rate limits/bot protection before public collection. Review the privacy notice and retention policy with the product owner before launch.

## Welcome emails

New signups can receive a branded English or Georgian confirmation via Resend, matching their selected language. Duplicate signups do not trigger email. No database migration is required; the insert returns only the new row ID to distinguish a new signup from a duplicate.

1. Create a Resend account, add a domain you own, and verify its DNS records. Your website can stay on Vercel's shared domain, but email must use a sender domain you control.
2. Create a Resend API key with sending permission.
3. In Vercel's Production environment, add `RESEND_API_KEY` (Secret) and `WAITLIST_EMAIL_FROM` (for example, `Convert <hello@your-owned-domain.com>`). Set `SITE_URL` to your public HTTPS website URL. Optionally set `WAITLIST_EMAIL_REPLY_TO` to a monitored inbox; otherwise monitor the From address for replies.
4. Deploy this code and the environment settings. Test with a new email address; already registered addresses do not receive a welcome email.

No API key means welcome emails are disabled and collection continues normally. Delivery is attempted after the database accepts a new signup, with an 8-second timeout and a Resend idempotency key based on the signup ID. Delivery failures are logged with no recipient or secret data, and signup still succeeds. There is no automatic retry queue or retroactive sending to existing subscribers. Resend accepting a message does not guarantee inbox delivery; check its dashboard for delivery status. Configure unsubscribe/deletion handling before sending future launch campaigns.

Run `node scripts/preview-welcome-email.mjs` to generate local HTML and PNG previews at desktop and mobile widths in `artifacts/welcome-email/`. The PNG logo is served from `SITE_URL/icon.png`; email clients may hide remote images until allowed. The wordmark and text remain readable.

## Structure

- `app/page.tsx`: complete single-page narrative and section interactions.
- `components/phone-preview.tsx`: reusable interactive app concept.
- `components/waitlist-form.tsx`: accessible waitlist submission UI.
- `components/language.tsx`: shared bilingual copy helper.
- `app/api/waitlist/route.ts`: server-only database adapter.
- `app/globals.css`: responsive visual system alongside Tailwind utilities.

The site stays within the existing Next.js project. No hosting service has been registered or deployed.
