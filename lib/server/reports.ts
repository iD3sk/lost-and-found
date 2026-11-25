import { Prisma, ReportCategory, ReportStatus, ReportType } from "@/generated/prisma/client";
import { countWords, MIN_DESCRIPTION_WORDS } from "@/lib/report-form";
import { getDb } from "./db";
import { ApiError, optionalText, requiredText, uuid } from "./http";

export const reportRelations = {
  images: { orderBy: { createdAt: "asc" } },
  location: { include: { campusLocation: true } },
} satisfies Prisma.ReportInclude;

type ReportWithRelations = Prisma.ReportGetPayload<{ include: typeof reportRelations }>;

export function reportResponse(report: ReportWithRelations) {
  return {
    id: report.id,
    type: report.type,
    itemName: report.itemName,
    category: report.category,
    description: report.description,
    contact: report.contact,
    status: report.status,
    lostFrom: report.lostFrom,
    lostUntil: report.lostUntil,
    foundDate: report.foundDate?.toISOString().slice(0, 10) ?? null,
    foundTime: report.foundTime?.toISOString().slice(11, 19) ?? null,
    currentPosition: report.currentPosition,
    locationId: report.location.campusLocationId,
    location: report.location,
    images: report.images,
    createdAt: report.createdAt,
    updatedAt: report.updatedAt,
    resolvedAt: report.resolvedAt,
  };
}

export const editableReportFields = [
  "itemName", "category", "description", "contact", "lostFrom", "lostUntil",
  "foundDate", "foundTime", "currentPosition", "locationId", "locationDetail",
  "latitude", "longitude",
] as const;

export function enumValue<T extends string>(value: unknown, field: string, choices: Record<T, T>): T {
  const normalized = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!Object.hasOwn(choices, normalized)) {
    throw new ApiError(400, `${field} must be one of ${Object.values(choices).join(", ")}.`);
  }
  return choices[normalized as T];
}

export function dateValue(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) {
    throw new ApiError(400, `${field} must be a date in YYYY-MM-DD format.`);
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new ApiError(400, `${field} is not a valid date.`);
  }
  return value;
}

export function timeValue(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) {
    throw new ApiError(400, `${field} must be a time in HH:mm or HH:mm:ss format.`);
  }
  return value.length === 5 ? `${value}:00` : value;
}

function timestamp(value: unknown, field: string): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return value;
  if (typeof value !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new ApiError(400, `${field} must be an ISO datetime with a timezone.`);
  }
  dateValue(value.slice(0, 10), field);
  timeValue(value.match(/T(\d{2}:\d{2}(?::\d{2})?)/)?.[1], field);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new ApiError(400, `${field} is not a valid datetime.`);
  return parsed;
}

export function reportFields(data: Record<string, unknown>, type: ReportType) {
  const description = requiredText(data.description, "description", 5000);
  if (countWords(description) < MIN_DESCRIPTION_WORDS) {
    throw new ApiError(400, `description must have at least ${MIN_DESCRIPTION_WORDS} words.`);
  }

  const lostFrom = timestamp(data.lostFrom, "lostFrom");
  const lostUntil = timestamp(data.lostUntil, "lostUntil");
  const foundDate = data.foundDate == null || data.foundDate === "" ? null
    : data.foundDate instanceof Date ? data.foundDate.toISOString().slice(0, 10)
    : dateValue(data.foundDate, "foundDate");
  const foundTime = data.foundTime == null || data.foundTime === "" ? null
    : data.foundTime instanceof Date ? data.foundTime.toISOString().slice(11, 19)
    : timeValue(data.foundTime, "foundTime");
  const currentPosition = optionalText(data.currentPosition, "currentPosition", 500);
  const now = new Date();

  if (type === "LOST") {
    if (!lostFrom || foundDate || foundTime || currentPosition) {
      throw new ApiError(400, "LOST requires lostFrom and cannot include FOUND fields.");
    }
    if (lostFrom > now || (lostUntil && (lostUntil < lostFrom || lostUntil > now))) {
      throw new ApiError(400, "Invalid LOST time range.");
    }
  } else {
    if (!foundDate || !currentPosition || lostFrom || lostUntil) {
      throw new ApiError(400, "FOUND requires foundDate and currentPosition and cannot include LOST fields.");
    }
    if (new Date(`${foundDate}T${foundTime ?? "00:00:00"}+07:00`) > now) {
      throw new ApiError(400, "FOUND time cannot be in the future.");
    }
  }

  return {
    itemName: requiredText(data.itemName, "itemName", 200),
    category: enumValue(data.category, "category", ReportCategory),
    description,
    contact: requiredText(data.contact, "contact", 300),
    lostFrom,
    lostUntil,
    foundDate: foundDate ? new Date(`${foundDate}T00:00:00Z`) : null,
    foundTime: foundTime ? new Date(`1970-01-01T${foundTime}Z`) : null,
    currentPosition,
  };
}

function coordinate(value: unknown, field: string, limit: number) {
  if (value == null || value === "") return null;
  if (value instanceof Prisma.Decimal) return value;
  if (typeof value !== "number" && (typeof value !== "string" || !/^-?\d+(\.\d+)?$/.test(value))) {
    throw new ApiError(400, `${field} must be a decimal number.`);
  }
  const decimal = new Prisma.Decimal(value);
  if (!decimal.isFinite() || decimal.abs().gt(limit)) {
    throw new ApiError(400, `${field} must be between -${limit} and ${limit}.`);
  }
  return decimal;
}

export async function locationFields(
  data: Record<string, unknown>,
  locations: FormDataEntryValue[] = [],
  db: Prisma.TransactionClient = getDb(),
) {
  if (locations.length > 1 || (locations.length && data.locationId !== undefined)) {
    throw new ApiError(400, "Provide exactly one location per report.");
  }

  const campusLocation = locations.length
    ? await db.campusLocation.findFirst({ where: { name: requiredText(locations[0], "locations", 200) } })
    : await db.campusLocation.findUnique({ where: { id: uuid(data.locationId, "locationId") } });
  if (!campusLocation) throw new ApiError(400, "Campus location does not exist.");

  return {
    campusLocationId: campusLocation.id,
    locationDetail: optionalText(data.locationDetail, "locationDetail", 500),
    latitude: coordinate(data.latitude, "latitude", 90),
    longitude: coordinate(data.longitude, "longitude", 180),
  };
}

export async function lockOwnedReport(tx: Prisma.TransactionClient, reportId: string, npm: string) {
  const [report] = await tx.$queryRaw<{ type: ReportType }[]>`
    SELECT type FROM "REPORT" WHERE id = ${reportId}::uuid AND "userNpm" = ${npm} FOR UPDATE
  `;
  if (!report) throw new ApiError(404, "Report not found.");
  return report;
}

export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function reportFilters(search: URLSearchParams, db: Prisma.TransactionClient): Promise<Prisma.ReportWhereInput> {
  const keyword = optionalText(search.get("keyword"), "keyword", 200);
  const category = search.get("category");
  const status = search.get("status");
  const type = search.get("type");
  const locationId = search.get("locationId");

  const fromDate = search.has("dateFrom") ? dateValue(search.get("dateFrom"), "dateFrom") : null;
  const toDate = search.has("dateTo") ? dateValue(search.get("dateTo"), "dateTo") : null;
  const fromTime = search.has("timeFrom") ? timeValue(search.get("timeFrom"), "timeFrom") : null;
  const toTime = search.has("timeTo") ? timeValue(search.get("timeTo"), "timeTo") : null;
  if (fromDate && toDate && fromDate > toDate) throw new ApiError(400, "Invalid date range.");
  if (fromTime && toTime && fromTime > toTime) throw new ApiError(400, "Invalid time range.");

  const where: Prisma.ReportWhereInput = {
    itemName: keyword ? { contains: escapeLike(keyword), mode: "insensitive" } : undefined,
    category: category === null ? undefined : enumValue(category, "category", ReportCategory),
    status: status === null ? undefined : enumValue(status, "status", ReportStatus),
    type: type === null ? undefined : enumValue(type, "type", ReportType),
    location: locationId === null ? undefined : { campusLocationId: uuid(locationId, "locationId") },
  };
  if (!fromDate && !toDate && !fromTime && !toTime) return where;

  // The lost interval only needs to overlap the requested calendar/time window.
  // Date and time inputs refer to campus time (WIB).
  const ids = await db.$queryRaw<{ id: string }[]>`
    WITH events AS (
      SELECT id,
        CASE WHEN type = 'LOST'
          THEN ("lostFrom" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta'
          ELSE "foundDate" + COALESCE("foundTime", TIME '00:00:00')
        END AS starts_at,
        CASE WHEN type = 'LOST'
          THEN (COALESCE("lostUntil", "lostFrom") AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Jakarta'
          ELSE "foundDate" + COALESCE("foundTime", TIME '00:00:00')
        END AS ends_at
      FROM "REPORT"
      WHERE type = 'LOST' OR "foundTime" IS NOT NULL OR ${!fromTime && !toTime}
    ), clipped AS (
      SELECT id,
        GREATEST(starts_at, ${fromDate}::date::timestamp) AS first_at,
        LEAST(ends_at, ${toDate}::date + TIME '23:59:59.999999') AS last_at
      FROM events
      WHERE starts_at IS NOT NULL AND ends_at IS NOT NULL
    )
    SELECT id FROM clipped
    WHERE first_at <= last_at AND (
      (first_at::date = last_at::date
        AND first_at::time <= COALESCE(${toTime}::time, TIME '23:59:59.999999')
        AND last_at::time >= COALESCE(${fromTime}::time, TIME '00:00:00'))
      OR (first_at::date < last_at::date AND (
        last_at::date - first_at::date > 1
        OR first_at::time <= COALESCE(${toTime}::time, TIME '23:59:59.999999')
        OR last_at::time >= COALESCE(${fromTime}::time, TIME '00:00:00')
      ))
    )
  `;
  return { ...where, id: { in: ids.map(({ id }) => id) } };
}
