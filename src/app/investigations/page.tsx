"use client";

import { FormEvent, useEffect, useState } from "react";
import FeedbackForm from "./feedback-form";

type Investigation = {
  caseId: string;
  waybill: string;
  status: "AVAILABLE_INSIDE_FACILITY" | "LEFT_FACILITY" | "LAST_SEEN";
  facility: string;
  createdAt?: string;
  lastScan: {
    area: string;
    time: string;
    operator: string;
    camera: string;
  };
  visualEvidence: {
    camera: string;
    time: string;
    area: string;
    observation: string;
    confidence: number;
    imageUrl: string;
  };
  sessionId: string;
};

type ApiResponse = {
  ok: boolean;
  investigation?: Investigation;
  investigations?: Investigation[];
  error?: string;
};

const demoWaybills = ["771238945", "771238946"];

function statusLabel(status: Investigation["status"]) {
  if (status === "AVAILABLE_INSIDE_FACILITY") return "Available inside facility";
  if (status === "LEFT_FACILITY") return "Left facility";
  return "Last seen";
}

function statusClass(status: Investigation["status"]) {
  return status === "AVAILABLE_INSIDE_FACILITY" ? "success" : "danger";
}

function formatCreatedAt(value?: string) {
  if (!value) return "Just now";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function InvestigationsPage() {
  const [waybill, setWaybill] = useState("771238945");
  const [result, setResult] = useState<Investigation | null>(null);
  const [history, setHistory] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHistory() {
    try {
      const response = await fetch("/api/shipments/history", { cache: "no-store" });
      const payload = (await response.json()) as ApiResponse;
      if (response.ok && payload.ok && payload.investigations) {
        setHistory(payload.investigations);
      }
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  async function investigate(event?: FormEvent) {
    event?.preventDefault();
    const normalized = waybill.trim();
    if (!normalized) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/shipments/investigate?waybill=${encodeURIComponent(normalized)}`);
      const payload = (await response.json()) as ApiResponse;

      if (!response.ok || !payload.ok || !payload.investigation) {
        throw new Error(payload.error ?? "Shipment investigation failed");
      }

      setResult(payload.investigation);
      setHistory((current) => [payload.investigation!, ...current.filter((item) => item.caseId !== payload.investigation!.caseId)].slice(0, 50));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Shipment investigation failed");
    } finally {
      setLoading(false);
    }
  }

  function openCase(item: Investigation) {
    setResult(item);
    setWaybill(item.waybill);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main>
      <div className="topbar">
        <div>
          <a className="brand" href="/">Shipment Investigator</a>
          <div className="muted small">Shipment recovery console for sort-center managers.</div>
        </div>
        <div className="demo-badges">
          <div className="badge">Solari investigation</div>
          <div className="badge demo-badge">Demo facility · synthetic data</div>
        </div>
      </div>

      <section className="investigation-hero">
        <div>
          <div className="kicker">Lost & missorted shipment investigation</div>
          <h1>Find the last verified location of a shipment.</h1>
          <p className="muted hero-copy">
            Enter an AWB. Solari checks the WMS for the last scan, opens the relevant CCTV view and returns an evidence-backed finding.
          </p>
        </div>

        <form className="awb-search" onSubmit={investigate}>
          <label className="field-label" htmlFor="waybill">Waybill / AWB</label>
          <div className="awb-search-row">
            <input
              id="waybill"
              value={waybill}
              onChange={(event) => setWaybill(event.target.value)}
              placeholder="Enter waybill"
              autoComplete="off"
            />
            <button disabled={loading || !waybill.trim()} type="submit">
              {loading ? "Investigating…" : "Investigate"}
            </button>
          </div>
          <div className="demo-waybills">
            <span className="muted small">Demo:</span>
            {demoWaybills.map((item) => (
              <button
                className="waybill-chip"
                key={item}
                type="button"
                onClick={() => {
                  setWaybill(item);
                  setResult(null);
                  setError("");
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </form>
      </section>

      {error && <div className="error-box investigation-error">{error}</div>}

      {!result && !loading && !error && (
        <section className="card investigation-empty">
          <div className="pulse-dot" />
          <h2>Ready to investigate</h2>
          <p className="muted">Search a waybill to retrieve its last WMS scan and CCTV evidence.</p>
        </section>
      )}

      {loading && (
        <section className="card investigation-empty">
          <div className="spinner" />
          <h2>Tracing shipment</h2>
          <p className="muted">Solari is checking WMS and CCTV evidence. This may take a few seconds.</p>
        </section>
      )}

      {result && (
        <>
          <div className="investigation-grid">
            <section className="card investigation-summary">
              <div className="section-header">
                <div>
                  <div className="kicker">Case {result.caseId}</div>
                  <h2>AWB {result.waybill}</h2>
                </div>
                <span className={`status-pill ${statusClass(result.status)}`}>{statusLabel(result.status)}</span>
              </div>

              <div className="finding-banner">
                <span className="finding-icon">✓</span>
                <div>
                  <div className="small muted">Last verified finding</div>
                  <strong>{result.visualEvidence.area}</strong>
                  <p>{result.visualEvidence.observation}</p>
                </div>
              </div>

              <div className="detail-grid">
                <div><span>Facility</span><strong>{result.facility}</strong></div>
                <div><span>Confidence</span><strong>{Math.round(result.visualEvidence.confidence * 100)}%</strong></div>
                <div><span>Last verified</span><strong>{result.visualEvidence.time}</strong></div>
                <div><span>CCTV camera</span><strong>{result.visualEvidence.camera}</strong></div>
              </div>
            </section>

            <section className="card evidence-image-card">
              <div className="section-header">
                <div>
                  <div className="kicker">Visual evidence</div>
                  <h2>{result.visualEvidence.camera}</h2>
                </div>
                <span className="confidence-badge">{Math.round(result.visualEvidence.confidence * 100)}% match</span>
              </div>
              <img className="evidence-image" src={result.visualEvidence.imageUrl} alt={`CCTV evidence for ${result.waybill}`} />
              <div className="image-caption">
                <strong>{result.visualEvidence.area}</strong>
                <span>{result.visualEvidence.time}</span>
              </div>
            </section>

            <section className="card">
              <div className="kicker">WMS evidence</div>
              <h2>Last recorded scan</h2>
              <div className="timeline-row">
                <span className="timeline-dot" />
                <div>
                  <strong>{result.lastScan.area}</strong>
                  <p className="muted">{result.lastScan.time}</p>
                </div>
              </div>
              <div className="detail-grid compact">
                <div><span>Operator</span><strong>{result.lastScan.operator}</strong></div>
                <div><span>Mapped camera</span><strong>{result.lastScan.camera}</strong></div>
              </div>
            </section>

            <section className="card">
              <div className="kicker">Investigation path</div>
              <h2>Evidence chain</h2>
              <div className="evidence-chain">
                <div><span>1</span><div><strong>AWB received</strong><small>{result.waybill}</small></div></div>
                <div><span>2</span><div><strong>WMS scan verified</strong><small>{result.lastScan.area}</small></div></div>
                <div><span>3</span><div><strong>CCTV evidence verified</strong><small>{result.visualEvidence.area}</small></div></div>
              </div>
              <div className="session-meta">Solari audit session · {result.sessionId}</div>
            </section>
          </div>

          <FeedbackForm investigationId={result.caseId} />
        </>
      )}

      <section className="card history-card">
        <div className="section-header">
          <div>
            <div className="kicker">Case history</div>
            <h2>Recent investigations</h2>
          </div>
          <span className="muted small">{history.length} stored case{history.length === 1 ? "" : "s"}</span>
        </div>

        {historyLoading ? (
          <p className="muted">Loading investigation history…</p>
        ) : history.length === 0 ? (
          <p className="muted">No cases stored yet. Your next completed investigation will appear here.</p>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <button className="history-row" key={item.caseId} type="button" onClick={() => openCase(item)}>
                <div className="history-primary">
                  <strong>AWB {item.waybill}</strong>
                  <span className="muted small">{item.caseId} · {formatCreatedAt(item.createdAt)}</span>
                </div>
                <div className="history-location">
                  <strong>{item.visualEvidence.area}</strong>
                  <span className="muted small">{item.visualEvidence.camera} · {Math.round(item.visualEvidence.confidence * 100)}% confidence</span>
                </div>
                <span className={`status-pill ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
