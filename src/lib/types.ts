export type Expectation = {
  id: string;
  title: string;
  owner: string;
  level: "company" | "plant" | "department" | "supervisor" | "operator";
  metric: string;
  baseline?: number;
  target: number;
  current?: number;
  deadline: string;
  parentExpectationId?: string;
  status: "on_track" | "at_risk" | "off_track";
};

export type Blocker = {
  id: string;
  employeeId: string;
  rawText: string;
  type: "equipment" | "material" | "quality" | "staffing" | "other";
  asset?: string;
  startTime?: string;
  estimatedImpactUnits?: number;
  affectedExpectationId: string;
  status: "reported" | "verifying" | "verified" | "resolved";
};

export type Evidence = {
  source: string;
  fact: string;
  confidence: number;
  sessionReplayUrl?: string;
};
