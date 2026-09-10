import type { Expectation } from "./types";

export const expectations: Expectation[] = [
  {
    id: "exp-company",
    title: "Maintain weekly on-time sort completion above 98% while reducing missorts",
    owner: "Regional Operations Head",
    level: "company",
    metric: "On-time sort completion %",
    baseline: 94,
    target: 98,
    current: 96,
    deadline: "2026-09-30",
    status: "at_risk"
  },
  {
    id: "exp-plant",
    title: "BLR Sort Center daily throughput attainment ≥ 97%",
    owner: "Sort Center Manager",
    level: "plant",
    metric: "Throughput attainment %",
    baseline: 92,
    target: 97,
    current: 94,
    deadline: "2026-09-30",
    parentExpectationId: "exp-company",
    status: "at_risk"
  },
  {
    id: "exp-dept",
    title: "Inbound sortation process ≥ 12,000 shipments/hour during peak window",
    owner: "Operations Manager",
    level: "department",
    metric: "Shipments/hour",
    baseline: 10800,
    target: 12000,
    current: 10980,
    deadline: "2026-09-30",
    parentExpectationId: "exp-plant",
    status: "at_risk"
  },
  {
    id: "exp-supervisor",
    title: "Shift A sortation throughput ≥ 48,000 shipments",
    owner: "Shift Manager",
    level: "supervisor",
    metric: "Shipments/shift",
    target: 48000,
    current: 44120,
    deadline: "2026-09-10",
    parentExpectationId: "exp-dept",
    status: "at_risk"
  },
  {
    id: "exp-operator",
    title: "Complete BLR-AM-05 wave at planned throughput",
    owner: "Feedline 5 Team Lead",
    level: "operator",
    metric: "Shipments/wave",
    target: 12400,
    current: 10980,
    deadline: "2026-09-10",
    parentExpectationId: "exp-supervisor",
    status: "at_risk"
  }
];

export const blocker = {
  id: "blk-001",
  rawText: "Feedline 5 went down at 11:20 during BLR-AM-05. JARVIS ticket raised and we may miss around 1,420 shipments in the wave.",
  status: "verified",
  impact: "1,420 shipments at risk",
  rootCause: "Feedline 5 drive fault under investigation",
  evidence: [
    "SortOps: Wave BLR-AM-05 status = AT_RISK",
    "JARVIS: Feedline 5 ticket JARVIS-8842 opened 11:23",
    "Throughput: Projected shipment loss = 1,420"
  ]
};
