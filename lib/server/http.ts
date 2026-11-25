import { timingSafeEqual } from "node:crypto";
import { connection } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { matchesAppOrigin, requestToken, sessionUser } from "./auth/session";
import { getDb } from "./db";

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

export function api<Args extends unknown[]>(handler: (...args: Args) => Promise<Response>) {
  return async (...args: Args): Promise<Response> => {
    await connection();
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return Response.json({ error: "Resource not found." }, { status: 404 });
        }
        if (error.code === "P2003") {
          return Response.json({ error: "A referenced record changed." }, { status: 409 });
        }
      }
      console.error("API request failed.", error);
      return Response.json({ error: "Internal server error." }, { status: 500 });
    }
  };
}

export async function requireIdentity(request: Request) {
  const session = await sessionUser(requestToken(request, "session"));
  if (session) {
    if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && !matchesAppOrigin(request)) {
      throw new ApiError(403, "Request origin is not allowed.");
    }
    return { user: session, sso: true };
  }

  const npm = process.env.DEV_AUTH_NPM;
  const token = process.env.DEV_AUTH_TOKEN;
  if (process.env.NODE_ENV === "development" && npm && token) {
    const expected = Buffer.from(`Bearer ${token}`);
    const authorization = Buffer.from(request.headers.get("authorization") ?? "");
    if (authorization.length === expected.length && timingSafeEqual(authorization, expected)) {
      const user = await getDb().user.findUnique({ where: { npm } });
      if (user) return { user, sso: false };
    }
  }

  throw new ApiError(401, "Authentication required.");
}

export async function requireUser(request: Request) {
  return (await requireIdentity(request)).user;
}

export function uuid(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(value)) {
    throw new ApiError(400, `${field} must be a UUID.`);
  }
  return value.toLowerCase();
}

export function requiredText(value: unknown, field: string, limit: number): string {
  if (typeof value !== "string" || !value.trim() || value.length > limit || value.includes("\0")) {
    throw new ApiError(400, `${field} must be a non-empty string of at most ${limit} characters.`);
  }
  return value.trim();
}

export function optionalText(value: unknown, field: string, limit: number): string | null {
  return value == null || value === "" ? null : requiredText(value, field, limit);
}

export function allowFields(data: Record<string, unknown>, fields: readonly string[]) {
  for (const field of Object.keys(data)) {
    if (!fields.includes(field)) throw new ApiError(400, `Unknown field: ${field}.`);
  }
}

async function boundedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) {
    throw new ApiError(413, "Request body is too large.");
  }
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Request body is required.");

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel().catch(() => undefined);
        throw new ApiError(413, "Request body is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return new Response(new Uint8Array(Buffer.concat(chunks)), { headers: request.headers });
}

function contentType(request: Request) {
  return request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
}

export async function jsonBody(request: Request): Promise<Record<string, unknown>> {
  if (contentType(request) !== "application/json") {
    throw new ApiError(415, "Expected application/json.");
  }
  const body = await boundedBody(request, 32 * 1024);
  const value: unknown = await body.json().catch(() => null);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ApiError(400, "Expected a JSON object.");
  }
  return value as Record<string, unknown>;
}

export async function multipartBody(request: Request, limit: number) {
  if (contentType(request) !== "multipart/form-data") {
    throw new ApiError(415, "Expected multipart/form-data.");
  }
  const body = await boundedBody(request, limit);
  try {
    return await body.formData();
  } catch {
    throw new ApiError(400, "Invalid multipart form data.");
  }
}
