import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ShipmentInvestigationResult } from "@/lib/shipment-investigation";

export type StoredInvestigation = ShipmentInvestigationResult & {
  createdAt: string;
};

const runtimeDir = path.join(process.cwd(), ".runtime-data");
const storePath = path.join(runtimeDir, "investigations.json");
const MAX_CASES = 50;

async function readStore(): Promise<StoredInvestigation[]> {
  try {
    const raw = await readFile(storePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function writeStore(items: StoredInvestigation[]) {
  await mkdir(runtimeDir, { recursive: true });
  await writeFile(storePath, JSON.stringify(items, null, 2), "utf-8");
}

export async function saveInvestigation(
  investigation: ShipmentInvestigationResult,
): Promise<StoredInvestigation> {
  const stored: StoredInvestigation = {
    ...investigation,
    createdAt: new Date().toISOString(),
  };

  const existing = await readStore();
  const next = [stored, ...existing.filter((item) => item.caseId !== stored.caseId)].slice(0, MAX_CASES);
  await writeStore(next);
  return stored;
}

export async function listInvestigations(): Promise<StoredInvestigation[]> {
  return readStore();
}
