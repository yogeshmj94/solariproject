"use client";

import { signIn } from "next-auth/react";
import styles from "./page.module.css";

export default function SignInPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <div className="kicker">Shipment Investigator demo</div>
        <h1>Trace a shipment from WMS scan to CCTV evidence.</h1>
        <p className="muted">
          This is a demonstrable prototype using simulated facility data. Sign in with Google to run the demo and leave deployment feedback.
        </p>

        <button
          className={styles.signin}
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/investigations" })}
        >
          Continue with Google
        </button>

        <div className={styles.note}>
          <strong>Demo flow</strong>
          <span>AWB → WMS last scan → relevant CCTV → evidence-backed finding</span>
        </div>

        <p className="muted small">
          The demo uses synthetic WMS and CCTV data. Your Google account is used to identify demo users and associate feedback.
        </p>
        <p className="muted small">
          <a href="/privacy">Read the privacy policy</a>
        </p>
      </section>
    </main>
  );
}
