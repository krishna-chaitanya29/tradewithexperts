# Deployment Guide

This document covers production deployment for Trade With Experts.

## 1. Prerequisites

- GitHub repository with latest `main` branch
- Supabase project
- Vercel account (recommended)

## 2. Required Environment Variables

Set the following in your hosting provider (Vercel Project Settings -> Environment Variables):

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (preferred)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional fallback)
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAILS`

Optional:

- `NEXT_PUBLIC_UMAMI_WEBSITE_ID`
- `NEXT_PUBLIC_UMAMI_SCRIPT_URL`

Local development only (not required in production):

- `NEXT_ALLOWED_DEV_ORIGINS`

## 3. Supabase Setup

1. Open Supabase SQL Editor.
2. Run schema script:

```sql
-- paste contents of supabase/schema.sql
```

3. Confirm core tables exist (`profiles`, `trades`, `live_updates`, `site_settings`).

## 4. Deploy on Vercel

1. Open Vercel and import the GitHub repository.
2. Framework preset: `Next.js`.
3. Add all required environment variables.
4. Deploy.

## 5. Post-Deployment Checks

After deployment, validate:

- Home page loads
- Register and login flow works
- Admin routes are visible for admin account
- Health endpoint responds: `/health/supabase`
- Community links gate works (`/community/links`)

## 6. Redeploy Workflow

For future updates:

1. Commit locally.
2. Push to `main`.
3. Vercel auto-deploys.

## 7. Troubleshooting

- `Missing NEXT_PUBLIC_SUPABASE_URL...`: check env vars in Vercel.
- Registration fails with service role error: set `SUPABASE_SERVICE_ROLE_KEY`.
- Login/register appears stuck: hard refresh browser and check network + env vars.
