import { db } from "@/lib/db";

export async function getSettings() {
  const rows = await db.siteSetting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

export async function getPublishedAlbums() {
  return db.album.findMany({
    where: { status: { not: "draft" } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      tracks: {
        where: { published: true },
        orderBy: { trackNumber: "asc" },
        include: {
          _count: { select: { likes: true, comments: { where: { approved: true } } } },
        },
      },
    },
  });
}

export async function getPublishedNews() {
  return db.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } });
}
