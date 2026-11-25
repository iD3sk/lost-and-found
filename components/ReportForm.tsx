"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Pencil } from "lucide-react";
import { Field, PhotoPicker, inputClass } from "@/components/FormFields";
import { StatusPill } from "@/components/ReportBadges";
import { CATEGORIES, type CampusLocationOption, type ReportType } from "@/lib/report-data";
import {
  CONTACT_METHODS,
  MAX_PHOTOS,
  MIN_DESCRIPTION_WORDS,
  countWords,
  emptyDraft,
  submitReport,
  validateStep,
  type DraftErrors,
  type PhotoItem,
  type ReportDraft,
  type SubmitResult,
} from "@/lib/report-form";

const STEPS = ["Item details", "Location & time", "Contact", "Review"];
const LAST_STEP = STEPS.length - 1;

function fmtLocal(value: string, withTime = true): string {
  const d = new Date(withTime ? value : `${value}T00:00`);
  return d.toLocaleString("id-ID", {
    dateStyle: "medium",
    ...(withTime ? { timeStyle: "short" as const } : {}),
  });
}

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex min-h-11 items-center gap-1 text-sm font-semibold text-link"
        >
          <Pencil size={16} aria-hidden="true" />
          Edit
        </button>
      </div>
      <dl className="flex flex-col gap-2">{children}</dl>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="break-words">{children}</dd>
    </div>
  );
}

export default function ReportForm({ type, locations }: { type: ReportType; locations: CampusLocationOption[] }) {
  const isLost = type === "lost";

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ReportDraft>(emptyDraft);
  const [errors, setErrors] = useState<DraftErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  // Bebaskan object URL preview saat form ditutup
  const photosRef = useRef<PhotoItem[]>([]);
  useEffect(() => {
    photosRef.current = draft.photos;
  }, [draft.photos]);
  useEffect(() => {
    return () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url));
  }, []);

  function update<K extends keyof ReportDraft>(key: K, value: ReportDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function addPhotos(files: File[]) {
    if (files.length === 0) return;
    const items: PhotoItem[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      url: URL.createObjectURL(file),
    }));
    setDraft((d) => ({ ...d, photos: [...d.photos, ...items] }));
    setErrors((e) => (e.photos ? { ...e, photos: undefined } : e));
  }

  function removePhoto(id: string) {
    const target = draft.photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setDraft((d) => ({ ...d, photos: d.photos.filter((p) => p.id !== id) }));
  }

  function showErrors(found: DraftErrors) {
    setErrors(found);
    requestAnimationFrame(() => {
      document
        .querySelector('[aria-invalid="true"], [data-invalid="true"]')
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
  }

  function goTo(next: number) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function goNext() {
    const found = validateStep(type, step, draft);
    if (Object.keys(found).length > 0) return showErrors(found);
    setErrors({});
    goTo(step + 1);
  }

  async function handleSubmit() {
    // validasi ulang semua langkah sebelum kirim
    for (let s = 0; s < LAST_STEP; s++) {
      const found = validateStep(type, s, draft);
      if (Object.keys(found).length > 0) {
        goTo(s);
        return showErrors(found);
      }
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      setResult(await submitReport(type, draft));
      window.scrollTo({ top: 0 });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not submit the report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step === LAST_STEP) void handleSubmit();
    else goNext();
  }

  /* ---------- Setelah submit: label status ---------- */
  if (result) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-3 px-4 pb-28 pt-12 text-center">
        <CheckCircle2 size={64} aria-hidden="true" className="text-primary" />
        <h2 className="text-2xl font-bold">Report submitted!</h2>
        <p>
          Your {type} report for <strong>{draft.itemName}</strong> is now listed.
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Status</span>
          <StatusPill report={{ type, status: result.status }} className="text-sm" />
        </div>
        <div className="mt-4 flex w-full flex-col gap-2">
          {result.id ? (
            <Link
              href={`/reports/${result.id}`}
              className="flex min-h-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
            >
              View my report
            </Link>
          ) : null}
          <Link
            href="/explore"
            className="flex min-h-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground"
          >
            See all reports
          </Link>
          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-full border-4 border-primary font-bold text-primary"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const words = countWords(draft.description);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-32 pt-4"
    >
      {/* Progress */}
      <div>
        <ol className="flex gap-1.5" aria-label="Form progress">
          {STEPS.map((s, i) => (
            <li
              key={s}
              aria-current={i === step ? "step" : undefined}
              className={`h-2 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-chip-inactive"}`}
            />
          ))}
        </ol>
        <p className="mt-2 text-sm text-muted">
          Step {step + 1} of {STEPS.length} · {STEPS[step]}
        </p>
      </div>

      {/* ---------- Step 1: detail barang ---------- */}
      {step === 0 && (
        <>
          <Field id="itemName" label="Item Name" error={errors.itemName}>
            <input
              id="itemName"
              value={draft.itemName}
              onChange={(e) => update("itemName", e.target.value)}
              placeholder="e.g. Black AirPods Case"
              maxLength={100}
              aria-invalid={errors.itemName ? true : undefined}
              aria-describedby={errors.itemName ? "itemName-error" : undefined}
              className={inputClass}
            />
          </Field>

          <Field id="category" label="Category" error={errors.category}>
            <select
              id="category"
              value={draft.category}
              onChange={(e) => update("category", e.target.value)}
              aria-invalid={errors.category ? true : undefined}
              aria-describedby={errors.category ? "category-error" : undefined}
              className={inputClass}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="description"
            label="Description"
            error={errors.description}
            hint={
              <span className={words >= MIN_DESCRIPTION_WORDS ? "text-primary" : ""}>
                {words} / {MIN_DESCRIPTION_WORDS} words minimum. Mention color, brand, or unique marks.
              </span>
            }
          >
            <textarea
              id="description"
              rows={5}
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Describe the item and its distinguishing features"
              aria-invalid={errors.description ? true : undefined}
              aria-describedby={errors.description ? "description-error" : undefined}
              className={inputClass}
            />
          </Field>

          <PhotoPicker
            photos={draft.photos}
            max={MAX_PHOTOS}
            required={!isLost}
            error={errors.photos}
            onAdd={addPhotos}
            onRemove={removePhoto}
          />
        </>
      )}

      {/* ---------- Step 2: lokasi & waktu ---------- */}
      {step === 1 && (
        <Field id="location" label={isLost ? "Last seen at" : "Found at"} error={errors.locationId}>
          <select
            id="location"
            value={draft.locationId}
            onChange={(e) => update("locationId", e.target.value)}
            aria-invalid={errors.locationId ? true : undefined}
            aria-describedby={errors.locationId ? "location-error" : undefined}
            className={inputClass}
          >
            <option value="">Select a location</option>
            {locations.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </Field>
      )}

      {step === 1 && isLost && (
        <>
          <Field id="lostFrom" label="Possibly lost from" error={errors.lostFrom}>
            <input
              id="lostFrom"
              type="datetime-local"
              value={draft.lostFrom}
              onChange={(e) => update("lostFrom", e.target.value)}
              aria-invalid={errors.lostFrom ? true : undefined}
              aria-describedby={errors.lostFrom ? "lostFrom-error" : undefined}
              className={inputClass}
            />
          </Field>

          <Field
            id="lostUntil"
            label="Until"
            optional
            hint="Fill this if you only know a time range."
            error={errors.lostUntil}
          >
            <input
              id="lostUntil"
              type="datetime-local"
              value={draft.lostUntil}
              onChange={(e) => update("lostUntil", e.target.value)}
              aria-invalid={errors.lostUntil ? true : undefined}
              aria-describedby={errors.lostUntil ? "lostUntil-error" : undefined}
              className={inputClass}
            />
          </Field>
        </>
      )}

      {step === 1 && !isLost && (
        <>
          <Field id="foundDate" label="Date found" error={errors.foundDate}>
            <input
              id="foundDate"
              type="date"
              value={draft.foundDate}
              onChange={(e) => update("foundDate", e.target.value)}
              aria-invalid={errors.foundDate ? true : undefined}
              aria-describedby={errors.foundDate ? "foundDate-error" : undefined}
              className={inputClass}
            />
          </Field>

          <Field id="foundTime" label="Time found" optional>
            <input
              id="foundTime"
              type="time"
              value={draft.foundTime}
              onChange={(e) => update("foundTime", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field
            id="currentPosition"
            label="Item is currently"
            hint="Where can the owner pick it up?"
            error={errors.currentPosition}
          >
            <input
              id="currentPosition"
              value={draft.currentPosition}
              onChange={(e) => update("currentPosition", e.target.value)}
              placeholder="e.g. With the security post"
              aria-invalid={errors.currentPosition ? true : undefined}
              aria-describedby={errors.currentPosition ? "currentPosition-error" : undefined}
              className={inputClass}
            />
          </Field>
        </>
      )}

      {/* ---------- Step 3: kontak ---------- */}
      {step === 2 && (
        <>
          <Field id="contactMethod" label="Contact method">
            <select
              id="contactMethod"
              value={draft.contactMethod}
              onChange={(e) => update("contactMethod", e.target.value)}
              className={inputClass}
            >
              {CONTACT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="contactValue"
            label="Contact person"
            hint="This will be shown on the report so people can reach you."
            error={errors.contactValue}
          >
            <input
              id="contactValue"
              type={draft.contactMethod === "E-mail" ? "email" : "text"}
              inputMode={draft.contactMethod === "WhatsApp" ? "tel" : undefined}
              value={draft.contactValue}
              onChange={(e) => update("contactValue", e.target.value)}
              placeholder={
                draft.contactMethod === "WhatsApp"
                  ? "e.g. 081234567890"
                  : draft.contactMethod === "E-mail"
                    ? "e.g. name@ui.ac.id"
                    : "e.g. your_id"
              }
              aria-invalid={errors.contactValue ? true : undefined}
              aria-describedby={errors.contactValue ? "contactValue-error" : undefined}
              className={inputClass}
            />
          </Field>
        </>
      )}

      {/* ---------- Step 4: review ---------- */}
      {step === LAST_STEP && (
        <>
          <ReviewSection title="Item" onEdit={() => goTo(0)}>
            <Row label="Name">{draft.itemName}</Row>
            <Row label="Category">{draft.category}</Row>
            <Row label="Description">{draft.description}</Row>
            <Row label="Photos">
              {draft.photos.length === 0 ? (
                "No photos"
              ) : (
                <span className="mt-1 grid grid-cols-4 gap-1.5">
                  {draft.photos.map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.id}
                      src={p.url}
                      alt={`Photo ${i + 1}`}
                      className="aspect-square rounded-xl object-cover"
                    />
                  ))}
                </span>
              )}
            </Row>
          </ReviewSection>

          <ReviewSection title="Location & time" onEdit={() => goTo(1)}>
            <Row label={isLost ? "Last seen at" : "Found at"}>
              {locations.find(({ id }) => id === draft.locationId)?.name}
            </Row>
            {isLost ? (
              <Row label="Possibly lost">
                {fmtLocal(draft.lostFrom)}
                {draft.lostUntil ? ` – ${fmtLocal(draft.lostUntil)}` : ""}
              </Row>
            ) : (
              <>
                <Row label="Found on">
                  {fmtLocal(draft.foundDate, false)}
                  {draft.foundTime ? `, ${draft.foundTime}` : ""}
                </Row>
                <Row label="Item is currently">{draft.currentPosition}</Row>
              </>
            )}
          </ReviewSection>

          <ReviewSection title="Contact" onEdit={() => goTo(2)}>
            <Row label={draft.contactMethod}>{draft.contactValue}</Row>
          </ReviewSection>

          {submitError ? (
            <p role="alert" className="text-center text-sm font-semibold text-status-lost">
              {submitError}
            </p>
          ) : null}
        </>
      )}

      {/* Bar tombol di bawah layar, selebar kolom input */}
      <div className="safe-bottom fixed inset-x-0 bottom-0 mx-auto flex w-full max-w-md gap-2 px-4 py-2">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={submitting}
            className="min-h-12 flex-1 rounded-full border-4 border-primary bg-background text-lg font-bold text-primary shadow-lg disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="min-h-12 flex-[2] rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-lg active:scale-[0.98] disabled:opacity-60"
        >
          {step === LAST_STEP ? (submitting ? "Submitting…" : "Submit") : "Continue"}
        </button>
      </div>
    </form>
  );
}
