# Release Checklist

Use this checklist for every production release.

## 1. Before You Start

- Confirm local branch is up to date with main.
- Confirm required environment variables are present in hosting.
- Confirm Supabase schema changes (if any) are documented and ready.

## 2. Local Validation

- Run install if dependencies changed:

```bash
npm install
```

- Run lint:

```bash
npm run lint
```

- Run production build:

```bash
npm run build
```

- Validate critical routes locally:
  - /
  - /login
  - /register
  - /community
  - /admin (admin account)
  - /live

## 3. Data and Auth Checks

- Verify Supabase connectivity from /health/supabase.
- Verify register flow works.
- Verify login flow works.
- Verify profile sync succeeds after login/register.
- Verify admin account access and admin-only pages.

## 4. Push and Deploy

- Commit with clear message.
- Push to main.
- Confirm deployment starts in hosting provider.

## 5. Post-Deploy Smoke Tests

- Open production home page.
- Check auth flows in production.
- Check community link gating.
- Check admin settings save/update behavior.
- Check live updates and daily proof pages.
- Verify logo and navbar rendering.

## 6. Monitoring

- Check hosting build logs for warnings/errors.
- Check runtime logs for API failures.
- Check analytics script loading (if enabled).

## 7. Rollback Plan

If release is unstable:

- Revert last commit on main.
- Push revert commit.
- Confirm rollback deployment is healthy.

## 8. Hotfix Rules

- Keep hotfix scope minimal.
- Add tests or validation steps for the exact issue.
- Update this checklist or deployment docs if a new failure pattern appears.
