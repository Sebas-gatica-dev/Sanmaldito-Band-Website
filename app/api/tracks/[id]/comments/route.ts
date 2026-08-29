import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  author: z.string().trim().min(2).max(40),
  body: z.string().trim().min(2).max(500),
});

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: trackId } = await params;
  const comments = await db.comment.findMany({
    where: { trackId, approved: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, author: true, body: true, createdAt: true },
  });
  return NextResponse.json(comments);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: trackId } = await params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revisá el nombre y el comentario" }, { status: 400 });
  const created = await db.comment.create({ data: { trackId, ...parsed.data }, select: { id: true, author: true, body: true, createdAt: true } });
  return NextResponse.json(created, { status: 201 });
}
