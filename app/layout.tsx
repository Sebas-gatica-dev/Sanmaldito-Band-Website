import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AudioProvider } from "@/components/audio-player";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: { default: "San Maldito — Death Metal Argentino", template: "%s — San Maldito" },
  description: "Archivo oficial de San Maldito. Música, manifiestos y fechas sin intermediarios.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "San Maldito",
    description: "Nadie sale santo de esta tierra.",
    images: [withBasePath("/branding/san-maldito-character.png")],
  },
};

export const viewport: Viewport = { themeColor: "#080808", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <AudioProvider>{children}</AudioProvider>
      </body>
    </html>
  );
}
