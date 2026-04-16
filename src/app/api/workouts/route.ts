import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = getUserId();
    const { searchParams } = new URL(req.url);
    const from       = searchParams.get('from');
    const to         = searchParams.get('to');
    const workoutType = searchParams.get('workoutType');
    const exercise   = searchParams.get('exercise');
    const search     = searchParams.get('search');
    const limit      = Math.min(Number(searchParams.get('limit') ?? 100), 500);
    const offset     = Number(searchParams.get('offset') ?? 0);

    const where: Record<string, unknown> = { userId };
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to)   (where.date as Record<string, Date>).lte = new Date(to);
    }
    if (workoutType) where.workoutType = workoutType;
    if (exercise)    where.exercise    = { contains: exercise };
    if (search) {
      where.OR = [
        { exercise:  { contains: search } },
        { notes:     { contains: search } },
        { muscleGroup: { contains: search } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.workoutLog.count({ where }),
      prisma.workoutLog.findMany({ where, orderBy: { date: 'desc' }, skip: offset, take: limit }),
    ]);

    return NextResponse.json({ data, total, limit, offset });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = getUserId();
    const body = await req.json();
    const entry = await prisma.workoutLog.create({
      data: {
        userId,
        date:           new Date(body.date),
        sessionId:      body.sessionId,
        isSessionStart: body.isSessionStart ?? false,
        workoutType:    body.workoutType ?? null,
        muscleGroup:    body.muscleGroup ?? null,
        exercise:       body.exercise ?? null,
        sets:           body.sets    ? Number(body.sets)    : null,
        reps:           body.reps    ? Number(body.reps)    : null,
        weightKg:       body.weightKg ? Number(body.weightKg) : null,
        durationMin:    body.durationMin ? Number(body.durationMin) : null,
        notes:          body.notes ?? null,
        rpe:            body.rpe    ? Number(body.rpe)    : null,
        intensity:      body.intensity ?? null,
      },
    });
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
