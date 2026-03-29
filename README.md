# Trade With Experts

Premium NIFTY50 trading proof and community website built with Next.js App Router, Tailwind CSS, Supabase, Framer Motion, SWR, and Recharts.

## Features

- Homepage with animated hero, rolling notice bar, and live stats counters
- Daily proof page with month filters and transparent win/loss cards
- Monthly summary view with cumulative P&L charts
- Community CTA flow with auth-gated link reveal
- Email/password auth using Supabase Auth
- Admin panel for site settings, trade entries, monthly notes, and live desk
- Live Trade Room (`/live`) with daily analysis, live states, and reaction messages
- Umami event tracking helpers
- `robots.txt` and `sitemap.xml` generated from metadata routes

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create environment variables from template:

```bash
cp .env.example .env.local
```

3. Fill `.env.local`:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`
- `NEXT_PUBLIC_UMAMI_WEBSITE_ID` (optional)
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL` (optional)
- `NEXT_ALLOWED_DEV_ORIGINS` (optional, local dev only)

4. In Supabase SQL editor, run:

- `supabase/schema.sql`

5. Run dev server:

```bash
npm run dev
```

6. Lint check:

```bash
npm run lint
```

## Key Routes

- `/` homepage
- `/proof/daily` day-wise trade proofs
- `/proof/monthly` monthly chart summaries
- `/community` community benefits + CTA
- `/community/links` gated Telegram/WhatsApp links
- `/live` live trade room
- `/login`, `/register` auth
- `/admin`, `/admin/settings`, `/admin/trades`, `/admin/live-desk` admin controls

## Notes

- The app includes fallback demo data when Supabase queries fail, so UI can still render locally.
- Admin write actions use the service-role key and server actions.
- Signed URL upload flow for private storage can be added on top of current `screenshot_url` field wiring.

## Deployment

For full production deployment instructions, use [DEPLOYMENT.md](DEPLOYMENT.md).

Quick path (Vercel):

1. Import this repo in Vercel.
2. Add required environment variables from `.env.example`.
3. Ensure Supabase schema is applied using `supabase/schema.sql`.
4. Deploy and verify `/health/supabase`.
