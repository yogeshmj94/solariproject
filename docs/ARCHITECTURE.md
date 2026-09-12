# Shipment Investigator architecture

## Product thesis

Lost and missorted shipment investigations are usually not blocked by a total absence of data. The evidence is fragmented across WMS events, sorter context, CCTV/VMS interfaces, exception handling and outbound operations.

Shipment Investigator is designed as an investigation layer across those systems. It starts with an AWB, narrows the physical/time search using operational data, retrieves the relevant visual evidence and returns the last verified shipment state with an auditable case record.

## Current hosted demo

The public demo at `https://solariproject.vercel.app` is intentionally split into public, authenticated and operational-simulation layers.

```text
Public browser
   │
   ├── /                         landing page
   ├── /privacy                  privacy policy
   ├── /signin                   Google OAuth
   └── /investigations           authenticated manager console
                                    │
                                    ▼
                         /api/shipments/investigate
                                    │
                                    ▼
                    runShipmentInvestigation(...)
                                    │
                                    ▼
                              Solari Browser
                         ┌──────────┴──────────┐
                         ▼                     ▼
                   /wms?waybill=...      /cctv?waybill=...
                  simulated WMS           simulated CCTV
                         └──────────┬──────────┘
                                    ▼
                         Investigation result
                                    │
                       ┌────────────┴────────────┐
                       ▼                         ▼
                Prisma / PostgreSQL          manager UI
              users / cases / feedback
```

### What Solari does in the demo

The investigation service launches a recorded Solari browser session and navigates the rendered mock operational interfaces. The WMS screen provides the last scan location, time, operator and camera hint. The CCTV screen provides the corresponding demo observation, camera, location, time, confidence and state.

The application maps those values into one of three result states:

- `AVAILABLE_INSIDE_FACILITY`
- `LEFT_FACILITY`
- `LAST_SEEN`

The Solari session ID is retained with the case for auditability.

### Authentication and persistence

Auth.js handles Google OAuth. On sign-in, the authenticated Google email is upserted into `DemoUser`. Investigation history and feedback are associated with that user.

The hosted demo uses PostgreSQL through Prisma. `DATABASE_URL` is the pooled runtime connection and `DIRECT_URL` is used for direct Prisma schema operations.

When no database is configured during local development, investigation/feedback persistence can fall back to `.runtime-data/` files.

### Feedback validation loop

The public prototype is a customer-development instrument as much as a technical demo.

```text
visitor
  ↓
Google sign-in
  ↓
investigation started
  ↓
investigation completed
  ↓
structured facility feedback
  ↓
pilot interest
```

The admin dashboard joins `ProductFeedback` to `DemoUser` so the authenticated Google identity can be reviewed without duplicating the email into each feedback record.

## Simulated vs production responsibilities

The current public demo proves orchestration, authentication, persistence, audit flow and product UX. It does not claim to run live parcel vision on real CCTV.

| Layer | Public demo | Real facility |
| --- | --- | --- |
| WMS | Mock web page | WMS API, DB, browser or desktop adapter |
| CCTV/VMS | Mock evidence page | VMS API/browser/desktop access |
| Visual matching | Predefined synthetic evidence | Dedicated parcel vision/tracking service |
| Sorter context | Mock / earlier demo | Sorter-management adapter |
| Intake | Web UI | Web, email, WhatsApp or facility workflow |
| Persistence | PostgreSQL | PostgreSQL with facility retention/access policy |
| Audit | Solari session ID + stored case | Full evidence/replay trail per facility policy |

## Intended facility architecture

```text
Manager request
     │
     ▼
Intake adapter
(web / email / WhatsApp)
     │
     ▼
Investigation orchestrator
     │
     ├───────────────┬────────────────┬────────────────┐
     ▼               ▼                ▼                ▼
 WMS adapter     Sorter adapter   CCTV/VMS adapter   Facility config
     │               │                │             / topology
     └───────────────┴────────┬───────┘
                              ▼
                      constrained search
                              │
                              ▼
                        Vision service
                 detect → associate → track
                              │
                              ▼
                       confidence state
               VERIFIED / TRACKING / LIKELY / LOST
                              │
                              ▼
                    evidence-backed finding
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                 manager            case store
                 response         + audit history
```

## Integration contracts

`src/integrations/contracts.ts` defines the facility boundary:

- `WmsAdapter` — find shipment scan events.
- `CctvAdapter` — retrieve relevant video windows from a scan.
- `SorterAdapter` — add line/chute/destination/route context.
- `IntakeAdapter` — convert an external manager request into an AWB investigation.
- `FacilityIntegration` — bundles facility-specific implementations.

The contracts are scaffolding today. The public mock orchestration has not yet been refactored to instantiate these adapters because the next useful implementation should be driven by a real facility's interfaces rather than another hypothetical connector.

## Visual investigation pipeline for a real pilot

A production visual pipeline should avoid open-ended CCTV search whenever operational evidence can narrow the problem.

```text
WMS scan
  ↓
known area + timestamp + camera mapping
  ↓
small CCTV time window
  ↓
parcel candidates
  ↓
label / OCR / appearance association
  ↓
high-confidence target lock
  ↓
track only across physically adjacent cameras
  ↓
verified location / outbound state / lost state
```

A parcel fingerprint can combine dimensions, color/texture, label geometry or OCR, tape, logos/markings and motion context. Camera topology should constrain possible transitions rather than allowing the tracker to jump arbitrarily across the facility.

## Truth and confidence model

The system must separate evidence from inference.

**Operational facts**
- WMS scan events
- sorter events
- operator/device IDs
- timestamps
- camera mappings
- loaded/outbound events

**Visual evidence**
- candidate frame
- camera/time
- match confidence
- transition evidence

**Inference**
- likely same parcel
- likely route
- likely last known location

**Final state**
- verified inside facility
- verified left facility
- last seen / unresolved

Uncertainty must be explicit. A safe implementation should degrade from `VERIFIED` to `TRACKING`, `LIKELY` and `LOST` rather than invent certainty.

## Audit trail

A real case should preserve:

- requester and AWB
- WMS/sorter evidence queried
- searched camera/time windows
- candidate detections and target-lock evidence
- cross-camera transitions
- screenshots or evidence frames
- confidence changes
- Solari session/replay identifiers where available
- final finding and timestamp

## Deployment target

The design goal is for one capable integration engineer to adapt the system to a facility in roughly **2–4 weeks**, assuming timely access to the WMS/VMS/sorter systems and usable CCTV footage. This is a pilot target, not a universal deployment guarantee.

The reusable core should remain stable; most facility work should live in adapters, mappings, credentials, camera topology and evidence-quality validation.

## Preserved earlier prototype

`/operations` and `/erp` preserve the earlier sort-center operational-blocker prototype. Gemini structures an operational update and Solari verifies facts in the mock SortOps interface. It remains in the repository as an example of the broader computer-use/evidence pattern, but Shipment Investigator is the current public product focus.
