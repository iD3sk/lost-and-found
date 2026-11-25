import { timingSafeEqual } from "node:crypto";
import { connection, type NextRequest } from "next/server";
import { getDb } from "@/lib/server/db";
import { authRedirect, validateIdentity } from "@/lib/server/auth/sso";
import {
  clearAuthCookie, createSession, createToken, hashToken, isToken, loginDuration,
  requestToken, serviceUrl, setAuthCookie,
} from "@/lib/server/auth/session";

export async function GET(request: NextRequest) {
  await connection();
  try {
    serviceUrl();
  } catch {
    return Response.json({ error: "SSO is not configured." }, { status: 503 });
  }

  const state = request.nextUrl.searchParams.get("state") ?? undefined;
  const expected = requestToken(request, "sso-state");
  if (!isToken(state) || !isToken(expected) || !timingSafeEqual(Buffer.from(state), Buffer.from(expected))) {
    return authRedirect("/?sso=expired");
  }

  const ticket = request.nextUrl.searchParams.get("ticket");
  const redirect = (path: string) => {
    const response = authRedirect(path);
    clearAuthCookie(response, "sso-state");
    return response;
  };
  if (!ticket || !/^ST-[\x21-\x7e]{1,509}$/.test(ticket)) return redirect("/?sso=failed");

  try {
    const identity = await validateIdentity(ticket, state);
    if (!identity) return redirect("/?sso=unsupported");

    const db = getDb();
    const { npm, name, faculty, facultyCode, major } = identity;
    const previousSession = requestToken(request, "session");
    const result = await db.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { npm } });
      const selectedMajor = major ?? (existing?.fakultas === faculty ? existing.major : undefined);
      if (!selectedMajor) {
        const token = createToken();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + loginDuration);
        await tx.pendingSsoProfile.deleteMany({ where: { userNpm: npm, expiresAt: { lte: now } } });
        const pendingToken = requestToken(request, "sso-profile");
        if (isToken(pendingToken)) {
          await tx.pendingSsoProfile.deleteMany({ where: { tokenHash: hashToken(pendingToken) } });
        }
        await tx.pendingSsoProfile.create({
          data: { tokenHash: hashToken(token), userNpm: npm, name, facultyCode, expiresAt },
        });
        return { kind: "sso-profile", token, expiresAt } as const;
      }

      await tx.user.upsert({
        where: { npm },
        create: { npm, name, fakultas: faculty, major: selectedMajor },
        update: { name, fakultas: faculty, major: selectedMajor },
      });
      const pendingToken = requestToken(request, "sso-profile");
      if (isToken(pendingToken)) {
        await tx.pendingSsoProfile.deleteMany({ where: { tokenHash: hashToken(pendingToken) } });
      }
      return { kind: "session", ...await createSession(tx, npm, previousSession) } as const;
    });

    const response = redirect(result.kind === "session" ? "/home" : "/register");
    if (result.kind === "session") clearAuthCookie(response, "sso-profile");
    setAuthCookie(response, result.kind, result.token, result.expiresAt);
    return response;
  } catch {
    return redirect("/?sso=failed");
  }
}
