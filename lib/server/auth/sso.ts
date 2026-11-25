import { SSO } from "@pipl-csui/sso-ui.js/dist/index.mjs";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/server/db";
import { organizationForCode } from "./organization";
import { hashToken, isToken, serviceUrl } from "./session";

function casClient() {
  let casUrl: string | undefined;
  const developmentUrl = process.env.SSO_DEV_CAS_URL;
  if (process.env.NODE_ENV === "development" && developmentUrl) {
    const url = new URL(developmentUrl);
    if (url.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
        url.username || url.password || url.search || url.hash) {
      throw new Error("SSO_DEV_CAS_URL must be a local HTTP URL.");
    }
    casUrl = url.href;
  }
  return new SSO({
    casUrl,
    version: "2.0",
    timeoutMs: 12000,
    fetch: async (input, init) => {
      const response = await fetch(input, init);
      if (!response.ok) throw new Error("CAS validation request failed.");
      return response;
    },
  });
}

function serviceWithState(state: string) {
  const url = serviceUrl();
  url.searchParams.set("state", state);
  return url.href;
}

export function loginUrl(state: string) {
  return casClient().loginUrl(serviceWithState(state));
}

export async function validateIdentity(ticket: string, state: string) {
  const user = await casClient().validate(ticket, {
    serviceUrl: serviceWithState(state),
    fetchOptions: { cache: "no-store", redirect: "error" },
  });
  const npm = user.npm?.trim();
  const name = user.rawAttributes.nama?.trim();
  const organization = organizationForCode(user.orgCode);

  if (!npm || !/^\d{6,20}$/.test(npm) || !name || name.length > 200 ||
      name.includes("\0") || !organization) return null;

  return { npm, name, ...organization };
}

export function authRedirect(path: string) {
  return NextResponse.redirect(new URL(path, serviceUrl()), {
    status: 303,
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}

export async function pendingProfile(token: string | undefined) {
  if (!isToken(token)) return null;
  return getDb().pendingSsoProfile.findUnique({
    where: { tokenHash: hashToken(token), expiresAt: { gt: new Date() } },
  });
}
