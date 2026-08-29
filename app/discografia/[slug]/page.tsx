import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrackList } from "@/components/track-list";
import { ShareButton } from "@/components/share-button";
import type { PublicTrack } from "@/types/content";
import { withBasePath } from "@/lib/base-path";

export const dynamic = "force-dynamic";

async function getAlbum(slug: string) {
  return db.album.findFirst({
    where: { slug, status: { not: "draft" } },
    include: {
      tracks: {
        where: { published: true },
        orderBy: { trackNumber: "asc" },
        include: { _count: { select: { likes: true, comments: { where: { approved: true } } } } },
      },
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const album = await getAlbum((await params).slug);
  if (!album) return {};
  return { title: album.title, description: album.description, openGraph: { images: [album.coverImage] } };
}

export default async function AlbumPage({ params }: { params: Promise<{ slug: string }> }) {
  const album = await getAlbum((await params).slug);
  if (!album) notFound();
  const tracks: PublicTrack[] = album.tracks.map((track) => ({
    id: track.id, title: track.title, description: track.description, audioUrl: track.audioUrl,
    trackNumber: track.trackNumber, albumTitle: album.title, coverImage: album.coverImage,
    likes: track._count.likes, comments: track._count.comments,
  }));

  return (
    <main className="album-page">
      <SiteHeader />
      <section className="album-hero">
        <div className="album-hero-bg"><Image src={withBasePath(album.heroImage ?? album.coverImage)} fill sizes="100vw" alt="" priority /></div>
        <div className="album-hero-shade" />
        <div className="album-hero-content">
          <Link href="/#musica" className="back-link"><ArrowLeft size={14} /> Volver al archivo</Link>
          <p className="section-kicker">Obra / {album.status === "production" ? "En producción" : album.status}</p>
          <h1>{album.title}</h1>
          <p>{album.description}</p>
          <ShareButton title={`${album.title} — San Maldito`} />
        </div>
      </section>
      <section className="album-detail">
        <div className="album-detail-cover"><Image src={withBasePath(album.coverImage)} width={1122} height={1402} alt={`Portada de ${album.title}`} /></div>
        <div className="album-detail-tracks">
          <p className="section-kicker">Listado de canciones</p>
          <h2>El recorrido</h2>
          {album.manifesto && <blockquote>“{album.manifesto}”</blockquote>}
          <TrackList tracks={tracks} />
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
