"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { withBasePath } from "@/lib/base-path";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch(withBasePath("/api/auth/login"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (response.ok) location.reload(); else { setError("La clave no coincide."); setLoading(false); }
  }
  return (
    <main className="admin-login">
      <Link href="/" className="back-link"><ArrowLeft size={14} /> Volver al sitio</Link>
      <form onSubmit={submit}>
        <Image src={withBasePath("/branding/emblem-clean.png")} width={1254} height={1254} alt="" />
        <p className="section-kicker">Archivo privado</p><h1>Acceso</h1>
        <label>Clave de administración<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button-primary" disabled={loading}><LockKeyhole size={15} />{loading ? "Abriendo…" : "Entrar"}</button>
      </form>
    </main>
  );
}
