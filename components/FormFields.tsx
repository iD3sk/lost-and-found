"use client";

import { ImagePlus, X } from "lucide-react";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_MB,
  type PhotoItem,
} from "@/lib/report-form";
import { useState } from "react";

export const inputClass =
  "w-full rounded-3xl border-4 border-border-soft bg-background px-4 py-2.5 placeholder:text-placeholder focus:border-primary focus:outline-none aria-[invalid=true]:border-status-lost";

export function Field({
  id,
  label,
  optional,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-lg font-bold">
        {label}
        {optional ? (
          <span className="ml-1 text-sm font-normal text-muted">(optional)</span>
        ) : null}
      </label>
      {children}
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm font-semibold text-status-lost">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Pemilih foto: png/jpg, maks `max` foto, dengan preview & tombol hapus. */
export function PhotoPicker({
  photos,
  max,
  required,
  error,
  onAdd,
  onRemove,
}: {
  photos: PhotoItem[];
  max: number;
  required?: boolean;
  error?: string;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
}) {
  const [pickError, setPickError] = useState<string | null>(null);
  const full = photos.length >= max;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // supaya foto yang sama bisa dipilih ulang
    if (picked.length === 0) return;

    const problems: string[] = [];
    const valid = picked.filter((f) => {
      if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
        problems.push(`${f.name}: only PNG or JPG.`);
        return false;
      }
      if (f.size > MAX_FILE_MB * 1024 * 1024) {
        problems.push(`${f.name}: larger than ${MAX_FILE_MB} MB.`);
        return false;
      }
      return true;
    });

    const room = max - photos.length;
    if (valid.length > room) problems.push(`Only ${max} photos allowed.`);
    onAdd(valid.slice(0, Math.max(room, 0)));
    setPickError(problems.length ? problems.join(" ") : null);
  }

  const message = pickError ?? error;

  return (
    <div data-invalid={error ? "true" : undefined}>
      <p className="mb-1 text-lg font-bold">
        Photos
        {required ? null : (
          <span className="ml-1 text-sm font-normal text-muted">(optional)</span>
        )}
      </p>

      <ul className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <li key={p.id} className="relative aspect-square overflow-hidden rounded-2xl bg-border-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(p.id)}
              aria-label={`Remove photo ${i + 1}`}
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </li>
        ))}

        {!full && (
          <li>
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-4 border-dashed border-border-soft text-center text-sm font-semibold text-muted focus-within:border-primary">
              <ImagePlus size={28} aria-hidden="true" />
              Add photo
              <input
                type="file"
                accept="image/png,image/jpeg"
                multiple
                onChange={handleChange}
                className="sr-only"
              />
            </label>
          </li>
        )}
      </ul>

      <p className="mt-1 text-sm text-muted">
        PNG or JPG, up to {max} photos ({photos.length}/{max}), max {MAX_FILE_MB} MB each.
      </p>
      {message ? (
        <p role="alert" className="mt-1 text-sm font-semibold text-status-lost">
          {message}
        </p>
      ) : null}
    </div>
  );
}