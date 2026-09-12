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
    await page.waitForLoadState("domcontentloaded");
  }
}

async function readText(locator: any) {
  const value = await locator.textContent();
  return (value ?? "").trim();
}

async function closeWithTimeout(task: Promise<unknown>, ms = 5000) {
  await Promise.race([
    task.catch(() => undefined),
    new Promise((resolve) => setTimeout(resolve, ms)),
  ]);
}

function getMockEvidenceImage(waybill: string, state: string) {
  if (waybill === "771238946" || state === "loaded") {
    return "/mock-cctv-frame-outbound.svg";
  }

  return "/mock-cctv-frame.svg";
}

export async function investigateShipment(waybill: string): Promise<ShipmentInvestigationResult> {
  const apiKey = process.env.SOLARI_API_KEY;
  const configuredBaseUrl = process.env.APP_BASE_URL;

  if (!apiKey) throw new Error("SOLARI_API_KEY is missing in the production environment");
  if (!configuredBaseUrl) throw new Error("APP_BASE_URL is missing in the production environment");

  // Keep the Solari SDK out of module initialization so deployment/runtime import
  // failures are catchable by the API route instead of producing an empty 500.
  const { Solari } = await import("@solarisdk/browser");

  const baseUrl = configuredBaseUrl.replace(/\/+$/, "");
  const client = new Solari({ apiKey, baseUrl: "https://api.getsolari.com" });
  let browser: any;

  try {
    browser = await client.launch({ recording: true, retries: 2 });
    const sessionId = browser.id;

    const wms = await browser.newPage();
    await wms.goto(`${baseUrl}/wms?waybill=${encodeURIComponent(waybill)}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await passCodespacesGate(wms);

    const shipment = wms.locator(`[data-waybill="${waybill}"]`);
    await shipment.waitFor({ state: "attached", timeout: 5000 });
    if (!(await shipment.count())) throw new Error(`Waybill ${waybill} was not found in WMS`);

    const facility = await readText(shipment.locator('[data-field="facility"]'));
    const area = await readText(shipment.locator('[data-field="area"]'));
    const scanTime = await readText(shipment.locator('[data-field="time"]'));
    const operator = await readText(shipment.locator('[data-field="operator"]'));
    const camera = await readText(shipment.locator('[data-field="camera"]'));

    const cctv = await browser.newPage();
    const params = new URLSearchParams({ waybill, camera, time: scanTime });
    await cctv.goto(`${baseUrl}/cctv?${params.toString()}`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await passCodespacesGate(cctv);

    const evidence = cctv.locator(`[data-waybill="${waybill}"]`);
    await evidence.waitFor({ state: "attached", timeout: 5000 });
    if (!(await evidence.count())) throw new Error(`No CCTV evidence found for ${waybill}`);

    const evidenceCamera = await readText(evidence.locator('[data-field="camera"]'));
    const evidenceTime = await readText(evidence.locator('[data-field="time"]'));
    const evidenceArea = await readText(evidence.locator('[data-field="area"]'));
    const observation = await readText(evidence.locator('[data-field="observation"]'));
    const confidence = Number(await readText(evidence.locator('[data-field="confidence"]')));
    const state = await readText(evidence.locator('[data-field="state"]'));

    const status = state === "inside"
      ? "AVAILABLE_INSIDE_FACILITY"
      : state === "loaded"
        ? "LEFT_FACILITY"
        : "LAST_SEEN";

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
        imageUrl: getMockEvidenceImage(waybill, state),
      },
      sessionId,
    };
  } finally {
    if (browser) await closeWithTimeout(browser.close());
    await closeWithTimeout(client.close());
  }
}
