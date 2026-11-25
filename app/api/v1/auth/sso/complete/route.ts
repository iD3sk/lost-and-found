import { getDb } from "@/lib/server/db";
import { organizationForCode } from "@/lib/server/auth/organization";
import { authRedirect, pendingProfile } from "@/lib/server/auth/sso";
import { clearAuthCookie, createSession, matchesAppOrigin, requestToken, setAuthCookie } from "@/lib/server/auth/session";
import { ApiError, api } from "@/lib/server/http";

export const POST = api(async (request: Request) => {
  if (!matchesAppOrigin(request)) throw new ApiError(403, "Request origin is not allowed.");
  const pending = await pendingProfile(requestToken(request, "sso-profile"));
  if (!pending) return authRedirect("/?sso=expired");
  if (request.headers.get("content-type")?.split(";")[0] !== "application/x-www-form-urlencoded") {
    throw new ApiError(415, "Expected a program-selection form.");
  }

  const form = await request.formData().catch(() => null);
  const code = form?.get("program");
  const organization = organizationForCode(pending.facultyCode);
  if (typeof code !== "string" || !organization || !Object.hasOwn(organization.programs, code)) {
    return authRedirect("/register?error=program");
  }

  const { tokenHash, userNpm: npm, name } = pending;
  const major = organization.programs[code];
  const session = await getDb().$transaction(async (tx) => {
    const consumed = await tx.pendingSsoProfile.deleteMany({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
    if (!consumed.count) return null;

    await tx.user.upsert({
      where: { npm },
      create: { npm, name, fakultas: organization.faculty, major },
      update: { name, fakultas: organization.faculty, major },
    });
    return createSession(tx, npm, requestToken(request, "session"));
  });

  const response = authRedirect(session ? "/home" : "/?sso=expired");
  clearAuthCookie(response, "sso-profile");
  if (session) setAuthCookie(response, "session", session.token, session.expiresAt);
  return response;
});
