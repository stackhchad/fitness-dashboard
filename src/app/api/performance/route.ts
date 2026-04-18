import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getUserId();
    const data = await prisma.performanceEvaluation.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    return NextResponse.json({ data });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    const body = await req.json();
    const scores = [
      body.strengthScore, body.cardioScore, body.flexibilityScore,
      body.nutritionScore, body.sleepScore, body.recoveryScore,
    ].map(Number);
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10;

    const entry = await prisma.performanceEvaluation.upsert({
      where: { userId_month_year: { userId, month: Number(body.month), year: Number(body.year) } },
      update: {
        strengthScore: scores[0], cardioScore: scores[1], flexibilityScore: scores[2],
        nutritionScore: scores[3], sleepScore: scores[4], recoveryScore: scores[5],
        overallScore, comments: body.comments ?? null,
      },
      create: {
        userId, month: Number(body.month), year: Number(body.year),
        strengthScore: scores[0], cardioScore: scores[1], flexibilityScore: scores[2],
        nutritionScore: scores[3], sleepScore: scores[4], recoveryScore: scores[5],
        overallScore, comments: body.comments ?? null,
      },
    });
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
