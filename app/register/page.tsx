'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    faculty: '',
    npm: '',
    email: '',
    whatsapp: '',
    line: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save user registration data later
    router.push('/home');
  };

  return (
    <main className="min-h-dvh bg-background flex flex-col px-6 py-8">
      {/* Top Back Button */}
      <button
        onClick={() => router.back()}
        className="self-start text-logo-dark text-xl font-bold mb-4 cursor-pointer"
        aria-label="Go back"
      >
        ←
      </button>

      <div className="max-w-[340px] w-full mx-auto pb-8">
        <h1 className="font-logo text-3xl text-logo-dark mb-1">Create Account</h1>
        <p className="text-sm text-muted mb-6">Fill in your student &amp; contact details</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Student Details */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-logo-dark">Name</label>
            <input
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Insert full name"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-logo-dark">Faculty</label>
            <input
              name="faculty"
              type="text"
              required
              value={formData.faculty}
              onChange={handleChange}
              placeholder="e.g. Ilmu Komputer"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-logo-dark">NPM</label>
            <input
              name="npm"
              type="text"
              required
              value={formData.npm}
              onChange={handleChange}
              placeholder="Insert NPM"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
            />
          </div>

          {/* Contact Group (Matches your Profile Page card!) */}
          <div className="mt-1 p-3.5 rounded-2xl border border-border-soft bg-card/50 flex flex-col gap-3">
            <span className="text-sm font-semibold text-logo-dark">Contact Info</span>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-logo-dark">E-mail</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Insert active E-mail"
                className="w-full px-3.5 py-2 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-logo-dark">WhatsApp</label>
              <input
                name="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="Insert WhatsApp number"
                className="w-full px-3.5 py-2 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-logo-dark">LINE</label>
              <input
                name="line"
                type="text"
                value={formData.line}
                onChange={handleChange}
                placeholder="Insert LINE id"
                className="w-full px-3.5 py-2 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-logo-dark">Password</label>
            <input
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full px-4 py-2.5 rounded-xl bg-card border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-3 py-3.5 px-5 bg-primary text-primary-foreground rounded-xl text-sm font-medium cursor-pointer active:scale-98 transition"
          >
            Register
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => router.push('/login-regis-form')}
            className="text-link font-semibold underline cursor-pointer"
          >
            Login
          </button>
        </p>
      </div>
    </main>
  );
}