import { NextResponse } from "next/server";
import { ADMIN_COOKIE, expectedToken, passwordIsValid } from "@/lib/auth";
import { BASE_PATH } from "@/lib/base-path";

export async function POST(request: Request) {
  const { password } = await request.json();
  if (typeof password !== "string" || !passwordIsValid(password)) {
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, expectedToken(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: BASE_PATH || "/",
  });
  return response;
}
