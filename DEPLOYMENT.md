# Hosted demo deployment

Production demo: **https://solariproject.vercel.app**

The hosted prototype has three public-facing layers:

- `/` — public Shipment Investigator landing page.
- `/privacy` — public privacy policy.
- `/signin` and `/investigations` — Google-authenticated demo flow.

The demo uses simulated WMS/CCTV evidence while the Solari browser session, authentication, database persistence, case history and feedback workflow are real application flows.

## 1. Environment variables

Use the values in `.env.example` as the canonical list:

```text
APP_BASE_URL
SOLARI_API_KEY
GEMINI_API_KEY
AUTH_GOOGLE_ID
AUTH_GOOGLE_SECRET
AUTH_SECRET
AUTH_URL
AUTH_TRUST_HOST
ADMIN_EMAIL
DATABASE_URL
DIRECT_URL
```

For production:

```text
APP_BASE_URL=https://solariproject.vercel.app
AUTH_URL=https://solariproject.vercel.app
AUTH_TRUST_HOST=true
```

Do not commit real secrets or `.env.local`.

After changing environment variables in Vercel, redeploy so the new values are available to the running deployment.

## 2. PostgreSQL / Neon

The hosted demo uses PostgreSQL for users, investigation cases and feedback.

- `DATABASE_URL` — pooled runtime connection.
- `DIRECT_URL` — direct connection used by Prisma schema operations.

Install and prepare the schema:

```bash
npm install
npm run db:generate
npm run db:push
```

Prisma CLI does not automatically load `.env.local`. For local/Codespaces schema operations, export the variables first when necessary:

```bash
set -a
source .env.local
set +a
npm run db:push
```

When `DATABASE_URL` is absent during local development, investigation and feedback persistence can fall back to `.runtime-data/` files.

## 3. Google OAuth / Auth.js

Create a Google OAuth **Web application** client.

For the production Vercel deployment configure:

```text
Authorized JavaScript origin:
https://solariproject.vercel.app

Authorized redirect URI:
https://solariproject.vercel.app/api/auth/callback/google
```

Set the corresponding Vercel environment variables:

```text
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_SECRET=...
AUTH_URL=https://solariproject.vercel.app
AUTH_TRUST_HOST=true
```

Generate a strong `AUTH_SECRET`. Keep the Google client secret and Auth.js secret server-side.

If Google reports `redirect_uri_mismatch`, compare the exact `redirect_uri` shown on the Google error page with the URI registered on the same OAuth client ID. OAuth changes can also take time to propagate.

## 4. Solari and Gemini

```text
SOLARI_API_KEY=...
APP_BASE_URL=https://solariproject.vercel.app
GEMINI_API_KEY=...
```

`APP_BASE_URL` must be publicly reachable because Solari opens the mock `/wms`, `/cctv` and preserved `/erp` interfaces through the deployed URL.

Gemini is used by the earlier `/operations` blocker prototype, not by the core shipment investigation demo.

## 5. Vercel deployment

The project is a Next.js application deployed from GitHub to Vercel. Neon remains the PostgreSQL backend; Solari remains the browser-computer-use layer.

Recommended production sequence:

1. Merge validated changes to the Vercel production branch.
2. Confirm all production environment variables are present.
3. Let Vercel build/deploy the commit.
4. Check the stable project alias rather than a one-off deployment URL.
5. Re-run the verification checklist below.

The stable production alias is:

```text
https://solariproject.vercel.app
```

Use that stable URL for `AUTH_URL`, `APP_BASE_URL`, the Google OAuth origin and callback.

## 6. Production verification

Before sharing the demo publicly, verify in a fresh/incognito browser:

1. `https://solariproject.vercel.app/` loads without authentication.
2. `/privacy` loads without authentication.
3. `/investigations` redirects to `/signin` when signed out.
4. Google sign-in returns successfully to `/investigations`.
5. AWB `771238945` returns `AVAILABLE_INSIDE_FACILITY` / Exception Cage E2.
6. AWB `771238946` returns `LEFT_FACILITY` / Outbound Dock 21.
7. Refreshing the page preserves the signed-in user's case history.
8. Structured feedback submits successfully.
9. `/admin/feedback` shows the feedback for the configured `ADMIN_EMAIL` account.
10. The primary flow works on mobile.

The current production deployment has passed the authentication, both-AWB, persistence, feedback and admin-dashboard flow checks.

## 7. Admin dashboard

`/admin/feedback` requires authentication and also checks the signed-in email against `ADMIN_EMAIL`.

Feedback stores the authenticated user's identity relationally through `DemoUser`; the optional `workEmail` field is separate and is only populated when the user enters a work email.

## 8. Public demo disclosure

The landing page, sign-in screen and investigation console should continue to make it clear that the public WMS and CCTV evidence are simulated.

Do not describe the public prototype as performing live facility computer vision. The production architecture anticipates a separate real-footage vision service, but that is not implemented in the public demo.

## Facility adaptation target

The repository exposes integration contracts in `src/integrations/contracts.ts` for WMS, CCTV/VMS, sortation context and request intake.

A typical pilot target, assuming credentials and usable CCTV are available, is:

### Week 1 — system access and mapping

- Confirm WMS access and identify scan/event fields.
- Confirm VMS/CCTV access method and camera naming.
- Map facility zones and camera topology.
- Confirm sorter-management system access.
- Confirm manager intake channel.

### Week 2 — adapters

- Implement the facility WMS adapter.
- Implement CCTV/VMS video-window retrieval.
- Implement sortation context when needed.
- Configure camera/physical-zone mappings.
- Connect the intake adapter.

### Week 3 — evidence validation

- Validate WMS-to-camera time/area narrowing.
- Tune parcel detection/matching on facility footage.
- Validate cross-camera transitions where needed.
- Define confidence thresholds and safe failure states.

### Week 4 — pilot hardening

- Test historical known cases.
- Add facility-specific retention/access controls.
- Train managers on the investigation console.
- Run a limited live pilot and measure investigation time saved and recovery rate.

The one-engineer/month idea is a deployment target, not a guarantee. It depends heavily on system access, integration constraints and CCTV quality.
