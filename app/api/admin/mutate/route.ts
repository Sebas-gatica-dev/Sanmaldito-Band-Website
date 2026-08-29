import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";

type Payload = { action?: string; id?: string; data?: Record<string, unknown> };

function text(value: unknown, fallback = "") { return typeof value === "string" ? value.trim() : fallback; }
function bool(value: unknown) { return value === true; }
function num(value: unknown, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const payload = (await request.json()) as Payload;
  const data = payload.data ?? {};

  try {
    switch (payload.action) {
      case "createAlbum": {
        const title = text(data.title, "Nueva obra");
        const base = slugify(text(data.slug, title)) || `obra-${Date.now()}`;
        let slug = base;
        let index = 2;
        while (await db.album.findUnique({ where: { slug } })) slug = `${base}-${index++}`;
        const album = await db.album.create({ data: { title, slug, description: text(data.description, "Descripción pendiente."), coverImage: text(data.coverImage, "/branding/san-maldito-character.png"), status: "draft" } });
        return NextResponse.json(album, { status: 201 });
      }
      case "updateAlbum": {
        if (!payload.id) throw new Error("Falta el álbum");
        const album = await db.album.update({ where: { id: payload.id }, data: {
          title: text(data.title), slug: slugify(text(data.slug, text(data.title))), description: text(data.description), manifesto: text(data.manifesto) || null,
          coverImage: text(data.coverImage), heroImage: text(data.heroImage) || null, status: text(data.status, "draft"), featured: bool(data.featured), sortOrder: num(data.sortOrder),
        } });
        return NextResponse.json(album);
      }
      case "deleteAlbum":
        if (!payload.id) throw new Error("Falta el álbum");
        await db.album.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      case "createTrack": {
        const albumId = text(data.albumId);
        if (!albumId) throw new Error("Falta el álbum");
        const track = await db.track.create({ data: { albumId, title: text(data.title, "Nueva canción"), description: text(data.description) || null, trackNumber: num(data.trackNumber, 1), published: true } });
        return NextResponse.json(track, { status: 201 });
      }
      case "updateTrack":
        if (!payload.id) throw new Error("Falta la canción");
        return NextResponse.json(await db.track.update({ where: { id: payload.id }, data: { title: text(data.title), description: text(data.description) || null, audioUrl: text(data.audioUrl) || null, trackNumber: num(data.trackNumber, 1), published: data.published !== false } }));
      case "deleteTrack":
        if (!payload.id) throw new Error("Falta la canción");
        await db.track.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      case "deleteComment":
        if (!payload.id) throw new Error("Falta el comentario");
        await db.comment.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      case "createNews": {
        const item = await db.news.create({ data: { title: text(data.title, "Nueva novedad"), excerpt: text(data.excerpt, "Texto pendiente."), kind: text(data.kind, "novedad"), published: false } });
        return NextResponse.json(item, { status: 201 });
      }
      case "updateNews":
        if (!payload.id) throw new Error("Falta la novedad");
        return NextResponse.json(await db.news.update({ where: { id: payload.id }, data: { title: text(data.title), excerpt: text(data.excerpt), body: text(data.body) || null, kind: text(data.kind, "novedad"), image: text(data.image) || null, published: bool(data.published), eventDate: text(data.eventDate) ? new Date(text(data.eventDate)) : null } }));
      case "deleteNews":
        if (!payload.id) throw new Error("Falta la novedad");
        await db.news.delete({ where: { id: payload.id } });
        return NextResponse.json({ ok: true });
      case "saveSettings":
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === "string") await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
        }
        return NextResponse.json({ ok: true });
      default:
        return NextResponse.json({ error: "Acción desconocida" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
