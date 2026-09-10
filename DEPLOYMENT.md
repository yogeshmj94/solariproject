# Hosted demo deployment

The public demo is intentionally split into two layers:

- Public landing page at `/`
- Google-authenticated shipment recovery demo at `/investigations`

The demo uses simulated WMS/CCTV data, but the investigation workflow, Solari browser session, user accounts, case history and feedback collection are real application flows.

## 1. Install and prepare the database

```bash
npm install
npm run db:generate
npm run db:push
```

Use a managed PostgreSQL database for hosted deployments. `DATABASE_URL` is required for persistent users, investigation history and feedback. When it is absent during local development, investigations and feedback fall back to `.runtime-data/` files.

## 2. Configure Google OAuth

Create a Google OAuth web application in Google Cloud Console.

Add these authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://YOUR_DEMO_DOMAIN/api/auth/callback/google
```

Set:

```text
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_SECRET=...
```

Generate a strong `AUTH_SECRET` and keep all values server-side.

## 3. Configure Solari and Gemini

```text
SOLARI_API_KEY=...
APP_BASE_URL=https://YOUR_DEMO_DOMAIN
GEMINI_API_KEY=...
```

`APP_BASE_URL` must point to the same public deployment because Solari navigates the mock WMS/CCTV interfaces through that URL.

## 4. Deploy

The app is a normal Next.js Node application and can be hosted on Vercel, Railway, Render, a VM or another Node-compatible host. The deployment must allow outbound HTTPS calls to Solari and Google OAuth.

After deployment, verify:

1. `/` loads without authentication.
2. `/investigations` redirects to `/signin`.
3. Google sign-in returns to `/investigations`.
4. AWB `771238945` returns the inside-facility result.
5. AWB `771238946` returns the outbound result.
6. Refreshing the page preserves the signed-in user's case history.
7. Feedback submits successfully.
8. `/operations` still runs the broader sort-center blocker prototype.

# Facility adaptation target

The repository exposes integration contracts in `src/integrations/contracts.ts` for WMS, CCTV/VMS, sortation context and request intake. A real facility deployment should replace the mock data sources behind those contracts rather than rewrite the investigation UI or evidence model.

A typical 2–4 week pilot integration, assuming credentials and usable CCTV are available, would look like this:

## Week 1 — system access and mapping

- Confirm WMS access and identify scan/event fields.
- Confirm VMS/CCTV access method and camera naming.
- Export or map facility zones and camera topology.
- Confirm sorter-management system access.
- Confirm manager intake channel, initially email or web form.

## Week 2 — adapters

- Implement the facility WMS adapter.
- Implement CCTV/VMS video-window retrieval.
- Implement sortation context adapter when required.
- Configure camera and physical-zone mappings.
- Connect the intake adapter.

## Week 3 — evidence validation

- Validate WMS-to-camera time/area narrowing.
- Tune parcel detection and visual matching on facility footage.
- Validate cross-camera transitions where needed.
- Define confidence thresholds and safe failure states.

## Week 4 — pilot hardening

- Test known historical cases.
- Add access controls and facility-specific audit requirements.
- Train managers on the investigation console.
- Run a limited live pilot and measure investigation time saved and recovery rate.

The one-engineer/month target is a deployment target, not a guarantee. It assumes the facility provides timely access to its systems and the CCTV footage is of sufficient quality for the requested tracking task.
