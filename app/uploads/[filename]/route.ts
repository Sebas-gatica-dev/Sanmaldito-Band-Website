import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

function uploadPath(filename: string) {
  if (!/^[0-9]+-[0-9a-f-]+\.(?:mp3|wav|png|jpg|webp|avif)$/i.test(filename)) return null;
  const root = path.resolve(process.env.UPLOAD_DIR ?? "public/uploads");
  const resolved = path.resolve(root, filename);
  return path.dirname(resolved) === root ? resolved : null;
}

function streamBody(filename: string, start?: number, end?: number) {
  return Readable.toWeb(createReadStream(filename, { start, end })) as unknown as ReadableStream;
}

export async function GET(request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const filename = (await params).filename;
  const resolved = uploadPath(filename);
  if (!resolved) return new NextResponse("Archivo no encontrado", { status: 404 });

  try {
    const info = await stat(resolved);
    if (!info.isFile()) return new NextResponse("Archivo no encontrado", { status: 404 });

    const type = contentTypes[path.extname(filename).toLowerCase()] ?? "application/octet-stream";
    const commonHeaders = {
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": type,
      "X-Content-Type-Options": "nosniff",
    };
    const range = request.headers.get("range");

    if (!range) {
      return new Response(streamBody(resolved), {
        headers: { ...commonHeaders, "Content-Length": String(info.size) },
      });
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    }

    const requestedStart = match[1] ? Number(match[1]) : undefined;
    const requestedEnd = match[2] ? Number(match[2]) : undefined;
    const start = requestedStart ?? Math.max(0, info.size - (requestedEnd ?? 0));
    const end = requestedStart === undefined ? info.size - 1 : Math.min(requestedEnd ?? info.size - 1, info.size - 1);

    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= info.size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${info.size}` } });
    }

    return new Response(streamBody(resolved, start, end), {
      status: 206,
      headers: {
        ...commonHeaders,
        "Content-Length": String(end - start + 1),
        "Content-Range": `bytes ${start}-${end}/${info.size}`,
      },
    });
  } catch {
    return new NextResponse("Archivo no encontrado", { status: 404 });
  }
}
