"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import type { PublicTrack } from "@/types/content";
import { withBasePath } from "@/lib/base-path";

type AudioContextValue = {
  current: PublicTrack | null;
  playing: boolean;
  playTrack: (track: PublicTrack) => void;
  toggle: () => void;
};

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const value = useContext(AudioContext);
  if (!value) throw new Error("useAudio debe usarse dentro de AudioProvider");
  return value;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [current, setCurrent] = useState<PublicTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const playTrack = useCallback((track: PublicTrack) => {
    if (!track.audioUrl) return;
    if (current?.id === track.id) {
      if (audio.current?.paused) void audio.current.play(); else audio.current?.pause();
      return;
    }
    setCurrent(track);
    setProgress(0);
    requestAnimationFrame(() => void audio.current?.play());
  }, [current?.id]);

  const toggle = useCallback(() => {
    if (!audio.current) return;
    if (audio.current.paused) void audio.current.play(); else audio.current.pause();
  }, []);

  useEffect(() => {
    const node = audio.current;
    if (!node) return;
    const tick = () => setProgress(node.currentTime);
    const meta = () => setDuration(node.duration || 0);
    const yes = () => setPlaying(true);
    const no = () => setPlaying(false);
    node.addEventListener("timeupdate", tick);
    node.addEventListener("loadedmetadata", meta);
    node.addEventListener("play", yes);
    node.addEventListener("pause", no);
    node.addEventListener("ended", no);
    return () => {
      node.removeEventListener("timeupdate", tick);
      node.removeEventListener("loadedmetadata", meta);
      node.removeEventListener("play", yes);
      node.removeEventListener("pause", no);
      node.removeEventListener("ended", no);
    };
  }, [current]);

  return (
    <AudioContext.Provider value={{ current, playing, playTrack, toggle }}>
      {children}
      <audio ref={audio} src={current?.audioUrl ? withBasePath(current.audioUrl) : undefined} preload="metadata" />
      {current && (
        <aside className="global-player" aria-label="Reproductor de audio">
          <div className="player-progress" style={{ "--progress": `${duration ? (progress / duration) * 100 : 0}%` } as React.CSSProperties}>
            <input aria-label="Posición" type="range" min={0} max={duration || 0} value={progress} onChange={(e) => { if (audio.current) audio.current.currentTime = Number(e.target.value); }} />
          </div>
          <Image src={withBasePath(current.coverImage)} width={64} height={64} alt="" />
          <div className="player-title"><strong>{current.title}</strong><span>{current.albumTitle}</span></div>
          <div className="player-controls">
            <button aria-label="Anterior" disabled><SkipBack size={17} /></button>
            <button className="player-main-button" onClick={toggle} aria-label={playing ? "Pausar" : "Reproducir"}>{playing ? <Pause fill="currentColor" /> : <Play fill="currentColor" />}</button>
            <button aria-label="Siguiente" disabled><SkipForward size={17} /></button>
          </div>
          <div className="player-time">{formatTime(progress)} / {formatTime(duration)}</div>
          <Volume2 className="player-volume" size={18} />
          <button className="player-close" onClick={() => { audio.current?.pause(); setCurrent(null); }} aria-label="Cerrar reproductor"><X size={18} /></button>
        </aside>
      )}
    </AudioContext.Provider>
  );
}
