import { NextRequest, NextResponse } from "next/server";
import { verifyOperationalBlocker } from "@/lib/solari";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const order = searchParams.get("order") ?? "1421";
  const machine = searchParams.get("machine") ?? "4";
  const part = searchParams.get("part") ?? "BR-204";

  try {
    const result = await verifyOperationalBlocker({ order, machine, part });
    return NextResponse.json({
      verified: true,
      facts: {
        orderStatus: result.orderStatus,
        maintenanceTicket: result.maintenanceTicket,
        partAvailableQty: result.partAvailableQty
      },
      sessionId: result.sessionId,
      replayUrl: result.replayUrl ?? null
    });
  } catch (error) {
    return NextResponse.json(
      { verified: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
