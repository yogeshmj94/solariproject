"use client";

import { useMemo, useState } from "react";
import { expectations } from "@/lib/demo-data";
import { getLineage } from "@/lib/lineage";

type Analysis = {
  type: string;
  order: string;
  machine: string;
  part: string;
  estimatedImpactUnits: number;
  summary: string;
  managementImpact: string;
};

type Verification = {
  verified: boolean;
  facts?: {
    orderStatus: string;
    maintenanceTicket: string;
    partAvailableQty: number;
  };
  sessionId?: string;
  replayUrl?: string | null;
  error?: string;
};

const demoUpdate =
  "Machine 4 stopped at 11:20. Production order 1421 will be delayed and we may lose around 60 units.";

export default function Home() {
  const company = expectations[0];
  const operator = expectations.find((e) => e.id === "exp-operator")!;
  const lineage = getLineage(expectations, operator.id);

  const [update, setUpdate] = useState(demoUpdate);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [phase, setPhase] = useState<"idle" | "reasoning" | "verifying" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const evidence = useMemo(() => {
    if (!verification?.facts) return [];
    return [
      `ERP · Order ${analysis?.order ?? "1421"} status = ${verification.facts.orderStatus}`,
      `Maintenance · Machine ${analysis?.machine ?? "4"} ticket = ${verification.facts.maintenanceTicket}`,
      `Inventory · ${analysis?.part ?? "BR-204"} available quantity = ${verification.facts.partAvailableQty}`,
    ];
  }, [analysis, verification]);

  async function reportBlocker() {
    setError("");
    setAnalysis(null);
    setVerification(null);
    setPhase("reasoning");

    try {
      const analysisResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ update }),
      });
      const analysisPayload = await analysisResponse.json();
      if (!analysisResponse.ok) throw new Error(analysisPayload.error ?? "Gemini analysis failed");

      const parsed = analysisPayload.analysis as Analysis;
      setAnalysis(parsed);
      setPhase("verifying");

      const params = new URLSearchParams({
        order: parsed.order || "1421",
        machine: parsed.machine || "4",
        part: parsed.part || "BR-204",
      });
      const verifyResponse = await fetch(`/api/solari/verify?${params.toString()}`);
      const verifyPayload = (await verifyResponse.json()) as Verification;
      if (!verifyResponse.ok || !verifyPayload.verified) {
        throw new Error(verifyPayload.error ?? "Solari verification failed");
      }

      setVerification(verifyPayload);
      setPhase("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to investigate blocker");
      setPhase("error");
    }
  }

  return (
    <main>
      <div className="topbar">
        <div>
          <div className="brand">ExecutionOS</div>
          <div className="muted small">Operational truth, traced to company outcomes.</div>
        </div>
        <div className="badge">Solari challenge prototype</div>
      </div>

      <section className="hero">
        <div>
          <div className="kicker">Company objective</div>
          <h1>{company.title}</h1>
          <p className="muted hero-copy">
            Turn frontline updates into verified operational evidence, then show management exactly what is at risk and why.
          </p>
        </div>
        <div className="hero-metric">
          <span>Current</span>
          <strong>{company.current}%</strong>
          <span className="risk">Target {company.target}% · at risk</span>
        </div>
      </section>

      <section className="flowbar">
        <span>Frontline update</span><b>→</b><span>Gemini reasoning</span><b>→</b><span>Solari verification</span><b>→</b><span>Management action</span>
      </section>

      <div className="grid">
        <section className="card span-7">
          <div className="kicker">Operator A · Line 3 · Shift B</div>
          <h2>{operator.title}</h2>
          <div className="operator-progress">
            <div>
              <div className="metric">{operator.current} / {operator.target}</div>
              <span className="muted">units completed</span>
            </div>
            <span className="status-pill danger">60 units at risk</span>
          </div>
          <div className="progress"><div style={{ width: `${((operator.current ?? 0) / operator.target) * 100}%` }} /></div>

          <label className="field-label" htmlFor="employee-update">Report what changed</label>
          <textarea id="employee-update" value={update} onChange={(e) => setUpdate(e.target.value)} />
          <div className="action-row">
            <button onClick={reportBlocker} disabled={phase === "reasoning" || phase === "verifying" || !update.trim()}>
              {phase === "reasoning" ? "Gemini is interpreting…" : phase === "verifying" ? "Solari is verifying…" : "Investigate blocker"}
            </button>
            <span className="muted small">AI interpretation is kept separate from verified facts.</span>
          </div>
          {error && <div className="error-box">{error}</div>}
        </section>

        <section className="card span-5 evidence-card">
          <div className="kicker">Evidence-backed blocker</div>
          {phase === "idle" && (
            <div className="empty-state">
              <div className="pulse-dot" />
              <h2>Waiting for a frontline signal</h2>
              <p className="muted">ExecutionOS will interpret the update, ask Solari to inspect the legacy ERP, and attach the facts here.</p>
            </div>
          )}
          {(phase === "reasoning" || phase === "verifying") && (
            <div className="empty-state">
              <div className="spinner" />
              <h2>{phase === "reasoning" ? "Understanding the blocker" : "Checking operational systems"}</h2>
              <p className="muted">{phase === "reasoning" ? "Gemini is structuring the employee report." : "Solari is navigating the mock ERP independently."}</p>
            </div>
          )}
          {analysis && phase !== "idle" && (
            <div className="analysis-block">
              <div className="section-label">AI interpretation</div>
              <h2>{analysis.summary}</h2>
              <div className="chips">
                <span>Order {analysis.order}</span><span>Machine {analysis.machine}</span><span>Investigate {analysis.part}</span>
              </div>
              <p className="muted">{analysis.managementImpact}</p>
            </div>
          )}
          {verification?.verified && (
            <div className="verified-block">
              <div className="verified-heading"><span className="verified-mark">✓</span><strong>Verified by Solari</strong></div>
              {evidence.map((item) => <div className="evidence-row" key={item}>{item}</div>)}
              <div className="session-meta">Audit session · {verification.sessionId?.slice(-18)}</div>
              {verification.replayUrl && <a className="text-link" href={verification.replayUrl} target="_blank" rel="noreferrer">Open session replay ↗</a>}
            </div>
          )}
        </section>

        <section className="card span-12">
          <div className="section-header">
            <div><div className="kicker">Expectation lineage</div><h2>One blocker, visible all the way to the CEO</h2></div>
            {phase === "done" && <span className="status-pill danger">Company objective impacted</span>}
          </div>
          <div className="lineage">
            {lineage.map((item, index) => (
              <span key={item.id} style={{ display: "contents" }}>
                <span className="node"><strong>{item.owner}</strong><small>{item.metric}</small></span>
                {index < lineage.length - 1 && <span className="arrow">→</span>}
              </span>
            ))}
          </div>
        </section>

        <section className="card span-8">
          <div className="kicker">Management view</div>
          <h2>Risk propagation</h2>
          <table>
            <thead><tr><th>Owner</th><th>Expectation</th><th>Current</th><th>Status</th></tr></thead>
            <tbody>
              {expectations.map((e) => (
                <tr key={e.id}>
                  <td><strong>{e.owner}</strong></td><td>{e.title}</td>
                  <td>{e.current ?? "—"}{e.current != null ? ` / ${e.target}` : ""}</td>
                  <td><span className={`status-pill ${e.status === "on_track" ? "success" : "danger"}`}>{e.status.replace("_", " ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card span-4">
          <div className="kicker">Legacy evidence source</div>
          <h2>Mock ERP</h2>
          <p className="muted">No internal database shortcut. Solari navigates the legacy interface and reads the operational facts just like an employee would.</p>
          <a href="/erp" target="_blank" rel="noreferrer"><button className="secondary">Open legacy ERP ↗</button></a>
        </section>
      </div>
    </main>
  );
}
