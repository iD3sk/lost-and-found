import { Suspense } from "react";
import { cookies } from "next/headers";
import { connection } from "next/server";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import ProfileContactForm from "@/components/ProfileContactForm";
import { authCookieName, sessionUser } from "@/lib/server/auth/session";

async function AccountProfile() {
  await connection();
  const cookieStore = await cookies();
  const user = await sessionUser(cookieStore.get(authCookieName("session"))?.value);
  if (!user) {
    return (
      <a href="/api/v1/auth/sso/login" className="flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground">
        Sign in with SSO UI
      </a>
    );
  }

  const details = [
    ["Name", user.name],
    ["NPM", user.npm],
    ["Faculty", user.fakultas],
    ["Study program", user.major],
  ];

  return (
    <div className="flex flex-col gap-5">
      <dl className="flex flex-col gap-3.5">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="mb-1 text-sm font-semibold text-logo-dark">{label}</dt>
            <dd className="min-h-11 break-words rounded-xl border border-border-soft bg-card px-4 py-2.5">{value}</dd>
          </div>
        ))}
      </dl>
      <ProfileContactForm initialContact={user.contact ?? ""} />
      <form action="/api/v1/auth/logout" method="post">
        <button type="submit" className="min-h-11 rounded-xl border border-primary px-4 text-sm font-medium text-primary">
          Sign out
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="My Profile" backHref="/home" />
      <main className="mx-auto w-full max-w-sm px-6 pb-28 pt-6">
        <Suspense fallback={<p className="text-sm">Loading your profile…</p>}>
          <AccountProfile />
        </Suspense>
      </main>
      <BottomNav />
    </>
  );
}
