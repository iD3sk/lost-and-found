import { randomUUID } from "node:crypto";
import { ReportType } from "@/generated/prisma/client";
import { getDb } from "@/lib/server/db";
import { ApiError, allowFields, api, multipartBody, requireUser } from "@/lib/server/http";
import { multipartLimit, withUploadedImages } from "@/lib/server/report-images";
import { editableReportFields, enumValue, escapeLike, locationFields, reportFields, reportFilters, reportRelations, reportResponse } from "@/lib/server/reports";

export const GET = api(async (request: Request) => {
  const search = new URL(request.url).searchParams;
  const reports = await getDb().$transaction(async (tx) =>
    tx.report.findMany({
      where: await reportFilters(search, tx),
      include: reportRelations,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    }), { isolationLevel: "RepeatableRead" },
  );
  return Response.json(reports.map(reportResponse));
});

export const POST = api(async (request: Request) => {
  const { npm } = await requireUser(request);
  const form = await multipartBody(request, multipartLimit);
  const files = form.getAll("images");
  const locations = form.getAll("locations");
  form.delete("images");
  form.delete("locations");
  const fields = Object.fromEntries(form);
  allowFields(fields, ["type", ...editableReportFields]);

  const type = enumValue(fields.type, "type", ReportType);
  if (type === "FOUND" && !files.length) throw new ApiError(400, "FOUND requires at least one image.");
  const data = reportFields(fields, type);
  const location = await locationFields(fields, locations);
  const reportId = randomUUID();

  const report = await withUploadedImages(reportId, files, (images) => getDb().$transaction(async (tx) => {
    const created = await tx.report.create({
      data: {
        ...data,
        id: reportId,
        type,
        user: { connect: { npm } },
        location: { create: location },
        images: { create: images },
      },
      include: reportRelations,
    });

    if (type === "FOUND") {
      const matches = await tx.report.findMany({
        where: {
          type: "LOST",
          status: "OPEN",
          category: data.category,
          itemName: { equals: escapeLike(data.itemName), mode: "insensitive" },
          location: { campusLocationId: location.campusLocationId },
          userNpm: { not: npm },
        },
        select: { userNpm: true },
        distinct: ["userNpm"],
      });
      if (matches.length) {
        await tx.notification.createMany({
          data: matches.map(({ userNpm }) => ({
            userNpm,
            reportId,
            message: `A found report may match your lost item: ${data.itemName}`,
          })),
        });
      }
    }

    return created;
  }));
  return Response.json(reportResponse(report), { status: 201 });
});
