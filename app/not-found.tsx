import Link from "next/link";

export default function NotFound() {
  return <main className="not-found"><span>404</span><h1>Este camino no existe.</h1><Link className="button button-primary" href="/">Volver al archivo</Link></main>;
}
