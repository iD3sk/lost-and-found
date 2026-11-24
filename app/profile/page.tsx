'use client';

import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import BottomNav from '@/components/BottomNav';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    faculty: '',
    npm: '',
    line: '',
    whatsapp: '',
    email: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-dvh bg-background pb-28 flex flex-col">
      {/* Your friend's PageHeader with Lucide ArrowLeft & Bell icons */}
      <PageHeader title="My Profile" backHref="/home" />

      {/* Main Content */}
      <main className="flex-1 px-7 pt-6 flex flex-col items-center max-w-md md:max-w-3xl w-full mx-auto">
        {/* Circular Profile Avatar */}
        <div className="w-28 h-28 rounded-full border-2 border-primary overflow-hidden bg-secondary mb-6 shadow-xs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
            alt="Profile avatar"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Form Fields */}
        <div className="w-full max-w-sm flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-logo-dark">Name:</label>
            <input
              name="name"
              type="text"
              value={profile.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-card/70 border border-border-soft focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-logo-dark">Faculty:</label>
            <input
              name="faculty"
              type="text"
              value={profile.faculty}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-card/70 border border-border-soft focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-logo-dark">NPM:</label>
            <input
              name="npm"
              type="text"
              value={profile.npm}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-card/70 border border-border-soft focus:outline-none focus:border-primary"
            />
          </div>

          {/* Contact Section */}
          <div className="mt-1 flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-logo-dark">Contact:</span>

            <div className="p-3.5 rounded-2xl border border-border-soft bg-card/40 flex flex-col gap-2.5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-logo-dark">LINE</label>
                <input
                  name="line"
                  type="text"
                  value={profile.line}
                  onChange={handleChange}
                  placeholder="Insert LINE id"
                  className="w-full px-3.5 py-2 rounded-xl bg-card/70 border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-logo-dark">WhatsApp</label>
                <input
                  name="whatsapp"
                  type="tel"
                  value={profile.whatsapp}
                  onChange={handleChange}
                  placeholder="Insert Whatsapp number"
                  className="w-full px-3.5 py-2 rounded-xl bg-card/70 border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-logo-dark">E-mail</label>
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="Insert active E-mail"
                  className="w-full px-3.5 py-2 rounded-xl bg-card/70 border border-border-soft placeholder:text-placeholder focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}