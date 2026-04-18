import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getUserId();
    const data = await prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await req.json();
    const entry = await prisma.goal.create({
      data: {
        userId,
        category:       body.category,
        description:    body.description,
        startValue:     Number(body.startValue),
        targetValue:    Number(body.targetValue),
        currentValue:   body.currentValue ? Number(body.currentValue) : null,
        startDate:      new Date(body.startDate),
        targetDate:     new Date(body.targetDate),
        unit:           body.unit     ?? null,
        higherIsBetter: body.higherIsBetter ?? true,
        notes:          body.notes    ?? null,
      },
    });
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
