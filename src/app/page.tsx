import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.landing}>
      <nav className={styles.nav}>
        <div>
          <div className="brand">ExecutionOS · Sort Center</div>
          <div className="muted small">AI-assisted shipment recovery for existing warehouse systems.</div>
        </div>
        <div className={styles.navActions}>
          <a className={styles.secondary} href="/operations">Operations demo</a>
          <a className={styles.primary} href="/investigations">Try shipment recovery</a>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className="kicker">Lost & missorted shipment investigation</div>
          <h1>Find a lost shipment without manually searching hours of CCTV.</h1>
          <p className="muted">
            Give the system an AWB. It checks the WMS for the last verified scan, opens the relevant CCTV view, traces the shipment and returns its last known location with visual evidence.
          </p>
          <div className={styles.ctas}>
            <a className={styles.primary} href="/investigations">Sign in with Google & try the demo</a>
            <a className={styles.secondary} href="#deployment">See how a facility deployment works</a>
          </div>
          <div className={styles.pills}>
            <span className={styles.pill}>WMS</span>
            <span className={styles.pill}>CCTV / VMS</span>
            <span className={styles.pill}>Sorter systems</span>
            <span className={styles.pill}>Email intake</span>
            <span className={styles.pill}>Legacy web apps</span>
          </div>
        </div>

        <aside className={styles.demoCard}>
          <div className="kicker">Demonstrable prototype</div>
          <h2>AWB 771238945</h2>
          <small>Simulated BLR sort-center data</small>
          <div className={styles.demoFlow}>
            <div className={styles.demoStep}><span>1</span><div><strong>WMS scan found</strong><br/><small>Sorter Chute 17 · 07:03:51</small></div></div>
            <div className={styles.demoStep}><span>2</span><div><strong>CCTV search constrained</strong><br/><small>Relevant camera and time window</small></div></div>
            <div className={styles.demoStep}><span>3</span><div><strong>Shipment located</strong><br/><small>Exception Cage E2 · 96% confidence</small></div></div>
          </div>
        </aside>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className="kicker">Why this exists</div>
          <h2>The hard part is not storing another status. It is connecting fragmented operational evidence.</h2>
          <p className="muted">A shipment can disappear between scan events, conveyor movement, exception handling and outbound loading. The prototype demonstrates one investigation flow across those systems.</p>
        </div>
        <div className={styles.cards}>
          <article className={styles.card}><h3>Start from operational truth</h3><p className="muted">Use the WMS scan to narrow the physical area, timestamp, operator and likely CCTV source instead of searching footage blindly.</p></article>
          <article className={styles.card}><h3>Use existing interfaces</h3><p className="muted">Solari can operate legacy web systems through the UI, while direct APIs or database connectors can be substituted when a facility provides them.</p></article>
          <article className={styles.card}><h3>Return evidence, not a guess</h3><p className="muted">Each investigation keeps the WMS facts, camera evidence, confidence and audit session so a manager can verify the result.</p></article>
        </div>
      </section>

      <section className={styles.section} id="deployment">
        <div className={styles.sectionHeader}>
          <div className="kicker">Facility deployment model</div>
          <h2>Adapt the integration layer instead of rebuilding the product.</h2>
          <p className="muted">The target is for one capable integration engineer to connect a facility's systems and deploy a pilot in roughly 2–4 weeks, assuming access to the systems and usable CCTV feeds.</p>
        </div>
        <div className={styles.deploy}>
          <div className={styles.deployBox}>
            <h3>Facility-specific work</h3>
            <p className="muted">Map WMS fields, connect VMS/CCTV, describe camera topology, connect sortation/operations systems, configure email intake and validate evidence quality.</p>
          </div>
          <div className={styles.deployBox}>
            <h3>Reusable core</h3>
            <p className="muted">Case orchestration, evidence model, confidence states, investigation history, manager UI, feedback workflow and the core search/tracking pipeline stay the same.</p>
          </div>
        </div>
      </section>

      <section className={styles.footerCta}>
        <div>
          <h2>Try the simulated facility first.</h2>
          <p>Sign in, run both shipment scenarios and tell us what would need to change for your facility.</p>
        </div>
        <a className={styles.secondary} href="/investigations">Open the demo</a>
      </section>
    </main>
  );
}
