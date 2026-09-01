# ExecutionOS architecture v0

## Product thesis

A company's strategic objective should maintain traceable lineage all the way to daily operational execution, while employee updates should roll upward as evidence-backed risk and support signals.

## Core loop

Company objective
→ AI proposes decomposition
→ human approves
→ employee plans
→ employee executes
→ employee reports progress/blocker
→ AI structures the update
→ Solari retrieves external operational evidence
→ system computes impacted expectation lineage
→ manager receives only actionable escalation
→ daily/weekly report is generated for employee approval
→ leadership gets hierarchical synthesis

## Bounded-agent approach

Do not create 5,000 continuously running agents.

Use event-driven workflows:
- objective_created
- expectation_approved
- daily_plan_requested
- employee_update_submitted
- blocker_reported
- evidence_requested
- escalation_required
- day_close
- week_close

Each event invokes a short-lived reasoning workflow with only the relevant org/expectation context.

## Separation of truth

FACTS
- ERP records
- machine states
- attendance
- production quantity
- quality rejects
- approved human declarations

INTERPRETATION
- likely impact
- root cause hypothesis
- risk level
- recommendation

DECISION
- manager approval
- resource allocation
- disciplinary/pay/promotion actions

Keep interpretation and decision distinct.

## First Solari workflow

Input:
"Machine 4 stopped at 11:20. Production order 1421 will be delayed and we may lose 60 units."

Agent determines evidence needed:
1. Is Order 1421 actually delayed?
2. Is Machine 4 under maintenance?
3. Is the required part available?

Solari opens `/erp` and independently reads:
- order 1421 → DELAYED
- machine 4 → ticket M-8842
- part BR-204 → qty 0

The system stores these as Evidence records and can attach the Solari session replay.

## Submission scope

Must work:
- objective lineage
- operator update
- evidence verification
- upward risk propagation
- executive explanation

Nice to have:
- LLM decomposition
- LLM blocker extraction
- session replay
- daily summary approval

Later:
- desktop-based legacy app
- sandbox spreadsheet analysis
- multi-tenant enterprise controls
