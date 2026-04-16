import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

async function getOwned(id: string, userId: string) {
  const rec = await prisma.goal.findUnique({ where: { id } });
  return rec?.userId === userId ? rec : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId();
    const rec = await getOwned(params.id, userId);
    if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const body = await req.json();
    const updated = await prisma.goal.update({
      where: { id: params.id },
      data: {
        ...(body.category       !== undefined && { category:       body.category }),
        ...(body.description    !== undefined && { description:    body.description }),
        ...(body.startValue     !== undefined && { startValue:     Number(body.startValue) }),
        ...(body.targetValue    !== undefined && { targetValue:    Number(body.targetValue) }),
        ...(body.currentValue   !== undefined && { currentValue:   body.currentValue ? Number(body.currentValue) : null }),
        ...(body.startDate      !== undefined && { startDate:      new Date(body.startDate) }),
        ...(body.targetDate     !== undefined && { targetDate:     new Date(body.targetDate) }),
        ...(body.unit           !== undefined && { unit:           body.unit }),
        ...(body.higherIsBetter !== undefined && { higherIsBetter: body.higherIsBetter }),
        ...(body.notes          !== undefined && { notes:          body.notes }),
        ...(body.completedAt    !== undefined && { completedAt:    body.completedAt ? new Date(body.completedAt) : null }),
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
    await prisma.goal.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
