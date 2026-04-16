import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId();
    const body = await req.json();
    const rec = await prisma.performanceEvaluation.findUnique({ where: { id: params.id } });
    if (!rec || rec.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const scores = [
      body.strengthScore, body.cardioScore, body.flexibilityScore,
      body.nutritionScore, body.sleepScore, body.recoveryScore,
    ].map(Number);
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;

    const updated = await prisma.performanceEvaluation.update({
      where: { id: params.id },
      data: {
        month: Number(body.month),
        year: Number(body.year),
        strengthScore: scores[0],
        cardioScore: scores[1],
        flexibilityScore: scores[2],
        nutritionScore: scores[3],
        sleepScore: scores[4],
        recoveryScore: scores[5],
        overallScore,
        comments: body.comments ?? null,
      },
    });
    return NextResponse.json({ data: updated });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId();
    const rec = await prisma.performanceEvaluation.findUnique({ where: { id: params.id } });
    if (!rec || rec.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await prisma.performanceEvaluation.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
