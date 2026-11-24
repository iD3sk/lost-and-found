'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginFormPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend/auth later
    router.push('/');
  };

  return (
    <main className="min-h-dvh bg-background flex flex-col px-6 py-8">
      {/* Top Back Button */}
      <button
        onClick={() => router.back()}
        className="self-start text-logo-dark text-xl font-bold mb-6 cursor-pointer"
        aria-label="Go back"
      >
        ←
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-[340px] w-full mx-auto">
        <h1 className="font-logo text-3xl text-logo-dark mb-1">Welcome Back</h1>
        <p className="text-sm text-muted mb-8">Log in to report or find lost items</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-logo-dark">E-mail / NPM</label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Insert active e-mail or NPM"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-logo-dark">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Insert password"
              className="w-full px-4 py-3 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3.5 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium cursor-pointer active:scale-98 transition"
          >
            Login
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          Don&apos;t have an account yet?{' '}
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="text-link font-semibold underline cursor-pointer"
          >
            Register
          </button>
        </p>
      </div>
    </main>
  );
}