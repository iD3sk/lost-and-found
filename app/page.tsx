'use client';

import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

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
        <button
          onClick={() => router.push('/home')}
          className="w-full py-3.5 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium cursor-pointer active:scale-98 transition"
        >
          Login with SSO
        </button>

        <button
          onClick={() => router.push('/login-regis-form')}
          className="w-full py-3.5 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium cursor-pointer active:scale-98 transition"
        >
          Login
        </button>

        <p className="mt-1.5 -mb-1.5 text-xs text-link font-medium">
          Don&apos;t have an account yet?
        </p>

        <button
          onClick={() => router.push('/register')}
          className="w-full py-3.5 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium cursor-pointer active:scale-98 transition"
        >
          Register
        </button>
      </div>
    </main>
  );
}