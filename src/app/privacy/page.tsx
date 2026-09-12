import styles from "./page.module.css";

export default function PrivacyPage() {
  return (
    <main className={styles.shell}>
      <section className={styles.card}>
        <div className="kicker">Privacy</div>
        <h1>Shipment Investigator privacy policy</h1>
        <p className="muted">Last updated: September 12, 2026</p>

        <h2>What this prototype collects</h2>
        <p>
          When you sign in with Google, the application receives the account information made available by the OAuth flow, such as your email address, name and profile image. It also stores shipment-demo investigation history and any feedback you submit.
        </p>

        <h2>How the information is used</h2>
        <p>
          Account information is used to identify demo users, keep each user's investigation history separate, associate feedback with the person who submitted it and restrict the feedback dashboard to the configured administrator.
        </p>

        <h2>Demo operational data</h2>
        <p>
          The public Shipment Investigator demo uses simulated WMS, sort-center and CCTV data. The demo waybills, operational events and CCTV evidence are synthetic and are not records from a real facility.
        </p>

        <h2>Infrastructure and service providers</h2>
        <p>
          The prototype is hosted on Vercel, uses PostgreSQL/Neon for persistent application data, Google for authentication and Solari Browser for the browser-based investigation workflow. Those providers may process technical information necessary to deliver their services under their own terms and privacy policies.
        </p>

        <h2>Feedback and pilot information</h2>
        <p>
          The feedback form may ask about systems used at your facility, deployment obstacles, pilot interest, company/facility information and an optional work email. Only provide information you are comfortable sharing for product validation or pilot follow-up.
        </p>

        <h2>Retention and access</h2>
        <p>
          Demo account, investigation and feedback records are retained for product validation and prototype operation. Administrative access is limited through the application's configured admin account. A future facility deployment would require facility-specific retention, access-control and audit policies before real operational or CCTV data is connected.
        </p>

        <h2>Security</h2>
        <p>
          Application secrets are configured through deployment environment variables and are not intended to be stored in the public repository. The public prototype should not be used to submit confidential facility credentials, production CCTV footage or other sensitive operational data.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          This policy may be updated as the prototype changes or if a real facility pilot introduces new data-processing requirements. The latest version will remain available at this page.
        </p>

        <div className={styles.actions}>
          <a href="/">Back to home</a>
          <a href="/investigations">Open the demo</a>
        </div>
      </section>
    </main>
  );
}
