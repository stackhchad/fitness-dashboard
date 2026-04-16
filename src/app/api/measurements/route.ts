import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = getUserId();
    const data = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId();
    const body = await req.json();
    const entry = await prisma.bodyMeasurement.create({
      data: {
        userId,
        date:       new Date(body.date),
        weightKg:   body.weightKg   ? Number(body.weightKg)   : null,
        heightCm:   body.heightCm   ? Number(body.heightCm)   : null,
        bodyFatPct: body.bodyFatPct ? Number(body.bodyFatPct) : null,
        chestCm:    body.chestCm    ? Number(body.chestCm)    : null,
        waistCm:    body.waistCm    ? Number(body.waistCm)    : null,
        hipsCm:     body.hipsCm     ? Number(body.hipsCm)     : null,
        armCm:      body.armCm      ? Number(body.armCm)      : null,
        thighCm:    body.thighCm    ? Number(body.thighCm)    : null,
        notes:      body.notes      ?? null,
      },
    });
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
