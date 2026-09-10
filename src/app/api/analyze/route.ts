import { NextRequest, NextResponse } from "next/server";

type StructuredBlocker = {
  type: string;
  wave: string;
  feedline: string;
  estimatedImpactShipments: number;
  summary: string;
  managementImpact: string;
};

const schema = {
  type: "OBJECT",
  properties: {
    type: { type: "STRING" },
    wave: { type: "STRING" },
    feedline: { type: "STRING" },
    estimatedImpactShipments: { type: "INTEGER" },
    summary: { type: "STRING" },
    managementImpact: { type: "STRING" },
  },
  required: [
    "type",
    "wave",
    "feedline",
    "estimatedImpactShipments",
    "summary",
    "managementImpact",
  ],
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.MODEL_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY (or MODEL_API_KEY) is missing" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const update = typeof body?.update === "string" ? body.update.trim() : "";

  if (!update) {
    return NextResponse.json({ error: "Employee update is required" }, { status: 400 });
  }

  const prompt = `You are the reasoning layer of ExecutionOS for a parcel sort center.

Convert the frontline update into structured operational context for evidence verification.

Employee update:
${update}

Demo environment facts available to investigate:
- Sortation waves use IDs such as BLR-AM-05.
- Feedlines use numeric IDs such as 5.
- Feedline downtime is tracked in JARVIS equipment tickets.
- Throughput impact is measured in shipments at risk or projected shipment loss.

Rules:
- Do not claim operational facts are verified. Solari verifies them separately.
- Extract the wave and feedline explicitly mentioned by the employee.
- estimatedImpactShipments should be the employee's stated estimate, or 0 if none is stated.
- summary should be one concise sentence describing the reported sort-center blocker.
- managementImpact should explain why the blocker may threaten wave completion, shift throughput, dispatch cut-off, or upstream sort-center targets.
- type should be a short snake_case category.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      }
    );

    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message ?? `Gemini request failed (${response.status})`);

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned no structured output");

    return NextResponse.json({ analysis: JSON.parse(text) as StructuredBlocker });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gemini analysis failed" },
      { status: 500 }
    );
  }
}
