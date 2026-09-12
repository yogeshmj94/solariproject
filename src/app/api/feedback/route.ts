import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const feedbackSchema = z.object({
  usefulness: z.enum(["YES", "MAYBE", "NO"]),
  systems: z.array(z.string()).max(10).default([]),
  obstacle: z.string().max(1000).optional().default(""),
  comments: z.string().max(2000).optional().default(""),
  pilotInterest: z.enum(["YES", "MAYBE", "NO"]),
  company: z.string().max(200).optional().default(""),
  facility: z.string().max(200).optional().default(""),
  workEmail: z.string().email().optional().or(z.literal("")),
  investigationId: z.string().max(100).optional(),
});

async function saveLocal(payload: unknown, email: string) {
  const dir = process.env.VERCEL
    ? path.join(os.tmpdir(), "shipment-investigator-runtime")
    : path.join(process.cwd(), ".runtime-data");
  const file = path.join(dir, "feedback.json");
  await mkdir(dir, { recursive: true });

  let current: unknown[] = [];
  try {
    const raw = await readFile(file, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) current = parsed;
  } catch {}

  current.unshift({ id: `FB-${Date.now()}`, email, createdAt: new Date().toISOString(), payload });
  await writeFile(file, JSON.stringify(current.slice(0, 500), null, 2), "utf-8");
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ ok: false, error: "Authentication required" }, { status: 401 });
  }

  try {
    const payload = feedbackSchema.parse(await request.json());

    if (!process.env.DATABASE_URL) {
      if (process.env.VERCEL) {
        console.warn("DATABASE_URL is not configured; using ephemeral /tmp feedback storage");
      }
      await saveLocal(payload, session.user.email);
      return NextResponse.json({ ok: true });
    }

    const user = await prisma.demoUser.upsert({
      where: { email: session.user.email },
      update: { lastLoginAt: new Date() },
      create: {
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
      },
    });

    await prisma.productFeedback.create({
      data: {
        usefulness: payload.usefulness,
        systems: payload.systems,
        obstacle: payload.obstacle || null,
        comments: payload.comments || null,
        pilotInterest: payload.pilotInterest,
        company: payload.company || null,
        facility: payload.facility || null,
        workEmail: payload.workEmail || null,
        investigationId: payload.investigationId || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save feedback";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
