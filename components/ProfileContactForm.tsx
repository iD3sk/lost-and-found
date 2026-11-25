"use client";

import { useState, type FormEvent } from "react";

export default function ProfileContactForm({ initialContact }: { initialContact: string }) {
  const [contact, setContact] = useState(initialContact);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/v1/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: contact.trim() || null }),
      });
      setMessage(response.ok ? "Contact saved." : "Could not save contact. Please try again.");
    } catch {
      setMessage("Could not save contact. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveContact} className="flex flex-col gap-2">
      <label htmlFor="profile-contact" className="text-sm font-semibold text-logo-dark">Contact</label>
      <input
        id="profile-contact"
        value={contact}
        maxLength={300}
        onChange={(event) => setContact(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-border-soft bg-card px-4 py-2.5 focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={saving}
        className="min-h-11 self-start rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save contact"}
      </button>
      {message && <p role="status" className="text-sm text-foreground">{message}</p>}
    </form>
  );
}
