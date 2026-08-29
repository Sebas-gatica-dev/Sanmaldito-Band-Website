import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Image src="/branding/emblem-clean.png" width={1254} height={1254} alt="Emblema de San Maldito" />
      <p>San Maldito</p>
      <span>Death metal argentino · Archivo independiente</span>
      <div><Link href="/admin">Administrar</Link><a href="mailto:contacto@sanmaldito.com">Contacto</a></div>
      <small>© {new Date().getFullYear()} San Maldito. Todos los derechos reservados.</small>
    </footer>
  );
}
