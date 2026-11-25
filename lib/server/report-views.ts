import { connection } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import type { AppNotification, Report, ReportComment } from "@/lib/report-data";
import { getDb } from "./db";
import { reportRelations } from "./reports";

function reportView(row: Prisma.ReportGetPayload<{ include: typeof reportRelations }>): Report {
  const isLost = row.type === "LOST";
  const location = row.location.campusLocation;
  let eventDate = (row.lostFrom ?? row.createdAt).toISOString();
  if (!isLost && row.foundDate) {
    const date = row.foundDate.toISOString().slice(0, 10);
    const time = row.foundTime?.toISOString().slice(11, 19) ?? "00:00:00";
    eventDate = new Date(`${date}T${time}+07:00`).toISOString();
  }

  return {
    id: row.id,
    type: isLost ? "lost" : "found",
    itemName: row.itemName,
    category: row.category[0] + row.category.slice(1).toLowerCase(),
    description: row.description,
    locationId: location.id,
    locations: [location.name],
    locationDetail: row.location.locationDetail ?? undefined,
    contact: row.contact,
    status: row.status,
    images: row.images.map(({ imageUrl }) => imageUrl),
    eventDate,
    eventTimeKnown: isLost || row.foundTime !== null,
    eventUntil: row.lostUntil?.toISOString(),
    currentPosition: row.currentPosition ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listReportViews(where?: Prisma.ReportWhereInput, take?: number) {
  await connection();
  const rows = await getDb().report.findMany({
    where,
    take,
    include: reportRelations,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });
  return rows.map(reportView);
}

export async function findReportView(id: string) {
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) return null;
  await connection();
  const row = await getDb().report.findUnique({ where: { id }, include: reportRelations });
  return row ? { ...reportView(row), ownerNpm: row.userNpm } : null;
}

export async function reportComments(reportId: string): Promise<ReportComment[]> {
  const comments = await getDb().comment.findMany({
    where: { reportId },
    select: { id: true, content: true, createdAt: true, user: { select: { name: true } } },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return comments.map((comment) => ({ ...comment, createdAt: comment.createdAt.toISOString() }));
}

export async function campusLocationOptions() {
  await connection();
  return getDb().campusLocation.findMany({
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

export async function notificationViews(userNpm: string): Promise<AppNotification[]> {
  await connection();
  const rows = await getDb().notification.findMany({
    where: { userNpm },
    omit: { userNpm: true },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });
  return rows.map((row) => ({
    ...row,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
  }));
}
