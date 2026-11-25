import { connection, NextResponse } from "next/server";
import { loginUrl } from "@/lib/server/auth/sso";
import { createToken, loginDuration, setAuthCookie } from "@/lib/server/auth/session";

export async function GET() {
  await connection();
  try {
    const state = createToken();
    const response = NextResponse.redirect(loginUrl(state), {
      headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
    });
    setAuthCookie(response, "sso-state", state, new Date(Date.now() + loginDuration));
    return response;
  } catch {
    return Response.json({ error: "SSO is not configured." }, { status: 503 });
  }
}
