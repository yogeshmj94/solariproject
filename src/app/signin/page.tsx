import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="signin-shell">
      <section className="signin-card">
        <div className="kicker">Sort-center shipment recovery demo</div>
        <h1>Trace a shipment from WMS scan to CCTV evidence.</h1>
        <p className="muted">
          This is a demonstrable prototype using simulated facility data. Sign in with Google to run the demo and leave deployment feedback.
        </p>

        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/investigations" });
          }}
        >
          <button className="google-signin" type="submit">Continue with Google</button>
        </form>

        <div className="signin-note">
          <strong>Demo flow</strong>
          <span>AWB → WMS last scan → relevant CCTV → evidence-backed finding</span>
        </div>

        <p className="muted small">
          The demo uses synthetic WMS and CCTV data. Your Google account is used only to identify demo users and associate feedback.
        </p>
      </section>
    </main>
  );
}
