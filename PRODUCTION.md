# Production readiness — Doctor Java LMS

## Required environment variables
See `.env.production.example`. Startup fails without `JWT_SECRET`, `ADMIN_PASSWORD`, `DB_PASSWORD`, and at least one payment provider when profile is not `local`/`dev`/`test`.

## Deploy checklist
1. Managed MySQL (RDS) — do **not** use docker-compose MySQL in production.
2. Set `SPRING_PROFILES_ACTIVE=prod`.
3. TLS terminator (nginx/Caddy/Cloudflare) with HSTS.
4. Backend: multi-stage `backend/Dockerfile`; health: `GET /actuator/health`.
5. Frontend: `npm run build` + static host / Node server; `NEXT_PUBLIC_API_BASE_URL` points at API.
6. Backups: daily full MySQL dump + binlog PITR; test restore quarterly.
7. Secrets: inject via orchestrator secrets, never bake into images.

## Auth model
- Browser: httpOnly `DJ_ACCESS_TOKEN` cookie + hybrid CSRF (`XSRF-TOKEN` / `X-XSRF-TOKEN`) when JWT is from cookie.
- API clients: `Authorization: Bearer` (CSRF not required).
- Rate limit: 10 POST/min/IP on `/api/auth/login` and `/register`.
- Lockout: 5 failed logins → 15 minutes.

## GDPR / DPDP basics
- Add Privacy Policy + Terms as interior pages (not home).
- Account delete: admin can `DELETE /api/users/{id}`; extend to self-service export/delete.
- Never log card numbers — use hosted Razorpay/Stripe checkout only.

## CI
GitHub Actions: backend tests, frontend build, gitleaks, advisory OWASP/npm audit.
