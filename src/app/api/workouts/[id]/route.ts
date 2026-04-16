import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

async function getOwned(id: string, userId: string) {
  const rec = await prisma.workoutLog.findUnique({ where: { id } });
  if (!rec || rec.userId !== userId) return null;
  return rec;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const userId = getUserId();
  const rec = await getOwned(params.id, userId);
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: rec });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId();
    const rec = await getOwned(params.id, userId);
    if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const body = await req.json();
    const updated = await prisma.workoutLog.update({
      where: { id: params.id },
      data: {
        ...(body.date        !== undefined && { date:        new Date(body.date) }),
        ...(body.workoutType !== undefined && { workoutType: body.workoutType }),
        ...(body.muscleGroup !== undefined && { muscleGroup: body.muscleGroup }),
        ...(body.exercise    !== undefined && { exercise:    body.exercise }),
        ...(body.sets        !== undefined && { sets:        body.sets ? Number(body.sets) : null }),
        ...(body.reps        !== undefined && { reps:        body.reps ? Number(body.reps) : null }),
        ...(body.weightKg    !== undefined && { weightKg:    body.weightKg ? Number(body.weightKg) : null }),
        ...(body.durationMin !== undefined && { durationMin: body.durationMin ? Number(body.durationMin) : null }),
        ...(body.notes       !== undefined && { notes:       body.notes }),
        ...(body.rpe         !== undefined && { rpe:         body.rpe ? Number(body.rpe) : null }),
        ...(body.intensity   !== undefined && { intensity:   body.intensity }),
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
    const rec = await getOwned(params.id, userId);
    if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await prisma.workoutLog.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
