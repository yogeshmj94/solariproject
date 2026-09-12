import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Prisma } from "@prisma/client";
import type { ShipmentInvestigationResult } from "@/lib/shipment-investigation";
import { prisma } from "@/lib/prisma";

export type StoredInvestigation = ShipmentInvestigationResult & {
  createdAt: string;
};

const runtimeDir = process.env.VERCEL
  ? path.join(os.tmpdir(), "shipment-investigator-runtime")
  : path.join(process.cwd(), ".runtime-data");
const storePath = path.join(runtimeDir, "investigations.json");
const MAX_CASES = 50;

async function readLocalStore(): Promise<StoredInvestigation[]> {
  try {
    const raw = await readFile(storePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeLocalStore(items: StoredInvestigation[]) {
  await mkdir(runtimeDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(items, null, 2), "utf-8");
}

function useDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

function fromDb(row: {
  id: string;
  waybill: string;
  status: string;
  facility: string;
  lastScan: unknown;
  visualEvidence: unknown;
  sessionId: string;
  createdAt: Date;
}): StoredInvestigation {
  return {
    caseId: row.id,
    waybill: row.waybill,
    status: row.status as ShipmentInvestigationResult["status"],
    facility: row.facility,
    lastScan: row.lastScan as ShipmentInvestigationResult["lastScan"],
    visualEvidence: row.visualEvidence as ShipmentInvestigationResult["visualEvidence"],
    sessionId: row.sessionId,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function saveInvestigation(
  investigation: ShipmentInvestigationResult,
  userEmail?: string | null,
): Promise<StoredInvestigation> {
  if (useDatabase()) {
    let userId: string | undefined;
    if (userEmail) {
      const user = await prisma.demoUser.findUnique({ where: { email: userEmail } });
      userId = user?.id;
    }

    const row = await prisma.investigationCase.upsert({
      where: { id: investigation.caseId },
      update: {
        status: investigation.status,
        facility: investigation.facility,
        lastScan: investigation.lastScan as Prisma.InputJsonValue,
        visualEvidence: investigation.visualEvidence as Prisma.InputJsonValue,
        sessionId: investigation.sessionId,
        userId,
      },
      create: {
        id: investigation.caseId,
        waybill: investigation.waybill,
        status: investigation.status,
        facility: investigation.facility,
        lastScan: investigation.lastScan as Prisma.InputJsonValue,
        visualEvidence: investigation.visualEvidence as Prisma.InputJsonValue,
        sessionId: investigation.sessionId,
        userId,
      },
    });

    return fromDb(row);
  }

  if (process.env.VERCEL) {
    console.warn("DATABASE_URL is not configured; using ephemeral /tmp investigation storage");
  }

  const stored: StoredInvestigation = {
    ...investigation,
    createdAt: new Date().toISOString(),
  };

  const existing = await readLocalStore();
  const next = [stored, ...existing.filter((item) => item.caseId !== stored.caseId)].slice(0, MAX_CASES);
  await writeLocalStore(next);
  return stored;
}

export async function listInvestigations(userEmail?: string | null): Promise<StoredInvestigation[]> {
  if (useDatabase()) {
    const user = userEmail
      ? await prisma.demoUser.findUnique({ where: { email: userEmail } })
      : null;

    const rows = await prisma.investigationCase.findMany({
      where: user ? { userId: user.id } : undefined,
      orderBy: { createdAt: "desc" },
      take: MAX_CASES,
    });

    return rows.map(fromDb);
  }

  return readLocalStore();
}
