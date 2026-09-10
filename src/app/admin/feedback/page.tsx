import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import styles from "./page.module.css";

export default async function AdminFeedbackPage() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

  if (!email) {
    return (
      <main className={styles.shell}>
        <section className={styles.card}>
          <h1>Admin access required</h1>
          <p>Please sign in before opening this dashboard.</p>
        </section>
      </main>
    );
  }

  if (!adminEmail || email !== adminEmail) {
    return (
      <main className={styles.shell}>
        <section className={styles.card}>
          <h1>Not authorized</h1>
          <p>This dashboard is restricted to the configured admin account.</p>
        </section>
      </main>
    );
  }

  const feedback = await prisma.productFeedback.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    take: 200,
  });

  return (
    <main className={styles.shell}>
      <section className={styles.header}>
        <div>
          <div className={styles.kicker}>ADMIN</div>
          <h1>Facility feedback</h1>
          <p>{feedback.length} most recent submissions</p>
        </div>
        <a href="/investigations" className={styles.link}>Back to demo</a>
      </section>

      <section className={styles.grid}>
        {feedback.length === 0 ? (
          <div className={styles.card}>No feedback submitted yet.</div>
        ) : (
          feedback.map((item) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.meta}>
                <strong>{item.user.name || item.user.email}</strong>
                <span>{item.user.email}</span>
                <span>{item.createdAt.toLocaleString()}</span>
              </div>

              <div className={styles.rows}>
                <div><span>Usefulness</span><strong>{item.usefulness}</strong></div>
                <div><span>Pilot interest</span><strong>{item.pilotInterest}</strong></div>
                <div><span>Systems</span><strong>{item.systems.join(", ") || "—"}</strong></div>
                <div><span>Company</span><strong>{item.company || "—"}</strong></div>
                <div><span>Facility</span><strong>{item.facility || "—"}</strong></div>
                <div><span>Work email</span><strong>{item.workEmail || "—"}</strong></div>
                <div><span>Investigation</span><strong>{item.investigationId || "—"}</strong></div>
              </div>

              {item.obstacle ? (
                <div className={styles.textBlock}>
                  <span>Deployment obstacle</span>
                  <p>{item.obstacle}</p>
                </div>
              ) : null}

              {item.comments ? (
                <div className={styles.textBlock}>
                  <span>Comments</span>
                  <p>{item.comments}</p>
                </div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
