import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { investigateShipment } from "@/lib/shipment-investigation";
import { saveInvestigation } from "@/lib/investigation-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  const waybill = request.nextUrl.searchParams.get("waybill")?.trim();

  if (!waybill) {
    return NextResponse.json({ ok: false, error: "waybill is required" }, { status: 400 });
  }

  try {
    const investigation = await investigateShipment(waybill);
    const storedInvestigation = await saveInvestigation(investigation, session.user.email);
    return NextResponse.json({ ok: true, investigation: storedInvestigation });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Shipment investigation failed" },
      { status: 500 },
    );
  }
}
