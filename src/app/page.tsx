import { expectations, blocker } from "@/lib/demo-data";
import { getLineage } from "@/lib/lineage";

export default function Home() {
  const company = expectations[0];
  const operator = expectations.find((e) => e.id === "exp-operator")!;
  const lineage = getLineage(expectations, operator.id);

  return (
    <main>
      <div className="topbar">
        <div className="brand">ExecutionOS</div>
        <div className="badge">Solari challenge prototype</div>
      </div>

      <section className="card span-12" style={{ marginBottom: 14 }}>
        <div className="kicker">Company objective</div>
        <h1>{company.title}</h1>
        <p className="muted">
          Strategy → expectations → daily execution → evidence → management intervention.
        </p>
      </section>

      <div className="grid">
        <section className="card span-4">
          <div className="kicker">Company</div>
          <h2>On-time production</h2>
          <div className="metric">{company.current}%</div>
          <div className="progress">
            <div style={{ width: `${company.current}%` }} />
          </div>
          <div className="risk">Target {company.target}% — at risk</div>
        </section>

        <section className="card span-8">
          <div className="kicker">Expectation lineage</div>
          <h2>Why Operator A is working on Order 1421</h2>
          <div className="lineage">
            {lineage.map((item, index) => (
              <span key={item.id} style={{ display: "contents" }}>
                <span className="node">{item.owner}: {item.metric}</span>
                {index < lineage.length - 1 && <span className="arrow">→</span>}
              </span>
            ))}
          </div>
        </section>

        <section className="card span-6">
          <div className="kicker">Operator A — today</div>
          <h2>{operator.title}</h2>
          <div className="metric">{operator.current} / {operator.target}</div>
          <div className="progress">
            <div style={{ width: `${((operator.current ?? 0) / operator.target) * 100}%` }} />
          </div>
          <p className="risk">60 units at risk</p>
          <textarea
            defaultValue="Machine 4 stopped at 11:20. Production order 1421 will be delayed and we may lose around 60 units."
            aria-label="Employee update"
          />
          <div style={{ marginTop: 10 }}>
            <button>Report blocker</button>
          </div>
        </section>

        <section className="card span-6">
          <div className="kicker">Evidence-backed blocker</div>
          <h2>Machine 4 failure</h2>
          <p><strong>Status:</strong> <span className="risk">VERIFIED</span></p>
          <p><strong>Impact:</strong> {blocker.impact}</p>
          <p><strong>Likely root cause:</strong> {blocker.rootCause}</p>
          <ul>
            {blocker.evidence.map((e) => <li key={e}>{e}</li>)}
          </ul>
          <p className="muted">
            Next: wire this card to the Solari verification endpoint and attach session replay.
          </p>
        </section>

        <section className="card span-12">
          <div className="kicker">Management view</div>
          <h2>Risk propagation</h2>
          <table>
            <thead>
              <tr>
                <th>Level</th>
                <th>Expectation</th>
                <th>Current</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {expectations.map((e) => (
                <tr key={e.id}>
                  <td>{e.owner}</td>
                  <td>{e.title}</td>
                  <td>{e.current ?? "—"} {e.current != null ? `/ ${e.target}` : ""}</td>
                  <td className={e.status === "on_track" ? "ok" : "risk"}>
                    {e.status.replace("_", " ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card span-12">
          <div className="kicker">Legacy system</div>
          <h2>Mock ERP for autonomous evidence retrieval</h2>
          <p className="muted">
            The ERP is intentionally separate from the performance UI. Solari must navigate it
            and read operational facts instead of receiving them through an internal database call.
          </p>
          <a href="/erp"><button>Open mock ERP</button></a>
        </section>
      </div>
    </main>
  );
}
