import { NextRequest, NextResponse } from "next/server";

type StructuredBlocker = {
  type: string;
  order: string;
  machine: string;
  part: string;
  estimatedImpactUnits: number;
  summary: string;
  managementImpact: string;
};

const schema = {
  type: "OBJECT",
  properties: {
    type: { type: "STRING" },
    order: { type: "STRING" },
    machine: { type: "STRING" },
    part: { type: "STRING" },
    estimatedImpactUnits: { type: "INTEGER" },
    summary: { type: "STRING" },
    managementImpact: { type: "STRING" },
  },
  required: [
    "type",
    "order",
    "machine",
    "part",
    "estimatedImpactUnits",
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

  const prompt = `You are the reasoning layer of ExecutionOS, an operations execution system.

Convert the employee update into structured operational context for evidence verification.

Employee update:
${update}

Demo environment facts available to investigate:
- Production orders use numeric IDs such as 1421.
- Machines use numeric IDs such as 4.
- Machine 4's suspected replacement bearing is BR-204.

Rules:
- Do not claim that operational facts are verified. Solari will verify them separately.
- Extract the order and machine explicitly mentioned by the employee.
- If Machine 4 is the affected machine and no part is stated, use BR-204 as the suspected part to investigate, not as a verified root cause.
- estimatedImpactUnits should be the employee's stated estimate, or 0 if none is stated.
- summary should be one concise sentence describing the reported blocker.
- managementImpact should explain why the blocker may threaten the employee's production expectation and upstream schedule attainment.
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

    if (!response.ok) {
      throw new Error(payload?.error?.message ?? `Gemini request failed (${response.status})`);
    }

    const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("Gemini returned no structured output");

    const analysis = JSON.parse(text) as StructuredBlocker;
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gemini analysis failed" },
      { status: 500 }
    );
  }
}
