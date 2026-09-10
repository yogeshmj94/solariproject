import { Solari } from "@solarisdk/browser";

export type ShipmentInvestigationResult = {
  caseId: string;
  waybill: string;
  status: "AVAILABLE_INSIDE_FACILITY" | "LEFT_FACILITY" | "LAST_SEEN";
  facility: string;
  lastScan: {
    area: string;
    time: string;
    operator: string;
    camera: string;
  };
  visualEvidence: {
    camera: string;
    time: string;
    area: string;
    observation: string;
    confidence: number;
    imageUrl: string;
  };
  sessionId: string;
};

async function passCodespacesGate(page: any) {
  const continueButton = page.locator('button[type="submit"]', { hasText: "Continue" });
  if (await continueButton.count()) {
    await continueButton.first().click();
    await page.waitForLoadState("networkidle");
  }
}

export async function investigateShipment(waybill: string): Promise<ShipmentInvestigationResult> {
  const apiKey = process.env.SOLARI_API_KEY;
  const baseUrl = process.env.APP_BASE_URL;

  if (!apiKey) throw new Error("SOLARI_API_KEY is missing");
  if (!baseUrl) throw new Error("APP_BASE_URL is missing");

  const client = new Solari({ apiKey, baseUrl: "https://api.getsolari.com" });
  const browser = await client.launch({ recording: true });
  const sessionId = browser.id;

  try {
    const wms = await browser.newPage();
    await wms.goto(`${baseUrl}/wms?waybill=${encodeURIComponent(waybill)}`, { waitUntil: "networkidle" });
    await passCodespacesGate(wms);

    const shipment = wms.locator(`[data-waybill="${waybill}"]`);
    if (!(await shipment.count())) throw new Error(`Waybill ${waybill} was not found in WMS`);

    const facility = (await shipment.locator('[data-field="facility"]').innerText()).trim();
    const area = (await shipment.locator('[data-field="area"]').innerText()).trim();
    const scanTime = (await shipment.locator('[data-field="time"]').innerText()).trim();
    const operator = (await shipment.locator('[data-field="operator"]').innerText()).trim();
    const camera = (await shipment.locator('[data-field="camera"]').innerText()).trim();

    const cctv = await browser.newPage();
    const params = new URLSearchParams({ waybill, camera, time: scanTime });
    await cctv.goto(`${baseUrl}/cctv?${params.toString()}`, { waitUntil: "networkidle" });
    await passCodespacesGate(cctv);

    const evidence = cctv.locator(`[data-waybill="${waybill}"]`);
    if (!(await evidence.count())) throw new Error(`No CCTV evidence found for ${waybill}`);

    const evidenceCamera = (await evidence.locator('[data-field="camera"]').innerText()).trim();
    const evidenceTime = (await evidence.locator('[data-field="time"]').innerText()).trim();
    const evidenceArea = (await evidence.locator('[data-field="area"]').innerText()).trim();
    const observation = (await evidence.locator('[data-field="observation"]').innerText()).trim();
    const confidence = Number((await evidence.locator('[data-field="confidence"]').innerText()).trim());
    const state = (await evidence.locator('[data-field="state"]').innerText()).trim();

    const status = state === "inside" ? "AVAILABLE_INSIDE_FACILITY" : state === "loaded" ? "LEFT_FACILITY" : "LAST_SEEN";

    return {
      caseId: `CASE-${Date.now()}`,
      waybill,
      status,
      facility,
      lastScan: { area, time: scanTime, operator, camera },
      visualEvidence: {
        camera: evidenceCamera,
        time: evidenceTime,
        area: evidenceArea,
        observation,
        confidence,
        imageUrl: "/mock-cctv-frame.svg",
      },
      sessionId,
    };
  } finally {
    await browser.close();
  }
}
