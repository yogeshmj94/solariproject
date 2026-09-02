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

    console.log("SOLARI URL:", page.url());
    console.log("SOLARI TITLE:", await page.title());

    const orderStatus = (
      await page
        .locator(`[data-order="${params.order}"] [data-field="status"]`)
        .innerText()
    ).trim();

    const maintenanceTicket = (
      await page
        .locator(`[data-machine="${params.machine}"] [data-field="ticket"]`)
        .innerText()
    ).trim();

    const qtyText = (
      await page
        .locator(`[data-part="${params.part}"] [data-field="qty"]`)
        .innerText()
    ).trim();

    return {
      orderStatus,
      maintenanceTicket,
      partAvailableQty: Number(qtyText),
      sessionId,
    };
  } finally {
    await browser.close();
  }
}
