import { getDb } from "@/lib/server/db";
import { ApiError, api, multipartBody, requireUser, uuid } from "@/lib/server/http";
import { multipartLimit, withUploadedImages } from "@/lib/server/report-images";
import { lockOwnedReport } from "@/lib/server/reports";
import { MAX_PHOTOS } from "@/lib/report-form";

type Context = { params: Promise<{ reportId: string }> };

export const POST = api(async (request: Request, { params }: Context) => {
  const { npm } = await requireUser(request);
  const reportId = uuid((await params).reportId, "reportId");
  const db = getDb();
  const owned = await db.report.findUnique({ where: { id: reportId, userNpm: npm }, select: { id: true } });
  if (!owned) throw new ApiError(404, "Report not found.");

  const form = await multipartBody(request, multipartLimit);
  const files = form.getAll("images");
  if (!files.length) throw new ApiError(400, "Provide at least one image.");
  if (Array.from(form.keys()).some((field) => field !== "images")) {
    throw new ApiError(400, "Only the images field is allowed.");
  }

  const created = await withUploadedImages(reportId, files, (images) => db.$transaction(async (tx) => {
    await lockOwnedReport(tx, reportId, npm);
    const total = await tx.reportImage.count({ where: { reportId } });
    if (total + images.length > MAX_PHOTOS) {
      throw new ApiError(400, `A report may have at most ${MAX_PHOTOS} images.`);
    }
    return tx.reportImage.createManyAndReturn({
      data: images.map((image) => ({ ...image, reportId })),
    });
  }));
  return Response.json(created, { status: 201 });
});
