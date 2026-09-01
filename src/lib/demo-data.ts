import type { Expectation } from "./types";

export const expectations: Expectation[] = [
  {
    id: "exp-company",
    title: "Increase weekly on-time production to 95% while keeping rejection below 2%",
    owner: "CEO",
    level: "company",
    metric: "On-time production %",
    baseline: 82,
    target: 95,
    current: 89,
    deadline: "2026-09-30",
    status: "at_risk"
  },
  {
    id: "exp-plant",
    title: "Plant 2 weekly schedule attainment ≥ 96%",
    owner: "Plant Manager",
    level: "plant",
    metric: "Schedule attainment %",
    baseline: 86,
    target: 96,
    current: 91,
    deadline: "2026-09-30",
    parentExpectationId: "exp-company",
    status: "at_risk"
  },
  {
    id: "exp-dept",
    title: "Line 3 daily output ≥ 1,200 units with rejects < 2%",
    owner: "Production Manager",
    level: "department",
    metric: "Units/day",
    baseline: 1050,
    target: 1200,
    current: 1098,
    deadline: "2026-09-30",
    parentExpectationId: "exp-plant",
    status: "at_risk"
  },
  {
    id: "exp-supervisor",
    title: "Shift B output ≥ 840 units",
    owner: "Shift Supervisor",
    level: "supervisor",
    metric: "Units/shift",
    target: 840,
    current: 782,
    deadline: "2026-09-01",
    parentExpectationId: "exp-dept",
    status: "at_risk"
  },
  {
    id: "exp-operator",
    title: "Complete Production Order 1421: 420 units",
    owner: "Operator A",
    level: "operator",
    metric: "Units/order",
    target: 420,
    current: 360,
    deadline: "2026-09-01",
    parentExpectationId: "exp-supervisor",
    status: "at_risk"
  }
];

export const blocker = {
  id: "blk-001",
  rawText: "Machine 4 stopped at 11:20. Production order 1421 will be delayed and we may lose around 60 units.",
  status: "verified",
  impact: "60 units at risk",
  rootCause: "Bearing BR-204 unavailable in local inventory",
  evidence: [
    "ERP: Production Order 1421 status = DELAYED",
    "Maintenance: Machine 4 ticket M-8842 opened 11:23",
    "Inventory: BR-204 available quantity = 0"
  ]
};
