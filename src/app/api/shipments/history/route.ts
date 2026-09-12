import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { listInvestigations } from "@/lib/investigation-store";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const investigations = await listInvestigations(session.user.email);
    return NextResponse.json({ ok: true, investigations });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to load investigation history" },
      { status: 500 },
    );
  }
}
