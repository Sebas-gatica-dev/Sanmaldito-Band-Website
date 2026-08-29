import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sanmaldito_admin";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function expectedToken() {
  const password = process.env.ADMIN_PASSWORD ?? "san-maldito-local";
  const secret = process.env.AUTH_SECRET ?? "local-development-only";
  return digest(`${password}:${secret}`);
}

export function passwordIsValid(password: string) {
  const expected = Buffer.from(digest(process.env.ADMIN_PASSWORD ?? "san-maldito-local"));
  const received = Buffer.from(digest(password));
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function isAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const expected = Buffer.from(expectedToken());
  const received = Buffer.from(token);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
