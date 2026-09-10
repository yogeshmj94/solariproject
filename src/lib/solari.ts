import { Solari } from "@solarisdk/browser";

export type VerificationResult = {
  waveStatus: string;
  jarvisTicket: string;
  projectedShipmentLoss: number;
  sessionId: string;
  replayUrl?: string;
};

export async function verifyOperationalBlocker(params: {
  wave: string;
  feedline: string;
}): Promise<VerificationResult> {
  const apiKey = process.env.SOLARI_API_KEY;
  const baseUrl = process.env.APP_BASE_URL;

  if (!apiKey) throw new Error("SOLARI_API_KEY is missing");
  if (!baseUrl) throw new Error("APP_BASE_URL is missing");

  const client = new Solari({
    apiKey,
    baseUrl: "https://api.getsolari.com",
  });

  const browser = await client.launch({ recording: true });
  const sessionId = browser.id;

  try {
    const page = await browser.newPage();

    await page.goto(`${baseUrl}/erp`, {
      waitUntil: "networkidle",
    });

    const continueButton = page.locator('button[type="submit"]', {
      hasText: "Continue",
    });

    if (await continueButton.count()) {
      await continueButton.first().click();
      await page.waitForLoadState("networkidle");
    }

    await page.waitForTimeout(1000);

    const waveStatus = (
      await page
        .locator(`[data-wave="${params.wave}"] [data-field="status"]`)
        .innerText()
    ).trim();

    const jarvisTicket = (
      await page
        .locator(`[data-feedline="${params.feedline}"] [data-field="ticket"]`)
        .innerText()
    ).trim();

    const impactText = (
      await page
        .locator(`[data-impact-feedline="${params.feedline}"] [data-field="impact"]`)
        .innerText()
    ).trim();

    return {
      waveStatus,
      jarvisTicket,
      projectedShipmentLoss: Number(impactText),
      sessionId,
    };
  } finally {
    await browser.close();
  }
}
