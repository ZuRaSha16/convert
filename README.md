# Convert

A bilingual, single-page concept landing site for a Georgian financial obligations app. Built with Next.js App Router, TypeScript, Tailwind CSS, Motion for React, and Lucide.

## Local development

```powershell
npm install
npm run dev
```

Open http://localhost:3000. Run `npm run lint` and `npm run build` before deployment.

## Features

- English and Georgian interface with a browser-saved language preference.
- Light and dark palettes with a header toggle. Starts from the system color scheme, remembers an explicit choice, and resolves the palette before the first paint.
- Animated SVG financial paths, pointer-responsive hero lighting, scroll-linked phone scaling, entrance sequences, and reduced-motion support.
- Feature illustrations animate their balance bars, reminder, repayment curve, and roadmap details; each pauses offscreen and stays static with reduced motion enabled.
- Floating emerald particles, drifting blue/emerald light fields, and flowing data paths animate seven section backgrounds. Hero mockups and rings float independently of scroll movement. Backgrounds pause offscreen or in hidden tabs, use fewer particles on mobile, and become static under reduced motion.
- Interactive fictional dashboard, obligation details, reminder toggle, payment timeline, and a repayment slider. Planner calculation: `ceil(4200 / monthlyPayment)`, excluding interest and fees.
- Accessible navigation, native privacy dialog, FAQ accordion, mobile navigation, and validated waitlist form.
- No live account access, bank/government partnerships, or payments are implied. All financial values are fictional.

## Enable real waitlist registration

1. Create a Supabase project you control.
2. Run `supabase/waitlist.sql` in its SQL editor.
3. Copy `.env.example` to `.env.local` and configure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or configure those secrets in your deployment host).
4. Restart Next.js.

The route writes directly to the `waitlist` table through Supabase REST. It validates email, consent, origin, payload size, language, and a honeypot field. A unique email constraint makes repeat submissions idempotent without exposing whether an address was already registered. Anonymous and authenticated browser roles have no access to the table. Service-role credentials remain server-side.

When unconfigured, the endpoint returns HTTP 503 and the form explicitly says that the address was not saved. It never simulates successful signup. Storage failures are surfaced as errors. This project does not send emails. Configure an email provider and actual unsubscribe/deletion handling before sending launch emails; the privacy notice describes those obligations. Apply host-level rate limits/bot protection before public collection. Review the privacy notice and retention policy with the product owner before launch.

## Structure

- `app/page.tsx`: complete single-page narrative and section interactions.
- `components/phone-preview.tsx`: reusable interactive app concept.
- `components/waitlist-form.tsx`: accessible waitlist submission UI.
- `components/language.tsx`: shared bilingual copy helper.
- `app/api/waitlist/route.ts`: server-only database adapter.
- `app/globals.css`: responsive visual system alongside Tailwind utilities.

The site stays within the existing Next.js project. No hosting service has been registered or deployed.
