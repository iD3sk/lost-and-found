import type { ReportType } from "@/lib/report-data";

export const MIN_DESCRIPTION_WORDS = 15;
export const MAX_PHOTOS = 10;
export const MAX_FILE_MB = 5; // batas per foto, sesuaikan dengan backend/Cloudinary
export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg"];
export const CONTACT_METHODS = ["WhatsApp", "LINE", "Instagram", "E-mail"] as const;

export interface PhotoItem {
  id: string;
  file: File;
  url: string; // object URL untuk preview
}

export interface ReportDraft {
  itemName: string;
  category: string;
  description: string;
  photos: PhotoItem[];
  locationId: string;
  lostFrom: string; // datetime-local
  lostUntil: string; // datetime-local (opsional)
  foundDate: string; // yyyy-mm-dd
  foundTime: string; // HH:mm (opsional)
  currentPosition: string; // khusus found
  contactMethod: string;
  contactValue: string;
}

export type DraftErrors = Partial<Record<keyof ReportDraft, string>>;

export const emptyDraft: ReportDraft = {
  itemName: "",
  category: "",
  description: "",
  photos: [],
  locationId: "",
  lostFrom: "",
  lostUntil: "",
  foundDate: "",
  foundTime: "",
  currentPosition: "",
  contactMethod: CONTACT_METHODS[0],
  contactValue: "",
};

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function campusDateTime(value: string) {
  return new Date(`${value}+07:00`);
}

function isFuture(value: string): boolean {
  const t = campusDateTime(value).getTime();
  return !Number.isNaN(t) && t > Date.now();
}

/** Validasi satu langkah. Kembalikan {} kalau semua valid. */
export function validateStep(
  type: ReportType,
  step: number,
  d: ReportDraft,
): DraftErrors {
  const e: DraftErrors = {};

  if (step === 0) {
    if (!d.itemName.trim()) e.itemName = "Item name is required.";
    if (!d.category) e.category = "Please choose a category.";
    const words = countWords(d.description);
    if (words < MIN_DESCRIPTION_WORDS) {
      e.description = `Describe the item in at least ${MIN_DESCRIPTION_WORDS} words (now ${words}).`;
    }
    if (type === "found" && d.photos.length < 1) {
      e.photos = "Add at least 1 photo of the item.";
    }
  }

  if (step === 1) {
    if (!d.locationId) e.locationId = "Choose a location.";
    if (type === "lost") {
      if (!d.lostFrom) {
        e.lostFrom = "Choose when it may have been lost.";
      } else if (isFuture(d.lostFrom)) {
        e.lostFrom = "This time cannot be in the future.";
      }
      if (d.lostUntil) {
        if (d.lostFrom && campusDateTime(d.lostUntil) < campusDateTime(d.lostFrom)) {
          e.lostUntil = "The end time must be after the start time.";
        } else if (isFuture(d.lostUntil)) {
          e.lostUntil = "This time cannot be in the future.";
        }
      }
    } else {
      if (!d.foundDate) {
        e.foundDate = "Choose the date you found it.";
      } else if (isFuture(`${d.foundDate}T${d.foundTime || "00:00"}`)) {
        e.foundDate = "This date and time cannot be in the future.";
      }
      if (!d.currentPosition.trim()) {
        e.currentPosition = "Tell where the item is right now.";
      }
    }
  }

  if (step === 2) {
    const v = d.contactValue.trim();
    if (!v) {
      e.contactValue = "Contact person is required.";
    } else if (d.contactMethod === "E-mail" && !/^\S+@\S+\.\S+$/.test(v)) {
      e.contactValue = "Enter a valid e-mail address.";
    } else if (
      d.contactMethod === "WhatsApp" &&
      !/^\+?[0-9\s-]{8,16}$/.test(v)
    ) {
      e.contactValue = "Enter a valid phone number, e.g. 081234567890.";
    }
  }

  return e;
}

/** Format kirim ke backend: multipart/form-data supaya foto ikut terkirim. */
export function buildFormData(type: ReportType, d: ReportDraft): FormData {
  const fd = new FormData();
  fd.append("type", type === "lost" ? "LOST" : "FOUND");
  fd.append("itemName", d.itemName.trim());
  fd.append("category", d.category);
  fd.append("description", d.description.trim());
  fd.append("contact", `${d.contactMethod}: ${d.contactValue.trim()}`);
  fd.append("locationId", d.locationId);

  if (type === "lost") {
    fd.append("lostFrom", campusDateTime(d.lostFrom).toISOString());
    if (d.lostUntil) fd.append("lostUntil", campusDateTime(d.lostUntil).toISOString());
  } else {
    fd.append("foundDate", d.foundDate);
    if (d.foundTime) fd.append("foundTime", d.foundTime);
    fd.append("currentPosition", d.currentPosition.trim());
  }

  d.photos.forEach((p) => fd.append("images", p.file));
  return fd;
}

export interface SubmitResult {
  id: string;
  status: "OPEN" | "CLAIM_PENDING" | "RESOLVED";
}

export async function submitReport(
  type: ReportType,
  draft: ReportDraft,
): Promise<SubmitResult> {
  const response = await fetch("/api/v1/reports", { method: "POST", body: buildFormData(type, draft) });
  const result = await response.json().catch(() => null);
  if (!response.ok || typeof result?.id !== "string" ||
      !["OPEN", "CLAIM_PENDING", "RESOLVED"].includes(result.status)) {
    throw new Error(response.status === 401
      ? "Sign in with SSO UI to submit a report."
      : typeof result?.error === "string" ? result.error : "Could not submit the report. Please try again.");
  }
  return result;
}
