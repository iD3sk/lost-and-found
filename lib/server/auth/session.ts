import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { connection, type NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { getDb } from "@/lib/server/db";

const callbackPath = "/api/v1/auth/sso/callback";
const sessionDuration = 7 * 24 * 60 * 60 * 1000;
export const loginDuration = 10 * 60 * 1000;
type CookieKind = "session" | "sso-state" | "sso-profile";

export function serviceUrl() {
  const configured = process.env.SSO_SERVICE_URL;
  const service = new URL(configured ?? `http://localhost:3000${callbackPath}`);
  const isLocal = ["localhost", "127.0.0.1", "[::1]"].includes(service.hostname);
  const allowedProtocol = service.protocol === "https:" ||
    (process.env.NODE_ENV !== "production" && service.protocol === "http:" && isLocal);
  if (!allowedProtocol || service.pathname !== callbackPath || service.search || service.hash ||
      service.username || service.password) {
    throw new Error("SSO_SERVICE_URL must be the full callback URL without query parameters or credentials.");
  }
  return service;
}

export function authCookieName(kind: CookieKind) {
  return `${process.env.NODE_ENV === "production" ? "__Host-" : ""}laf-${kind}`;
}

export function setAuthCookie(response: NextResponse, kind: CookieKind, value: string, expires: Date) {
  response.cookies.set(authCookieName(kind), value, {
    httpOnly: true,
    secure: serviceUrl().protocol === "https:",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export function clearAuthCookie(response: NextResponse, kind: CookieKind) {
  setAuthCookie(response, kind, "", new Date(0));
}

export function requestToken(request: Request, kind: CookieKind) {
  const prefix = `${authCookieName(kind)}=`;
  const entry = request.headers.get("cookie")?.split(";").find((value) => value.trimStart().startsWith(prefix));
  return entry?.trim().slice(prefix.length);
}

export function matchesAppOrigin(request: Request) {
  return request.headers.get("origin") === serviceUrl().origin;
}

export function createToken() {
  return randomBytes(32).toString("base64url");
}

export function isToken(token: string | undefined): token is string {
  return typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sessionUser(token: string | undefined) {
  if (!isToken(token)) return null;
  const session = await getDb().session.findUnique({
    where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
    select: { user: true },
  });
  return session?.user ?? null;
}

export async function browserUser() {
  await connection();
  const store = await cookies();
  return sessionUser(store.get(authCookieName("session"))?.value);
}

export async function createSession(tx: Prisma.TransactionClient, userNpm: string, previousToken?: string) {
  const token = createToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionDuration);
  await tx.session.deleteMany({ where: { userNpm, expiresAt: { lte: now } } });
  if (isToken(previousToken)) {
    await tx.session.deleteMany({ where: { tokenHash: hashToken(previousToken) } });
  }
  await tx.session.create({ data: { tokenHash: hashToken(token), userNpm, expiresAt } });
  return { token, expiresAt };
}
