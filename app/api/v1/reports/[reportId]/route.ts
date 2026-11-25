import { ReportStatus } from "@/generated/prisma/client";
import { getDb } from "@/lib/server/db";
import { ApiError, allowFields, api, jsonBody, requireUser, uuid } from "@/lib/server/http";
import { editableReportFields, enumValue, locationFields, lockOwnedReport, reportFields, reportRelations, reportResponse } from "@/lib/server/reports";

type Context = { params: Promise<{ reportId: string }> };

export const GET = api(async (_request: Request, { params }: Context) => {
  const id = uuid((await params).reportId, "reportId");
  const report = await getDb().report.findUnique({ where: { id }, include: reportRelations });
  if (!report) throw new ApiError(404, "Report not found.");
  return Response.json(reportResponse(report));
});

export const PATCH = api(async (request: Request, { params }: Context) => {
  const { npm } = await requireUser(request);
  const id = uuid((await params).reportId, "reportId");
  const data = await jsonBody(request);
  allowFields(data, ["status", ...editableReportFields]);
  if (!Object.keys(data).length) throw new ApiError(400, "Provide at least one report field.");

  const report = await getDb().$transaction(async (tx) => {
    await lockOwnedReport(tx, id, npm);
    const current = await tx.report.findUniqueOrThrow({
      where: { id },
      include: { location: true },
    });
    const status = "status" in data ? enumValue(data.status, "status", ReportStatus) : current.status;
    const locationKeys = ["locationId", "locationDetail", "latitude", "longitude"];
    const location = locationKeys.some((field) => field in data)
      ? await locationFields({ ...current.location, locationId: current.location.campusLocationId, ...data }, [], tx)
      : undefined;

    return tx.report.update({
      where: { id },
      data: {
        ...reportFields({ ...current, ...data }, current.type),
        status,
        resolvedAt: status === "RESOLVED" ? current.resolvedAt ?? new Date() : null,
        location: location ? { update: location } : undefined,
      },
      include: reportRelations,
    });
  });
  return Response.json(reportResponse(report));
});
