"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["/", "Inicio"],
  ["/#manifiesto", "Manifiesto"],
  ["/#musica", "Música"],
  ["/#novedades", "Novedades"],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <Link href="/" className="header-brand" aria-label="San Maldito, inicio">
        <Image src="/branding/wordmark.png" width={2172} height={724} alt="San Maldito" priority />
      </Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Abrir menú" aria-expanded={open}>
        {open ? <X /> : <Menu />}
      </button>
      <nav className={open ? "is-open" : ""} aria-label="Navegación principal">
        {links.map(([href, label]) => (
          <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
        ))}
        <Link href="/admin" className="admin-link" onClick={() => setOpen(false)}>Acceso</Link>
      </nav>
    </header>
  );
}
