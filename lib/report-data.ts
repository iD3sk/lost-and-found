export type ReportType = "lost" | "found";
export type ReportStatus = "OPEN" | "CLAIM_PENDING" | "RESOLVED";

export interface CampusLocationOption {
  id: string;
  name: string;
}

export interface Report {
  id: string;
  type: ReportType;
  itemName: string;
  category: string;
  description: string;
  locationId: string;
  locations: string[];
  locationDetail?: string;
  contact: string;
  status: ReportStatus;
  images: string[];
  eventDate: string;
  eventTimeKnown?: boolean;
  eventUntil?: string;
  currentPosition?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  reportId: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Documents",
  "Bags",
  "Clothing",
  "Bottles",
  "Vehicles",
  "Others",
];

const dateOptions = { dateStyle: "medium", timeZone: "Asia/Jakarta" } as const;
const dateFormatter = new Intl.DateTimeFormat("id-ID", dateOptions);
const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", { ...dateOptions, timeStyle: "short" });

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}
