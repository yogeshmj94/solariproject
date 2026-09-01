import { Solari } from "@solarisdk/browser";

export type VerificationResult = {
  orderStatus: string;
  maintenanceTicket: string;
  partAvailableQty: number;
  sessionId: string;
  replayUrl?: string;
};

export async function verifyOperationalBlocker(params: {
  order: string;
  machine: string;
  part: string;
}): Promise<VerificationResult> {
  const apiKey = process.env.SOLARI_API_KEY;
  const baseUrl = process.env.APP_BASE_URL;

  if (!apiKey) throw new Error("SOLARI_API_KEY is missing");
  if (!baseUrl) throw new Error("APP_BASE_URL is missing");

  const client = new Solari({
    apiKey,
    baseUrl: "https://api.getsolari.com"
  });

  const browser = await client.launch({ recording: true });

  try {
    const page = await browser.newPage();
    await page.goto(`${baseUrl}/erp`, { waitUntil: "networkidle" });

    const orderStatus = (
      await page.locator(`[data-order="${params.order}"] [data-field="status"]`).innerText()
    ).trim();

    const maintenanceTicket = (
      await page.locator(`[data-machine="${params.machine}"] [data-field="ticket"]`).innerText()
    ).trim();

    const qtyText = (
      await page.locator(`[data-part="${params.part}"] [data-field="qty"]`).innerText()
    ).trim();

    const sessionId = browser.id;
    await browser.close();

    // Recording upload is asynchronous; replay may not be ready immediately.
    let replayUrl: string | undefined;
    try {
      const replay = await client.sessions.getReplayUrl(sessionId);
      replayUrl = replay.url;
    } catch {
      // Keep verification successful even if replay is still processing.
    }

    return {
      orderStatus,
      maintenanceTicket,
      partAvailableQty: Number(qtyText),
      sessionId,
      replayUrl
    };
  } finally {
    // browser.close() is already called above after sessionId is captured.
    // Solari cookbook/docs note that browser close cleans up the session.
  }
}
