import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const [albums, news, settings] = await Promise.all([
    db.album.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], include: { tracks: { orderBy: { trackNumber: "asc" }, include: { comments: { orderBy: { createdAt: "desc" } }, _count: { select: { likes: true } } } } } }),
    db.news.findMany({ orderBy: { createdAt: "desc" } }),
    db.siteSetting.findMany(),
  ]);
  return NextResponse.json({ albums, news, settings: Object.fromEntries(settings.map((item) => [item.key, item.value])) });
}
