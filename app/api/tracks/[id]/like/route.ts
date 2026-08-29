import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({ visitorId: z.string().min(8).max(100) });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: trackId } = await params;
  const visitorId = new URL(request.url).searchParams.get("visitorId") ?? "";
  const [count, liked] = await Promise.all([
    db.like.count({ where: { trackId } }),
    visitorId.length >= 8 ? db.like.findUnique({ where: { trackId_visitorId: { trackId, visitorId } } }) : null,
  ]);
  return NextResponse.json({ count, liked: Boolean(liked) });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: trackId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });

  const where = { trackId_visitorId: { trackId, visitorId: parsed.data.visitorId } };
  const existing = await db.like.findUnique({ where });
  if (existing) await db.like.delete({ where });
  else await db.like.create({ data: { trackId, visitorId: parsed.data.visitorId } });

  const count = await db.like.count({ where: { trackId } });
  return NextResponse.json({ liked: !existing, count });
}
