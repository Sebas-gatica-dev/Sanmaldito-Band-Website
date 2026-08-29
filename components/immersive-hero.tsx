"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, Play } from "lucide-react";
import { useEffect, useRef } from "react";
import { withBasePath } from "@/lib/base-path";

type Props = {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
};

export function ImmersiveHero({ eyebrow, title, subtitle, image }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || matchMedia("(pointer: coarse)").matches) return;
    const move = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      node.style.setProperty("--mx", `${x * 18}px`);
      node.style.setProperty("--my", `${y * 12}px`);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <section className="hero" ref={root}>
      <div className="hero-image" aria-hidden="true">
        <Image src={withBasePath(image)} alt="" fill priority sizes="100vw" />
      </div>
      <div className="hero-vignette" />
      <div className="hero-smoke hero-smoke-one" />
      <div className="hero-smoke hero-smoke-two" />
      <div className="hero-copy">
        <p className="eyebrow"><span />{eyebrow}</p>
        <Image className="hero-logo" src={withBasePath("/branding/logo-official.png")} width={1448} height={1086} alt="San Maldito" priority />
        <h1>{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <div className="hero-actions">
          <Link href="#musica" className="button button-primary"><Play size={15} fill="currentColor" /> Escuchar ahora</Link>
          <Link href="#manifiesto" className="button button-ghost">Leer el manifiesto</Link>
        </div>
      </div>
      <Link href="#manifiesto" className="scroll-cue" aria-label="Continuar hacia el manifiesto">
        <span>Descender</span><ArrowDown size={16} />
      </Link>
    </section>
  );
}
