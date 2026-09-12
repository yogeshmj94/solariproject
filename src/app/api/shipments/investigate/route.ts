import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { investigateShipment } from "@/lib/shipment-investigation";
import { saveInvestigation } from "@/lib/investigation-store";

export const runtime = "nodejs";
export const maxDuration = 60;

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return "Shipment investigation failed";

  if (error.message === "Unexpected end of JSON input") {
    return "Solari browser session could not be created. Please retry in a moment.";
  }

  return error.message;
}

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
    console.error("Shipment investigation failed", error);
    return NextResponse.json(
      { ok: false, error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
