"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, inputClass } from "@/components/FormFields";
import { CATEGORIES, type CampusLocationOption, type Report } from "@/lib/report-data";
import { MIN_DESCRIPTION_WORDS } from "@/lib/report-form";

function campusInput(iso: string) {
  const campusOffset = 7 * 60 * 60 * 1000;
  return new Date(Date.parse(iso) + campusOffset).toISOString().slice(0, -1);
}

function sameDateTime(value: string, initial: string) {
  return value === initial || (Boolean(value && initial) && Date.parse(`${value}+07:00`) === Date.parse(`${initial}+07:00`));
}

export default function EditReportForm({ report, locations }: {
  report: Report;
  locations: CampusLocationOption[];
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isLost = report.type === "lost";
  const eventStart = campusInput(report.eventDate);
  const initial = {
    itemName: report.itemName,
    category: report.category,
    description: report.description,
    status: report.status,
    locationId: report.locationId,
    locationDetail: report.locationDetail ?? "",
    contact: report.contact,
    lostFrom: eventStart,
    lostUntil: report.eventUntil ? campusInput(report.eventUntil) : "",
    foundDate: eventStart.slice(0, 10),
    foundTime: report.eventTimeKnown === false ? "" : eventStart.slice(11, 19),
    currentPosition: report.currentPosition ?? "",
  };
  const detailHref = `/reports/${report.id}`;

  async function saveReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    const fields = new FormData(event.currentTarget);
    const changes: Record<string, string | null> = {};
    for (const [name, original] of Object.entries(initial)) {
      if (!fields.has(name)) continue;
      const value = String(fields.get(name) ?? "").trim();
      if (name === "lostFrom" || name === "lostUntil") {
        if (!sameDateTime(value, original)) changes[name] = value ? `${value}+07:00` : null;
      } else if (name === "foundTime") {
        const time = value.length === 5 ? `${value}:00` : value;
        if (time !== original) changes[name] = value || null;
      } else if (value !== original.trim()) {
        changes[name] = value;
      }
    }
    if (Object.keys(changes).length === 0) {
      router.replace(detailHref);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/v1/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        setError(response.status === 401
          ? "Sign in again to save your changes."
          : result?.error ?? "Could not save the report. Please try again.");
        return;
      }
      router.replace(detailHref);
      router.refresh();
    } catch {
      setError("Could not save the report. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={saveReport}>
      <fieldset disabled={saving} className="flex min-w-0 flex-col gap-4">
        <Field id="itemName" label="Item Name">
          <input id="itemName" name="itemName" defaultValue={initial.itemName} maxLength={200} required className={inputClass} />
        </Field>
        <Field id="category" label="Category">
          <select id="category" name="category" defaultValue={initial.category} required className={inputClass}>
            {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
        </Field>
        <Field id="description" label="Description" hint={`Use at least ${MIN_DESCRIPTION_WORDS} words.`}>
          <textarea id="description" name="description" defaultValue={initial.description} maxLength={5000} rows={5} required className={inputClass} />
        </Field>
        <Field id="status" label="Status">
          <select id="status" name="status" defaultValue={initial.status} className={inputClass}>
            <option value="OPEN">{isLost ? "Still Lost" : "Open"}</option>
            <option value="CLAIM_PENDING">Claim Pending</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </Field>
        <Field id="locationId" label={isLost ? "Last seen at" : "Found at"}>
          <select id="locationId" name="locationId" defaultValue={initial.locationId} required className={inputClass}>
            {locations.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </Field>
        <Field id="locationDetail" label="Location detail" optional>
          <input id="locationDetail" name="locationDetail" defaultValue={initial.locationDetail} maxLength={500} className={inputClass} />
        </Field>
        {isLost ? (
          <>
            <Field id="lostFrom" label="Possibly lost from (WIB)">
              <input id="lostFrom" name="lostFrom" type="datetime-local" step="any" defaultValue={initial.lostFrom} required className={inputClass} />
            </Field>
            <Field id="lostUntil" label="Until (WIB)" optional>
              <input id="lostUntil" name="lostUntil" type="datetime-local" step="any" defaultValue={initial.lostUntil} className={inputClass} />
            </Field>
          </>
        ) : (
          <>
            <Field id="foundDate" label="Date found (WIB)">
              <input id="foundDate" name="foundDate" type="date" defaultValue={initial.foundDate} required className={inputClass} />
            </Field>
            <Field id="foundTime" label="Time found (WIB)" optional>
              <input id="foundTime" name="foundTime" type="time" step={1} defaultValue={initial.foundTime} className={inputClass} />
            </Field>
            <Field id="currentPosition" label="Item is currently">
              <input id="currentPosition" name="currentPosition" defaultValue={initial.currentPosition} maxLength={500} required className={inputClass} />
            </Field>
          </>
        )}
        <Field id="contact" label="Contact person">
          <input id="contact" name="contact" defaultValue={initial.contact} maxLength={300} required className={inputClass} />
        </Field>
        {error && <p role="alert" className="text-sm font-semibold text-status-lost">{error}</p>}
        <div className="flex items-center gap-3">
          <Link href={detailHref} className="flex min-h-12 items-center rounded-full border-4 border-primary px-5 font-bold text-primary">
            Cancel
          </Link>
          <button type="submit" className="min-h-12 rounded-full bg-primary px-5 font-bold text-primary-foreground disabled:opacity-60">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}
