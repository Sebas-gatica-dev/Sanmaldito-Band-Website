import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/auth";
import { BASE_PATH } from "@/lib/base-path";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { maxAge: 0, path: BASE_PATH || "/" });
  return response;
}
