import { NextRequest, NextResponse } from "next/server";
import { investigateShipment } from "@/lib/shipment-investigation";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const waybill = request.nextUrl.searchParams.get("waybill")?.trim();

  if (!waybill) {
    return NextResponse.json({ ok: false, error: "waybill is required" }, { status: 400 });
  }

  try {
    const investigation = await investigateShipment(waybill);
    return NextResponse.json({ ok: true, investigation });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Shipment investigation failed" },
      { status: 500 },
    );
  }
}
