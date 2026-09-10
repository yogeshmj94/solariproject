import { NextResponse } from "next/server";
import { listInvestigations } from "@/lib/investigation-store";

export const runtime = "nodejs";

export async function GET() {
  try {
    const investigations = await listInvestigations();
    return NextResponse.json({ ok: true, investigations });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to load investigation history" },
      { status: 500 },
    );
  }
}
