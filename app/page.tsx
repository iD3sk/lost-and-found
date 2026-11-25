import { Suspense } from "react";

type SearchParams = Promise<{ sso?: string | string[] }>;

async function SsoFeedback({ searchParams }: { searchParams: SearchParams }) {
  const { sso } = await searchParams;
  const message = sso === "expired"
    ? "Your sign-in expired. Please try again."
    : sso === "unsupported"
      ? "We could not match this SSO account to a UI student profile."
      : sso === "failed"
        ? "SSO sign-in failed. Please try again."
        : null;

  return message ? <p role="alert" className="text-center text-sm text-foreground">{message}</p> : null;
}

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main className="min-h-dvh bg-background flex flex-col justify-center items-center px-9 gap-12">
      {/* Top Section: Magnifying Glass Logo + "Lost & Found" */}
      <div className="flex items-center gap-3">
        <svg
          width="110"
          height="110"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Handle */}
          <line
            x1="42"
            y1="78"
            x2="16"
            y2="104"
            stroke="var(--logo-dark)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Lens Circle */}
          <circle
            cx="68"
            cy="52"
            r="34"
            fill="var(--secondary)"
            stroke="var(--logo-dark)"
            strokeWidth="8"
          />
          {/* Yellow Starburst */}
          <polygon
            points="68,28 73,44 90,41 78,52 88,66 72,60 66,76 62,59 46,64 57,51 47,38 63,43"
            fill="var(--highlight)"
          />
        </svg>

        <h1 className="font-jeju text-[32px] leading-tight text-logo-dark">
          Lost &amp;
          <br />
          Found
        </h1>
      </div>

      {/* Bottom Section: Action Buttons */}
      <div className="w-full max-w-[240px] flex flex-col items-center gap-3.5">
        <a
          href="/api/v1/auth/sso/login"
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Sign in with SSO UI
        </a>
        <Suspense>
          <SsoFeedback searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}
