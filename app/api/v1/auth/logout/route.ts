import { getDb } from "@/lib/server/db";
import { authRedirect } from "@/lib/server/auth/sso";
import { clearAuthCookie, hashToken, isToken, matchesAppOrigin, requestToken } from "@/lib/server/auth/session";
import { ApiError, api } from "@/lib/server/http";

export const POST = api(async (request: Request) => {
  if (!matchesAppOrigin(request)) throw new ApiError(403, "Request origin is not allowed.");
  const token = requestToken(request, "session");
  if (isToken(token)) {
    await getDb().session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  const pending = requestToken(request, "sso-profile");
  if (isToken(pending)) {
    await getDb().pendingSsoProfile.deleteMany({ where: { tokenHash: hashToken(pending) } });
  }

  const response = authRedirect("/");
  clearAuthCookie(response, "session");
  clearAuthCookie(response, "sso-state");
  clearAuthCookie(response, "sso-profile");
  return response;
});
