# Shipment Investigator

**Find a lost or missorted shipment without manually searching hours of CCTV.**

Shipment Investigator is a demonstrable sort-center investigation prototype. Give it a waybill/AWB and it reconstructs the evidence chain from the last WMS scan to the relevant CCTV view, then returns the shipment's last verified location and status.

**Live demo:** https://solariproject.vercel.app

> **Demo disclosure:** the public prototype uses simulated WMS, sort-center and CCTV data. Google sign-in, case persistence, Solari browser sessions, investigation history and feedback collection are real application flows. The prototype does **not** claim that the public demo is running computer vision against live facility CCTV.

## Why this exists

When a shipment goes missing inside a sort center, the evidence often already exists but is fragmented across WMS scans, sorter systems, CCTV/VMS interfaces, exception handling and outbound operations. A manager may have to move between those systems manually and search footage around multiple timestamps.

Shipment Investigator tests a narrower idea:

> Start with an AWB, use operational events to constrain the physical search, collect the relevant visual evidence, and return the last verified location with an auditable case history.

## Public demo flow

```text
Manager enters AWB
        ↓
Google-authenticated investigation request
        ↓
Solari opens the mock WMS
        ↓
Last scan → area / time / operator / camera hint
        ↓
Solari opens the relevant mock CCTV view
        ↓
Evidence-backed finding
        ↓
Case stored in PostgreSQL
        ↓
User can submit facility / pilot feedback
```

Two demo shipments are available:

- `771238945` → shipment is found **inside the facility** at Exception Cage E2.
- `771238946` → shipment is verified as **loaded / left the facility** at Outbound Dock 21.

## What the hosted prototype includes

- Public Product Hunt-style landing page.
- Google OAuth sign-in with Auth.js.
- Authenticated shipment investigation console.
- Solari Browser orchestration across mock WMS and CCTV interfaces.
- Evidence-backed statuses: `AVAILABLE_INSIDE_FACILITY`, `LEFT_FACILITY`, and `LAST_SEEN`.
- Visual evidence card with camera, timestamp, location and confidence.
- Per-user investigation history.
- PostgreSQL persistence through Prisma and Neon.
- Structured facility deployment feedback.
- Admin-only feedback dashboard at `/admin/feedback`.
- Facility integration contracts for WMS, CCTV/VMS, sorter context and request intake.
- Earlier sort-center operations / blocker prototype preserved at `/operations`.

## Current architecture

```text
Public browser
   │
   ├── /                         public landing page
   ├── /signin                   Google OAuth
   └── /investigations           authenticated manager console
                                    │
                                    ▼
                         /api/shipments/investigate
                                    │
                                    ▼
                       shipment investigation service
                                    │
                                    ▼
                              Solari Browser
                           ┌────────┴────────┐
                           ▼                 ▼
                       mock WMS          mock CCTV
                           └────────┬────────┘
                                    ▼
                          evidence-backed result
                                    │
                          ┌─────────┴─────────┐
                          ▼                   ▼
                    Neon/PostgreSQL       manager UI
                 cases / users / feedback
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the current demo and intended facility architecture.

## Real facility adaptation

The intended production design keeps the investigation core stable and replaces facility-specific integrations around it:

- **WMS adapter** — shipment scans, timestamps, locations, operators and event types.
- **CCTV/VMS adapter** — camera/time-window retrieval or browser/desktop navigation.
- **Sorter adapter** — chute, line, destination and route context.
- **Intake adapter** — web, email, WhatsApp or another manager request channel.
- **Vision service** — parcel detection/matching and cross-camera tracking when real footage is introduced.
- **Facility topology** — physical adjacency between areas and cameras to constrain tracking.

The adapter interfaces are scaffolded in `src/integrations/contracts.ts`. The public mock flow currently navigates the demo WMS/CCTV pages directly; the real-adapter refactor is intentionally deferred until a facility pilot is available.

A pilot target of roughly **2–4 weeks for one capable integration engineer** is a goal, not a guarantee. It assumes timely credentials/system access and CCTV quality suitable for the requested investigation task.

## Truth and confidence boundaries

A production investigation system should not turn an uncertain visual match into a definitive operational fact. The intended confidence progression is:

```text
VERIFIED → TRACKING → LIKELY → LOST
```

Every case should preserve the evidence chain: request, operational events, searched camera/time windows, detections, transitions, screenshots, confidence history and final finding.

## What's real vs simulated in the public demo

| Component | Public demo |
| --- | --- |
| Google sign-in | Real |
| Authenticated user identity | Real |
| PostgreSQL persistence | Real |
| Investigation history | Real |
| Feedback + admin dashboard | Real |
| Solari browser navigation | Real |
| Solari session ID | Real |
| WMS records | Simulated |
| CCTV screens / evidence images | Simulated |
| Live parcel computer vision | Not implemented in the public demo |
| Real facility connectors | Adapter contracts only |

## Stack

- Next.js + TypeScript
- Auth.js / Google OAuth
- Prisma 6.19 + PostgreSQL / Neon
- Solari Cloud Browser
- Gemini for the preserved `/operations` prototype
- Vercel for the hosted demo

## Useful routes

- `/` — public Shipment Investigator landing page
- `/signin` — Google sign-in
- `/investigations` — authenticated shipment investigation console
- `/admin/feedback` — configured-admin feedback dashboard
- `/privacy` — public privacy policy
- `/wms` — simulated sort-center WMS screen used by the demo
- `/cctv` — simulated CCTV evidence screen used by the demo
- `/operations` — earlier sort-center blocker / management prototype
- `/erp` — mock legacy SortOps interface used by `/operations`

## Run locally / in Codespaces

Requirements: Node.js 20+ and a PostgreSQL database for persistent hosted behavior.

```bash
cp .env.example .env.local
npm install
npm run db:generate
npm run db:push
npm run dev
```

For Codespaces, expose port 3000 publicly and set `APP_BASE_URL` to the public forwarded URL because the Solari browser must be able to reach the mock operational screens.

Required environment variables are documented in `.env.example`:

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

Never commit `.env.local` or production secrets.

### Google OAuth

For a hosted environment, configure the same public host as the JavaScript origin and use this callback form:

```text
https://YOUR_HOST/api/auth/callback/google
```

For the current production deployment that is:

```text
Origin:   https://solariproject.vercel.app
Callback: https://solariproject.vercel.app/api/auth/callback/google
```

### Database

Use `DATABASE_URL` for the application's pooled PostgreSQL connection and `DIRECT_URL` for Prisma schema operations.

Prisma CLI does not automatically load `.env.local`; when running schema commands locally, export the variables into the shell first if needed.

## Deployment

The current production demo is hosted on Vercel at https://solariproject.vercel.app with Neon PostgreSQL.

See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment, OAuth and production verification steps.

## Production verification checklist

Before a public launch, confirm:

1. `/` loads publicly.
2. Incognito `/investigations` redirects to `/signin`.
3. Google sign-in returns to `/investigations`.
4. AWB `771238945` completes with the inside-facility result.
5. AWB `771238946` completes with the outbound result.
6. Case history survives refresh/sign-in.
7. Feedback submission persists.
8. `/admin/feedback` shows the submission for the configured admin.
9. `/privacy` is public.
10. The flow is usable on mobile.

These production checks have been completed for the current Vercel demo.

## Privacy and security

The hosted demo stores the Google account information made available by the OAuth flow (such as email, name and profile image), investigation case history and feedback. The shipment scenarios and CCTV evidence in the public demo are synthetic.

Secrets are configured only through deployment/local environment variables and are ignored by Git. See the public [privacy policy](https://solariproject.vercel.app/privacy).

## Project status

The demonstrable prototype is complete enough for public problem validation. The next milestone is not additional mock functionality; it is feedback from sort-center, warehouse, logistics technology, WMS/VMS and loss-prevention operators, followed by a real facility pilot if the problem and deployment model validate.
