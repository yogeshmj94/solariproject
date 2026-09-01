# ExecutionOS — Solari hiring challenge starter

ExecutionOS is an AI-native performance execution system for operations-heavy companies.

The demo story is intentionally narrow:

1. A CEO creates a company objective.
2. The objective cascades through Plant → Production → Supervisor → Operator.
3. An operator reports a blocker ("Machine 4 stopped").
4. The system links the blocker to affected expectations.
5. A Solari browser independently checks a mock legacy ERP.
6. Evidence is attached to the blocker.
7. Risk propagates upward.
8. Management sees the reason, evidence, and required support.

## Why this is not another OKR app

Every expectation keeps lineage to the company objective, and operational updates become evidence-backed execution signals rather than status text.

## Stack

- Next.js + TypeScript
- PostgreSQL via Prisma (schema included)
- Opus-class model for decomposition/reasoning (provider intentionally abstracted)
- Solari Cloud Browser for evidence retrieval from operational systems
- Plain CSS for speed

## Quick start

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open:

- `/` — executive + employee demo
- `/erp` — deliberately ugly mock legacy ERP
- `/api/solari/verify?order=1421&machine=4&part=BR-204` — Solari verification endpoint

The Solari endpoint requires `SOLARI_API_KEY` and a publicly reachable `APP_BASE_URL`.
When running locally on a phone/cloud IDE, set `APP_BASE_URL` to the deployed preview URL.

## Demo objective

> Increase weekly on-time production from 82% to 95% while keeping rejection below 2%.

## Demo blocker

> Machine 4 stopped at 11:20. Production order 1421 will be delayed and we may lose around 60 units.

## Next build steps

1. Replace demo data with Prisma persistence.
2. Add LLM objective decomposition.
3. Add structured blocker extraction.
4. Connect blocker → Solari evidence verification.
5. Add upward risk propagation.
6. Add daily/weekly summary approval.
7. Add Solari session recording link to evidence.
