import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserId } from '@/lib/auth';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = getUserId();
    const rec = await prisma.bodyMeasurement.findUnique({ where: { id: params.id } });
    if (!rec || rec.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    await prisma.bodyMeasurement.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
