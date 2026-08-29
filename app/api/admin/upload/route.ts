import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const allowed: Record<string, string> = {
  "audio/mpeg": ".mp3", "audio/mp3": ".mp3", "audio/wav": ".wav", "audio/x-wav": ".wav", "audio/wave": ".wav",
  "image/png": ".png", "image/jpeg": ".jpg", "image/webp": ".webp", "image/avif": ".avif",
};

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  const ext = allowed[file.type];
  if (!ext) return NextResponse.json({ error: "Formato no admitido. Usá MP3, WAV, PNG, JPG, WEBP o AVIF." }, { status: 400 });
  if (file.size > 250 * 1024 * 1024) return NextResponse.json({ error: "El archivo supera el límite de 250 MB" }, { status: 413 });
  const root = path.resolve(/* turbopackIgnore: true */ process.env.UPLOAD_DIR ?? "public/uploads");
  await mkdir(root, { recursive: true });
  const filename = `${Date.now()}-${randomUUID()}${ext}`;
  await writeFile(path.join(root, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${filename}`, name: file.name, type: file.type, size: file.size });
}
