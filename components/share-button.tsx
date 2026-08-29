"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch { /* Cerrar el diálogo de compartir no es un error. */ }
  }
  return <button className="button button-ghost" onClick={share}>{copied ? <Check size={15} /> : <Share2 size={15} />}{copied ? "Enlace copiado" : "Compartir"}</button>;
}
