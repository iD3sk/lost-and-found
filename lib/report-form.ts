import type { ReportType } from "@/lib/mock-data";

export const MIN_DESCRIPTION_WORDS = 15;
export const MAX_PHOTOS = 10;
export const MAX_LOST_LOCATIONS = 3;
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
  locations: string[]; // lost: 1-3, found: tepat 1
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
  locations: [],
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

function isFuture(value: string): boolean {
  const t = new Date(value).getTime();
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
    if (type === "lost") {
      if (d.locations.length < 1) e.locations = "Pick at least 1 location.";
      if (!d.lostFrom) {
        e.lostFrom = "Choose when it may have been lost.";
      } else if (isFuture(d.lostFrom)) {
        e.lostFrom = "This time cannot be in the future.";
      }
      if (d.lostUntil) {
        if (d.lostFrom && new Date(d.lostUntil) < new Date(d.lostFrom)) {
          e.lostUntil = "The end time must be after the start time.";
        } else if (isFuture(d.lostUntil)) {
          e.lostUntil = "This time cannot be in the future.";
        }
      }
    } else {
      if (d.locations.length !== 1) e.locations = "Choose where you found it.";
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
  d.locations.forEach((l) => fd.append("locations", l));

  if (type === "lost") {
    fd.append("lostFrom", new Date(d.lostFrom).toISOString());
    if (d.lostUntil) fd.append("lostUntil", new Date(d.lostUntil).toISOString());
  } else {
    fd.append("foundDate", d.foundDate);
    if (d.foundTime) fd.append("foundTime", d.foundTime);
    fd.append("currentPosition", d.currentPosition.trim());
  }

  d.photos.forEach((p) => fd.append("images", p.file));
  return fd;
}

export interface SubmitResult {
  id?: string;
  status: "OPEN" | "CLAIM_PENDING" | "RESOLVED";
}

/**
 * TODO (checkpoint 3): ganti simulasi ini dengan request asli, mis.
 *
 *   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
 *     method: "POST",
 *     body: buildFormData(type, draft),   // jangan set Content-Type manual
 *   });
 *   if (!res.ok) throw new Error("Failed to submit report");
 *   return res.json();
 */
export async function submitReport(
  type: ReportType,
  draft: ReportDraft,
): Promise<SubmitResult> {
  const body = buildFormData(type, draft);
  console.log("submit report", Object.fromEntries(body.entries()));
  await new Promise((r) => setTimeout(r, 800));
  return { status: "OPEN" };
}