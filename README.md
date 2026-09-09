# ExecutionOS

ExecutionOS is an AI-native execution layer for operations-heavy companies.

It connects frontline reality to management expectations by turning natural-language operational updates into structured context, independently verifying facts inside legacy systems with Solari, and propagating the resulting risk through the organization.

## Demo in one sentence

An operator reports that Machine 4 stopped and Order 1421 may lose 60 units; Gemini structures the report, Solari opens a mock legacy ERP and verifies the order status, maintenance ticket, and replacement-part inventory, and ExecutionOS shows why the company objective is now at risk.

## Why this exists

Operations teams often have the data they need, but it is fragmented across ERP screens, maintenance systems, inventory tools, spreadsheets, emails, shift notes, and employee conversations.

Management therefore receives status updates without a reliable chain back to operational evidence.

ExecutionOS is designed as the layer between **management expectations** and **operational reality**.

## Working flow

```text
Frontline employee update
        ↓
Gemini reasoning
        ↓
Structured blocker context
        ↓
Solari Cloud Browser
        ↓
Legacy ERP evidence
        ↓
Verified facts
        ↓
Expectation / management risk
```

### 1. Frontline signal

The operator reports:

> Machine 4 stopped at 11:20. Production order 1421 will be delayed and we may lose around 60 units.

### 2. AI interpretation

Gemini converts the unstructured report into operational context such as:

- affected production order
- affected machine
- suspected part to investigate
- estimated output impact
- management impact

The model is explicitly **not allowed to mark operational facts as verified**.

### 3. Independent evidence verification

ExecutionOS asks Solari to launch a browser and navigate the mock ERP UI.

The browser independently verifies:

- Order `1421` status → `DELAYED`
- Machine `4` maintenance ticket → `M-8842`
- Part `BR-204` available quantity → `0`

The ERP is intentionally separate from the ExecutionOS application. The verification path reads the rendered legacy interface instead of querying the application's internal demo data directly.

### 4. Risk propagation

The blocker is linked to a hierarchy of expectations:

```text
CEO company objective
  ↓
Plant Manager
  ↓
Production Manager
  ↓
Shift Supervisor
  ↓
Operator / Order 1421
```

This gives management a drill-down path from a company KPI to the frontline event and the evidence that explains it.

## Design principle: facts ≠ interpretation ≠ decisions

ExecutionOS deliberately separates three layers:

**Facts** — evidence retrieved from operational systems or approved employee declarations.

**AI interpretation** — likely impact, risk, root-cause hypotheses, and recommendations.

**Human decisions** — intervention, resource allocation, performance decisions, escalation, or other management actions.

This separation is important for any system that may eventually influence employee performance or operational decisions.

## Why Solari matters

Many real operational systems do not expose clean APIs. They may be old ERP portals, proprietary dashboards, vendor software, or GUI-only tools.

Solari provides the computer-use layer that allows an agent to investigate those systems without requiring every source system to be rebuilt or integrated first.

For production, the intended cost hierarchy is:

```text
Cache → API when available → Solari Browser → Solari Desktop for GUI-only systems
```

Solari handles the difficult legacy-system tail rather than being used for every database operation.

## Current prototype

The challenge prototype currently includes:

- expectation lineage from CEO to operator
- natural-language frontline blocker reporting
- Gemini structured blocker interpretation
- Solari Cloud Browser evidence retrieval
- mock legacy ERP with orders, maintenance, and inventory
- evidence-backed blocker display
- management risk propagation view
- Solari session ID returned for auditability
- responsive Next.js interface

## Stack

- Next.js + TypeScript
- Gemini for reasoning / structured extraction
- Solari Cloud Browser for computer-use evidence retrieval
- Prisma schema for the future persistence layer
- Plain CSS

## Run locally / in Codespaces

```bash
cp .env.example .env.local
npm install
npm run dev
```

Configure:

```env
SOLARI_API_KEY="..."
APP_BASE_URL="https://your-public-preview.example"
GEMINI_API_KEY="..."
```

`APP_BASE_URL` must be publicly reachable by the Solari browser. In GitHub Codespaces, port 3000 therefore needs to be public.

Do not commit `.env.local`.

## Useful routes

- `/` — complete ExecutionOS demo
- `/erp` — mock legacy ERP
- `/api/analyze` — Gemini structured blocker analysis
- `/api/solari/verify?order=1421&machine=4&part=BR-204` — direct Solari evidence verification

## Demo objective

> Increase weekly on-time production from 82% to 95% while keeping rejection below 2%.

## What is intentionally mocked

The ERP is a controlled legacy-system simulation rather than a real SAP/Oracle installation. This keeps the challenge demo reproducible while preserving the important architecture: the AI cannot simply trust the employee update; a computer-use agent must navigate another operational interface and retrieve corroborating facts.

The production version would connect the same evidence layer to real ERP, maintenance, inventory, logistics, and other operational systems.

## What I would build next

1. Persist organizations, expectations, updates, evidence, and escalations with PostgreSQL/Prisma.
2. Let managers create a top-level objective and use AI-assisted decomposition with human approval.
3. Generate daily and weekly reports from verified execution signals.
4. Add confidence, dependency, and impact scoring to risk propagation.
5. Store Solari replay links as auditable evidence when available.
6. Connect a real legacy operational system.

## Product thesis

The goal is not another OKR dashboard or another employee status form.

The product thesis is:

> **Create an AI execution layer between management expectations and operational reality — preserving context, independently verifying facts from existing systems, identifying blockers, and propagating their impact through the organization.**
