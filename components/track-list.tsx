"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Pause, Play, Send, Share2 } from "lucide-react";
import { useAudio } from "@/components/audio-player";
import type { PublicTrack } from "@/types/content";
import { withBasePath } from "@/lib/base-path";

function visitorId() {
  const key = "sanmaldito_visitor";
  let value = localStorage.getItem(key);
  if (!value) {
    value = crypto.randomUUID();
    localStorage.setItem(key, value);
  }
  return value;
}

export function TrackList({ tracks }: { tracks: PublicTrack[] }) {
  if (!tracks.length) return <p className="empty-state">Las canciones se publicarán próximamente.</p>;
  return <div className="track-list">{tracks.map((track) => <TrackRow key={track.id} track={track} />)}</div>;
}

function TrackRow({ track }: { track: PublicTrack }) {
  const { current, playing, playTrack } = useAudio();
  const active = current?.id === track.id;
  const [likes, setLikes] = useState(track.likes);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Array<{ id: string; author: string; body: string; createdAt: string }>>([]);
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!commentsOpen) return;
    fetch(withBasePath(`/api/tracks/${track.id}/comments`)).then((r) => r.json()).then(setComments).catch(() => undefined);
  }, [commentsOpen, track.id]);

  useEffect(() => {
    const id = visitorId();
    fetch(withBasePath(`/api/tracks/${track.id}/like?visitorId=${encodeURIComponent(id)}`))
      .then((response) => response.json())
      .then((data) => { setLikes(data.count); setLiked(data.liked); })
      .catch(() => undefined);
  }, [track.id]);

  async function like() {
    const response = await fetch(withBasePath(`/api/tracks/${track.id}/like`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId: visitorId() }),
    });
    if (response.ok) {
      const data = await response.json();
      setLikes(data.count);
      setLiked(data.liked);
    }
  }

  async function comment(event: React.FormEvent) {
    event.preventDefault();
    if (!author.trim() || !body.trim()) return;
    const response = await fetch(withBasePath(`/api/tracks/${track.id}/comments`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, body }),
    });
    if (response.ok) {
      const created = await response.json();
      setComments((value) => [...value, created]);
      setBody("");
    }
  }

  async function share() {
    const url = `${location.origin}${location.pathname}#track-${track.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `${track.title} — San Maldito`, url });
      else await navigator.clipboard.writeText(url);
    } catch { /* El usuario puede cancelar el diálogo nativo. */ }
  }

  return (
    <article className={`track-row ${active ? "is-active" : ""}`} id={`track-${track.id}`}>
      <div className="track-main">
        <span className="track-number">{String(track.trackNumber).padStart(2, "0")}</span>
        <button className="track-play" disabled={!track.audioUrl} onClick={() => playTrack(track)} aria-label={track.audioUrl ? `Reproducir ${track.title}` : `${track.title}, próximamente`}>
          {active && playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}
        </button>
        <div className="track-copy"><strong>{track.title}</strong><span>{track.description || (track.audioUrl ? "Escuchar canción" : "Próximamente")}</span></div>
        {!track.audioUrl && <span className="coming-soon">En producción</span>}
        <div className="track-actions">
          <button onClick={like} className={liked ? "is-liked" : ""} aria-label="Me gusta"><Heart size={16} fill={liked ? "currentColor" : "none"} /><span>{likes}</span></button>
          <button onClick={() => setCommentsOpen(!commentsOpen)} aria-label="Comentarios"><MessageCircle size={16} /><span>{commentsOpen ? comments.length : track.comments}</span></button>
          <button onClick={share} aria-label="Compartir"><Share2 size={16} /></button>
        </div>
      </div>
      {commentsOpen && (
        <div className="comments-panel">
          <div className="comments-list">
            {comments.length === 0 && <p>Abrí la conversación.</p>}
            {comments.map((item) => <div className="comment" key={item.id}><strong>{item.author}</strong><p>{item.body}</p></div>)}
          </div>
          <form onSubmit={comment}>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Tu nombre" maxLength={40} aria-label="Tu nombre" />
            <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Dejá un mensaje" maxLength={500} aria-label="Comentario" />
            <button aria-label="Publicar comentario"><Send size={15} /></button>
          </form>
        </div>
      )}
    </article>
  );
}
