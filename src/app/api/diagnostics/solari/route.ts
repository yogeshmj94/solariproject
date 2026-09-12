import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const TOKEN = "diag-20260912-7f0f0f59c8e14e4a9d47";

async function timed<T>(label: string, fn: () => Promise<T>) {
  const started = Date.now();
  const value = await fn();
  return { label, ms: Date.now() - started, value };
}

async function closeWithTimeout(task: Promise<unknown>, ms = 5000) {
  await Promise.race([
    task.catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("token") !== TOKEN) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const step = request.nextUrl.searchParams.get("step") ?? "launch";
  const apiKey = process.env.SOLARI_API_KEY;
  const configuredBaseUrl = process.env.APP_BASE_URL;

  if (!apiKey || !configuredBaseUrl) {
    const missing = [
      !apiKey ? "SOLARI_API_KEY" : null,
      !configuredBaseUrl ? "APP_BASE_URL" : null,
    ].filter(Boolean);

    return NextResponse.json({ ok: false, error: "missing production env", missing }, { status: 500 });
  }

  const timings: Array<{ label: string; ms: number }> = [];
  let client: any;
  let browser: any;

  try {
    const imported = await timed("import", () => import("@solarisdk/browser"));
    timings.push({ label: imported.label, ms: imported.ms });
    const { Solari } = imported.value;

    const baseUrl = configuredBaseUrl.replace(/\/+$/, "");
    client = new Solari({ apiKey, baseUrl: "https://api.getsolari.com" });

    const launched = await timed("launch", () => client.launch({ retries: 0 }));
    browser = launched.value;
    timings.push({ label: launched.label, ms: launched.ms });

    if (step === "launch") {
      return NextResponse.json({ ok: true, step, timings, sessionId: browser.id });
    }

    const page = await browser.newPage();
    const path = step === "cctv"
      ? "/cctv?waybill=771238945&camera=CAM-S17&time=2026-09-10%2007%3A03%3A51"
      : "/wms?waybill=771238945";

    const navigated = await timed("goto", () =>
      page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded", timeout: 15000 }),
    );
    timings.push({ label: navigated.label, ms: navigated.ms });

    const located = await timed("locator", async () => {
      const locator = page.locator('[data-waybill="771238945"]');
      await locator.waitFor({ state: "attached", timeout: 5000 });
      return locator.count();
    });
    timings.push({ label: located.label, ms: located.ms });

    return NextResponse.json({
      ok: true,
      step,
      timings,
      sessionId: browser.id,
      count: located.value,
      finalUrl: page.url(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        step,
        timings,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.split("\n").slice(0, 5) : undefined,
      },
      { status: 500 },
    );
  } finally {
    if (browser) await closeWithTimeout(browser.close());
    if (client) await closeWithTimeout(client.close());
  }
}
