import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { organizationForCode } from "@/lib/server/auth/organization";
import { authCookieName } from "@/lib/server/auth/session";
import { pendingProfile } from "@/lib/server/auth/sso";

type SearchParams = Promise<{ error?: string | string[] }>;

async function ProgramForm({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const cookieStore = await cookies();
  const profile = await pendingProfile(cookieStore.get(authCookieName("sso-profile"))?.value);
  if (!profile) redirect("/api/v1/auth/sso/login");

  const organization = organizationForCode(profile.facultyCode);
  if (!organization) redirect("/?sso=unsupported");
  const { error } = await searchParams;
  const programs = Object.entries(organization.programs).sort((a, b) => a[1].localeCompare(b[1], "id"));

  return (
    <>
      <p className="mb-5 text-sm text-foreground">{profile.name} · {organization.faculty}</p>
      <form action="/api/v1/auth/sso/complete" method="post" className="flex flex-col gap-2">
        <label htmlFor="program" className="text-sm font-semibold text-logo-dark">Study program</label>
        <select
          id="program"
          name="program"
          required
          defaultValue=""
          aria-describedby={error === "program" ? "program-error" : undefined}
          aria-invalid={error === "program" || undefined}
          className="min-h-11 w-full rounded-xl border border-border-soft bg-card px-4 py-2.5 focus:border-primary focus:outline-none"
        >
          <option value="" disabled>Select your study program</option>
          {programs.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
        </select>
        {error === "program" && <p id="program-error" role="alert" className="text-sm">Select a program from your faculty.</p>}
        <button type="submit" className="mt-2 min-h-11 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground">
          Continue
        </button>
      </form>
    </>
  );
}

export default function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="min-h-dvh bg-background px-6 py-8">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="mb-2 font-logo text-3xl text-logo-dark">Complete your profile</h1>
        <Suspense fallback={<p className="text-sm">Loading your SSO profile…</p>}>
          <ProgramForm searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
