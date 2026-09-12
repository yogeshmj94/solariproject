import { createSolariSession, extractWaybillFields, releaseSolariSession } from "@/lib/solari-cdp";

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

  const baseUrl = configuredBaseUrl.replace(/\/+$/, "");
  const session = await createSolariSession(apiKey);

  try {
    const wms = await extractWaybillFields(
      session.cdpEndpoint,
      `${baseUrl}/wms?waybill=${encodeURIComponent(waybill)}`,
      waybill,
      ["facility", "area", "time", "operator", "camera"],
    );

    const facility = wms.facility;
    const area = wms.area;
    const scanTime = wms.time;
    const operator = wms.operator;
    const camera = wms.camera;

    if (!facility || !area || !scanTime || !operator || !camera) {
      throw new Error(`Incomplete WMS evidence for waybill ${waybill}`);
    }

    const params = new URLSearchParams({ waybill, camera, time: scanTime });
    const evidence = await extractWaybillFields(
      session.cdpEndpoint,
      `${baseUrl}/cctv?${params.toString()}`,
      waybill,
      ["camera", "time", "area", "observation", "confidence", "state"],
    );

    const evidenceCamera = evidence.camera;
    const evidenceTime = evidence.time;
    const evidenceArea = evidence.area;
    const observation = evidence.observation;
    const confidence = Number(evidence.confidence);
    const state = evidence.state;

    if (!evidenceCamera || !evidenceTime || !evidenceArea || !observation || !state || Number.isNaN(confidence)) {
      throw new Error(`Incomplete CCTV evidence for waybill ${waybill}`);
    }

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
      sessionId: session.id,
    };
  } finally {
    await releaseSolariSession(apiKey, session.id);
  }
}
