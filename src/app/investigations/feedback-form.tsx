"use client";

import { FormEvent, useState } from "react";

const systemOptions = ["WMS", "CCTV / VMS", "Sorter system", "Email", "Other"];

type Choice = "YES" | "MAYBE" | "NO";

export default function FeedbackForm({ investigationId }: { investigationId?: string }) {
  const [usefulness, setUsefulness] = useState<Choice>("YES");
  const [pilotInterest, setPilotInterest] = useState<Choice>("MAYBE");
  const [systems, setSystems] = useState<string[]>(["WMS", "CCTV / VMS"]);
  const [obstacle, setObstacle] = useState("");
  const [comments, setComments] = useState("");
  const [company, setCompany] = useState("");
  const [facility, setFacility] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function toggleSystem(value: string) {
    setSystems((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          usefulness,
          systems,
          obstacle,
          comments,
          pilotInterest,
          company,
          facility,
          workEmail,
          investigationId,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Unable to save feedback");
      }

      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save feedback");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card feedback-card">
      <div className="kicker">Help shape the pilot</div>
      <h2>Could this help investigate lost or missorted shipments in your facility?</h2>
      <p className="muted small">Your answers help us understand what a real one-month facility integration would require.</p>

      <form onSubmit={submit} className="feedback-form">
        <div className="feedback-block">
          <label className="field-label">Would this workflow be useful?</label>
          <div className="choice-row">
            {(["YES", "MAYBE", "NO"] as Choice[]).map((choice) => (
              <button
                type="button"
                key={choice}
                className={`choice-button ${usefulness === choice ? "selected" : ""}`}
                onClick={() => setUsefulness(choice)}
              >
                {choice === "YES" ? "Yes" : choice === "MAYBE" ? "Maybe" : "No"}
              </button>
            ))}
          </div>
        </div>

        <div className="feedback-block">
          <label className="field-label">What would we need to connect?</label>
          <div className="choice-row wrap">
            {systemOptions.map((system) => (
              <button
                type="button"
                key={system}
                className={`choice-button ${systems.includes(system) ? "selected" : ""}`}
                onClick={() => toggleSystem(system)}
              >
                {system}
              </button>
            ))}
          </div>
        </div>

        <label className="field-label" htmlFor="obstacle">Biggest obstacle to deployment</label>
        <textarea id="obstacle" value={obstacle} onChange={(event) => setObstacle(event.target.value)} placeholder="Access, CCTV quality, WMS limitations, security review, process ownership…" />

        <label className="field-label" htmlFor="comments">Anything else we should know?</label>
        <textarea id="comments" value={comments} onChange={(event) => setComments(event.target.value)} placeholder="What would make this genuinely useful for your operation?" />

        <div className="feedback-block">
          <label className="field-label">Would you consider a facility pilot?</label>
          <div className="choice-row">
            {(["YES", "MAYBE", "NO"] as Choice[]).map((choice) => (
              <button
                type="button"
                key={choice}
                className={`choice-button ${pilotInterest === choice ? "selected" : ""}`}
                onClick={() => setPilotInterest(choice)}
              >
                {choice === "YES" ? "Yes" : choice === "MAYBE" ? "Maybe" : "No"}
              </button>
            ))}
          </div>
        </div>

        {(pilotInterest === "YES" || pilotInterest === "MAYBE") && (
          <div className="pilot-fields">
            <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company (optional)" />
            <input value={facility} onChange={(event) => setFacility(event.target.value)} placeholder="Facility / city (optional)" />
            <input value={workEmail} onChange={(event) => setWorkEmail(event.target.value)} placeholder="Work email (optional)" type="email" />
          </div>
        )}

        <div className="feedback-submit-row">
          <button type="submit" disabled={saving}>{saving ? "Sending…" : "Send feedback"}</button>
          {saved && <span className="ok">Thanks — feedback saved.</span>}
          {error && <span className="risk">{error}</span>}
        </div>
      </form>
    </section>
  );
}
