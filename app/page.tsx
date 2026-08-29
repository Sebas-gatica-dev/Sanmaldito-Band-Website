import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { getPublishedAlbums, getPublishedNews, getSettings } from "@/lib/content";
import { SiteHeader } from "@/components/site-header";
import { ImmersiveHero } from "@/components/immersive-hero";
import { ThornRule } from "@/components/icons";
import { TrackList } from "@/components/track-list";
import { SiteFooter } from "@/components/site-footer";
import type { PublicTrack } from "@/types/content";
import { withBasePath } from "@/lib/base-path";

export const dynamic = "force-dynamic";

function dateLabel(value: Date | null, fallback: Date) {
  return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(value ?? fallback);
}

export default async function Home() {
  const [settings, albums, news] = await Promise.all([getSettings(), getPublishedAlbums(), getPublishedNews()]);
  const featured = albums.find((album) => album.featured) ?? albums[0];
  const featuredTracks: PublicTrack[] = featured
    ? featured.tracks.map((track) => ({
        id: track.id,
        title: track.title,
        description: track.description,
        audioUrl: track.audioUrl,
        trackNumber: track.trackNumber,
        albumTitle: featured.title,
        coverImage: featured.coverImage,
        likes: track._count.likes,
        comments: track._count.comments,
      }))
    : [];

  return (
    <main>
      <SiteHeader />
      <ImmersiveHero
        eyebrow={settings.heroEyebrow ?? "DEATH METAL · ARGENTINA"}
        title={settings.heroTitle ?? "Nadie sale santo de esta tierra."}
        subtitle={settings.heroSubtitle ?? "Un archivo de ruido, deuda y resistencia."}
        image={settings.heroImage ?? "/branding/san-maldito-character.png"}
      />

      <section className="manifesto-section" id="manifiesto">
        <div className="manifesto-art" aria-hidden="true">
          <Image src={withBasePath("/branding/emblem-etched.png")} width={1254} height={1254} alt="" />
        </div>
        <div className="manifesto-index">I / EL CULTO</div>
        <div className="manifesto-copy">
          <p className="section-kicker">Manifiesto</p>
          <h2>{settings.aboutTitle ?? "Patrono de los olvidados"}</h2>
          <ThornRule />
          <p className="manifesto-lead">{settings.aboutText ?? "San Maldito no adora la decadencia: la expone."}</p>
          <p>
            No hay salvación en la mentira repetida. Hay memoria en las manos gastadas, en la fila del colectivo,
            en quien deja una parte de sí para que otro pueda comer. Esta música nace ahí: donde el ruido deja de ser pose y se vuelve testimonio.
          </p>
        </div>
        <blockquote>
          <span>“</span>
          La decadencia tiene un patrón.<br />Nosotros le pusimos rostro.
        </blockquote>
      </section>

      <section className="music-section" id="musica">
        <div className="section-heading">
          <p className="section-kicker">II / Discografía</p>
          <h2>El archivo sonoro</h2>
          <p>Cada lanzamiento vive completo acá. Sin algoritmos entre la obra y quien la escucha.</p>
        </div>
        {featured ? (
          <div className="featured-album">
            <Link href={`/discografia/${featured.slug}`} className="album-cover-wrap">
              <Image src={withBasePath(featured.coverImage)} width={1122} height={1402} alt={`Portada de ${featured.title}`} />
              <span className="album-stamp">Primer álbum<br />San Maldito</span>
            </Link>
            <div className="album-content">
              <div className="album-meta"><span>{featured.status === "production" ? "En producción" : featured.status}</span><i /> <span>{featured.tracks.length ? `${featured.tracks.length} canciones` : "Canciones por publicar"}</span></div>
              <h3>{featured.title}</h3>
              <p className="album-description">{featured.description}</p>
              {featured.manifesto && <blockquote>“{featured.manifesto}”</blockquote>}
              <TrackList tracks={featuredTracks} />
              <Link href={`/discografia/${featured.slug}`} className="text-link">Ver obra completa <ArrowUpRight size={16} /></Link>
            </div>
          </div>
        ) : (
          <p className="empty-state">El primer registro está tomando forma.</p>
        )}

        {albums.length > 1 && (
          <div className="album-grid">
            {albums.filter((album) => album.id !== featured?.id).map((album) => (
              <Link href={`/discografia/${album.slug}`} key={album.id} className="album-card">
                <Image src={withBasePath(album.coverImage)} width={600} height={600} alt="" />
                <h3>{album.title}</h3><span>{album.tracks.length ? `${album.tracks.length} canciones` : "Canciones por publicar"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="news-section" id="novedades">
        <div className="section-heading horizontal-heading">
          <div><p className="section-kicker">III / Transmisiones</p><h2>Novedades</h2></div>
          <p>Lanzamientos, presentaciones y partes desde el subsuelo.</p>
        </div>
        <div className="news-grid">
          {news.map((item, index) => (
            <article className={`news-card ${index === 0 ? "news-card-featured" : ""}`} key={item.id}>
              {item.image && <div className="news-image"><Image src={withBasePath(item.image)} fill sizes={index === 0 ? "66vw" : "33vw"} alt="" /></div>}
              <div className="news-body">
                <div className="news-meta"><span>{item.kind}</span><time><CalendarDays size={13} />{dateLabel(item.eventDate, item.createdAt)}</time></div>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                {item.body && <details><summary>Leer parte completo</summary><p>{item.body}</p></details>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="closing-section">
        <Image src={withBasePath("/branding/logo-official.png")} width={1448} height={1086} alt="San Maldito" />
        <p>Sin salvador. Sin dueño.<br />Sólo la obra.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
