"use client";

import Image from "next/image";
import Link from "next/link";
import { Album as AlbumIcon, ArrowUpRight, Check, FileAudio, Home, ImageIcon, Loader2, LogOut, Megaphone, Plus, Save, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";

type Comment = { id: string; author: string; body: string; createdAt: string };
type Track = { id: string; title: string; description: string | null; audioUrl: string | null; trackNumber: number; published: boolean; comments: Comment[]; _count: { likes: number } };
type Album = { id: string; title: string; slug: string; description: string; manifesto: string | null; coverImage: string; heroImage: string | null; status: string; featured: boolean; sortOrder: number; tracks: Track[] };
type NewsItem = { id: string; title: string; excerpt: string; body: string | null; kind: string; image: string | null; eventDate: string | null; published: boolean };
type Content = { albums: Album[]; news: NewsItem[]; settings: Record<string, string> };
type Tab = "albums" | "news" | "home";

async function mutate(action: string, id?: string, data?: Record<string, unknown>) {
  const response = await fetch(withBasePath("/api/admin/mutate"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id, data }) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "No se pudo completar la acción");
  return result;
}

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return <label className={wide ? "field field-wide" : "field"}><span>{label}</span>{children}</label>;
}

function UploadButton({ kind, onUploaded }: { kind: "image" | "audio"; onUploaded: (url: string) => void }) {
  const [loading, setLoading] = useState(false);
  async function upload(file?: File) {
    if (!file) return;
    setLoading(true);
    const data = new FormData(); data.append("file", file);
    const response = await fetch(withBasePath("/api/admin/upload"), { method: "POST", body: data });
    const result = await response.json(); setLoading(false);
    if (!response.ok) return alert(result.error);
    onUploaded(result.url);
  }
  return (
    <label className="upload-button">
      {loading ? <Loader2 className="spin" size={15} /> : <Upload size={15} />} {loading ? "Subiendo…" : kind === "image" ? "Subir imagen" : "Subir MP3 / WAV"}
      <input type="file" accept={kind === "image" ? "image/png,image/jpeg,image/webp,image/avif" : "audio/mpeg,audio/wav"} onChange={(e) => void upload(e.target.files?.[0])} />
    </label>
  );
}

export function AdminDashboard() {
  const [content, setContent] = useState<Content | null>(null);
  const [tab, setTab] = useState<Tab>("albums");
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const reload = useCallback(async () => {
    const response = await fetch(withBasePath("/api/admin/content"), { cache: "no-store" });
    if (response.status === 401) return location.reload();
    const data = await response.json();
    setContent(data);
    setSelectedAlbum((value) => value ?? data.albums[0]?.id ?? null);
    setSelectedNews((value) => value ?? data.news[0]?.id ?? null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath("/api/admin/content"), { cache: "no-store" })
      .then((response) => {
        if (response.status === 401) location.reload();
        return response.json();
      })
      .then((data: Content) => {
        if (cancelled) return;
        setContent(data);
        setSelectedAlbum(data.albums[0]?.id ?? null);
        setSelectedNews(data.news[0]?.id ?? null);
      });
    return () => { cancelled = true; };
  }, []);
  function saved(text = "Cambios guardados") { setMessage(text); setTimeout(() => setMessage(""), 2200); }
  async function logout() { await fetch(withBasePath("/api/auth/logout"), { method: "POST" }); location.reload(); }

  if (!content) return <main className="admin-loading"><Loader2 className="spin" /><span>Abriendo el archivo…</span></main>;
  const album = content.albums.find((item) => item.id === selectedAlbum) ?? null;
  const news = content.news.find((item) => item.id === selectedNews) ?? null;

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><Image src={withBasePath("/branding/emblem-clean.png")} width={1254} height={1254} alt="" /><div><strong>San Maldito</strong><span>Archivo privado</span></div></div>
        <nav>
          <button className={tab === "albums" ? "active" : ""} onClick={() => setTab("albums")}><AlbumIcon size={17} /> Obras</button>
          <button className={tab === "news" ? "active" : ""} onClick={() => setTab("news")}><Megaphone size={17} /> Novedades</button>
          <button className={tab === "home" ? "active" : ""} onClick={() => setTab("home")}><Home size={17} /> Portada</button>
        </nav>
        <div className="admin-sidebar-bottom"><Link href="/" target="_blank">Ver sitio <ArrowUpRight size={14} /></Link><button onClick={logout}><LogOut size={14} /> Salir</button></div>
      </aside>
      <section className="admin-workspace">
        <header className="admin-topbar"><div><p>Panel de control</p><h1>{tab === "albums" ? "Obras y canciones" : tab === "news" ? "Novedades" : "Experiencia de portada"}</h1></div>{message && <span className="saved-message"><Check size={14} /> {message}</span>}</header>

        {tab === "albums" && (
          <div className="admin-split">
            <aside className="admin-list">
              <button className="admin-new" onClick={async () => { const item = await mutate("createAlbum", undefined, { title: "Nueva obra" }); await reload(); setSelectedAlbum(item.id); }}><Plus size={15} /> Nueva obra</button>
              {content.albums.map((item) => <button key={item.id} className={item.id === album?.id ? "selected" : ""} onClick={() => setSelectedAlbum(item.id)}><Image src={withBasePath(item.coverImage)} width={52} height={52} alt="" /><span><strong>{item.title}</strong><small>{item.status} · {item.tracks.length} canciones</small></span></button>)}
            </aside>
            {album ? <AlbumEditor key={album.id} album={album} reload={reload} saved={saved} onDeleted={() => setSelectedAlbum(null)} /> : <div className="admin-empty">Creá la primera obra para empezar.</div>}
          </div>
        )}

        {tab === "news" && (
          <div className="admin-split">
            <aside className="admin-list">
              <button className="admin-new" onClick={async () => { const item = await mutate("createNews"); await reload(); setSelectedNews(item.id); }}><Plus size={15} /> Nueva novedad</button>
              {content.news.map((item) => <button key={item.id} className={item.id === news?.id ? "selected" : ""} onClick={() => setSelectedNews(item.id)}><span className="list-icon"><Megaphone size={17} /></span><span><strong>{item.title}</strong><small>{item.published ? "Publicada" : "Borrador"} · {item.kind}</small></span></button>)}
            </aside>
            {news ? <NewsEditor key={news.id} item={news} reload={reload} saved={saved} onDeleted={() => setSelectedNews(null)} /> : <div className="admin-empty">Creá una novedad para empezar.</div>}
          </div>
        )}

        {tab === "home" && <SettingsEditor settings={content.settings} reload={reload} saved={saved} />}
      </section>
    </main>
  );
}

function AlbumEditor({ album, reload, saved, onDeleted }: { album: Album; reload: () => Promise<void>; saved: (s?: string) => void; onDeleted: () => void }) {
  const [form, setForm] = useState({ ...album });
  const set = (key: keyof Album, value: unknown) => setForm((current) => ({ ...current, [key]: value }));
  async function save() { await mutate("updateAlbum", album.id, form); await reload(); saved(); }
  async function remove() { if (!confirm(`¿Eliminar “${album.title}” y todas sus canciones? Esta acción no se puede deshacer.`)) return; await mutate("deleteAlbum", album.id); onDeleted(); await reload(); saved("Obra eliminada"); }
  return (
    <div className="admin-editor">
      <div className="editor-title"><div><p>Editar obra</p><h2>{form.title}</h2></div><div><button className="danger-button" onClick={remove}><Trash2 size={14} /> Eliminar</button><button className="save-button" onClick={save}><Save size={15} /> Guardar</button></div></div>
      <div className="editor-section"><h3>Información</h3><div className="form-grid">
        <Field label="Título"><input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
        <Field label="URL / slug"><input value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
        <Field label="Estado"><select value={form.status} onChange={(e) => set("status", e.target.value)}><option value="draft">Borrador (oculto)</option><option value="production">En producción</option><option value="published">Publicado</option></select></Field>
        <Field label="Orden"><input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} /></Field>
        <Field label="Descripción" wide><textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Texto / fragmento" wide><textarea rows={4} value={form.manifesto ?? ""} onChange={(e) => set("manifesto", e.target.value)} /></Field>
        <label className="checkbox-field"><input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Destacar esta obra en el inicio</label>
      </div></div>
      <div className="editor-section"><h3>Imágenes</h3><div className="media-grid">
        <MediaField label="Portada" value={form.coverImage} onChange={(value) => set("coverImage", value)} />
        <MediaField label="Imagen panorámica" value={form.heroImage ?? ""} onChange={(value) => set("heroImage", value)} />
      </div></div>
      <div className="editor-section tracks-editor"><div className="section-title-row"><div><h3>Canciones</h3><p>Podés publicar la obra vacía y cargar el audio más adelante.</p></div><button className="secondary-button" onClick={async () => { await mutate("createTrack", undefined, { albumId: album.id, trackNumber: album.tracks.length + 1 }); await reload(); }}><Plus size={14} /> Agregar canción</button></div>
        {album.tracks.length === 0 ? <div className="admin-empty small">Todavía no hay canciones.</div> : album.tracks.map((track) => <TrackEditor key={track.id} track={track} reload={reload} saved={saved} />)}
      </div>
    </div>
  );
}

function MediaField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="media-field"><span>{label}</span><div className="media-preview">{value ? <Image src={withBasePath(value)} fill sizes="260px" alt="" /> : <ImageIcon />}</div><input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/ruta/imagen.jpg" /><UploadButton kind="image" onUploaded={onChange} /></div>;
}

function TrackEditor({ track, reload, saved }: { track: Track; reload: () => Promise<void>; saved: (s?: string) => void }) {
  const [open, setOpen] = useState(false); const [form, setForm] = useState({ ...track });
  async function save(extra?: Partial<Track>) { const next = { ...form, ...extra }; setForm(next); await mutate("updateTrack", track.id, next); await reload(); saved("Canción guardada"); }
  return <div className="track-editor">
    <button className="track-editor-summary" onClick={() => setOpen(!open)}><span>{String(form.trackNumber).padStart(2, "0")}</span><FileAudio size={17} /><strong>{form.title}</strong><small>{form.audioUrl ? "Audio cargado" : "Sin audio"}</small><i>{open ? "−" : "+"}</i></button>
    {open && <div className="track-editor-body"><div className="form-grid">
      <Field label="Número"><input type="number" value={form.trackNumber} onChange={(e) => setForm({ ...form, trackNumber: Number(e.target.value) })} /></Field>
      <Field label="Título"><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
      <Field label="Descripción" wide><textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
      <label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} /> Visible públicamente</label>
    </div><div className="audio-upload"><code>{form.audioUrl || "Sin archivo de audio"}</code><UploadButton kind="audio" onUploaded={(url) => void save({ audioUrl: url })} /></div>
    <div className="track-editor-actions"><button className="danger-button" onClick={async () => { if (confirm("¿Eliminar esta canción?")) { await mutate("deleteTrack", track.id); await reload(); } }}><Trash2 size={14} /> Eliminar</button><button className="save-button" onClick={() => void save()}><Save size={14} /> Guardar canción</button></div>
    {track.comments.length > 0 && <div className="moderation"><h4>Comentarios ({track.comments.length})</h4>{track.comments.map((comment) => <div key={comment.id}><span><strong>{comment.author}</strong>{comment.body}</span><button onClick={async () => { await mutate("deleteComment", comment.id); await reload(); }}><Trash2 size={13} /></button></div>)}</div>}
    </div>}
  </div>;
}

function NewsEditor({ item, reload, saved, onDeleted }: { item: NewsItem; reload: () => Promise<void>; saved: (s?: string) => void; onDeleted: () => void }) {
  const [form, setForm] = useState({ ...item }); const set = (key: keyof NewsItem, value: unknown) => setForm((current) => ({ ...current, [key]: value }));
  async function save() { await mutate("updateNews", item.id, form); await reload(); saved(); }
  return <div className="admin-editor"><div className="editor-title"><div><p>Editar novedad</p><h2>{form.title}</h2></div><div><button className="danger-button" onClick={async () => { if (confirm("¿Eliminar esta novedad?")) { await mutate("deleteNews", item.id); onDeleted(); await reload(); } }}><Trash2 size={14} /> Eliminar</button><button className="save-button" onClick={save}><Save size={15} /> Guardar</button></div></div>
    <div className="editor-section"><div className="form-grid"><Field label="Título" wide><input value={form.title} onChange={(e) => set("title", e.target.value)} /></Field><Field label="Tipo"><input value={form.kind} onChange={(e) => set("kind", e.target.value)} placeholder="álbum, fecha, manifiesto…" /></Field><Field label="Fecha del evento"><input type="datetime-local" value={form.eventDate?.slice(0, 16) ?? ""} onChange={(e) => set("eventDate", e.target.value)} /></Field><Field label="Resumen" wide><textarea rows={3} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></Field><Field label="Texto completo" wide><textarea rows={7} value={form.body ?? ""} onChange={(e) => set("body", e.target.value)} /></Field><label className="checkbox-field"><input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} /> Publicar esta novedad</label></div></div>
    <div className="editor-section"><h3>Imagen</h3><div className="media-grid one"><MediaField label="Imagen de la novedad" value={form.image ?? ""} onChange={(value) => set("image", value)} /></div></div>
  </div>;
}

function SettingsEditor({ settings, reload, saved }: { settings: Record<string, string>; reload: () => Promise<void>; saved: (s?: string) => void }) {
  const [form, setForm] = useState({ ...settings }); const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));
  return <div className="admin-editor standalone"><div className="editor-title"><div><p>Editar experiencia</p><h2>Portada y manifiesto</h2></div><button className="save-button" onClick={async () => { await mutate("saveSettings", undefined, form); await reload(); saved(); }}><Save size={15} /> Guardar</button></div>
    <div className="editor-section"><h3>Apertura</h3><div className="form-grid"><Field label="Línea superior" wide><input value={form.heroEyebrow ?? ""} onChange={(e) => set("heroEyebrow", e.target.value)} /></Field><Field label="Frase principal" wide><input value={form.heroTitle ?? ""} onChange={(e) => set("heroTitle", e.target.value)} /></Field><Field label="Bajada" wide><textarea rows={3} value={form.heroSubtitle ?? ""} onChange={(e) => set("heroSubtitle", e.target.value)} /></Field></div><div className="media-grid one"><MediaField label="Imagen principal" value={form.heroImage ?? ""} onChange={(value) => set("heroImage", value)} /></div></div>
    <div className="editor-section"><h3>Manifiesto</h3><div className="form-grid"><Field label="Título" wide><input value={form.aboutTitle ?? ""} onChange={(e) => set("aboutTitle", e.target.value)} /></Field><Field label="Texto" wide><textarea rows={5} value={form.aboutText ?? ""} onChange={(e) => set("aboutText", e.target.value)} /></Field></div></div>
  </div>;
}
