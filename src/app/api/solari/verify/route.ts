import { NextRequest, NextResponse } from "next/server";
import { verifyOperationalBlocker } from "@/lib/solari";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const wave = searchParams.get("wave") ?? "BLR-AM-05";
  const feedline = searchParams.get("feedline") ?? "5";

  try {
    const result = await verifyOperationalBlocker({ wave, feedline });
    return NextResponse.json({
      verified: true,
      facts: {
        waveStatus: result.waveStatus,
        jarvisTicket: result.jarvisTicket,
        projectedShipmentLoss: result.projectedShipmentLoss
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
