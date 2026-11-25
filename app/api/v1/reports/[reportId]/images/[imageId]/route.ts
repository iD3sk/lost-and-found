import { getDb } from "@/lib/server/db";
import { ApiError, api, requireUser, uuid } from "@/lib/server/http";
import { removeUploadedImage, uploadedImageResponse } from "@/lib/server/report-images";
import { lockOwnedReport } from "@/lib/server/reports";

type Context = { params: Promise<{ reportId: string; imageId: string }> };

export const GET = api(async (_request: Request, { params }: Context) => {
  const path = await params;
  const reportId = uuid(path.reportId, "reportId");
  const id = uuid(path.imageId, "imageId");
  const image = await getDb().reportImage.findUnique({ where: { id, reportId }, select: { id: true } });
  if (!image) throw new ApiError(404, "Image not found.");
  return uploadedImageResponse(id);
});

export const DELETE = api(async (request: Request, { params }: Context) => {
  const { npm } = await requireUser(request);
  const path = await params;
  const reportId = uuid(path.reportId, "reportId");
  const id = uuid(path.imageId, "imageId");

  await getDb().$transaction(async (tx) => {
    const report = await lockOwnedReport(tx, reportId, npm);
    const image = await tx.reportImage.findUnique({ where: { id, reportId }, select: { id: true } });
    if (!image) throw new ApiError(404, "Image not found.");
    if (report.type === "FOUND" && await tx.reportImage.count({ where: { reportId } }) <= 1) {
      throw new ApiError(409, "A FOUND report must keep at least one image.");
    }
    await tx.reportImage.delete({ where: { id, reportId } });
  });
  await removeUploadedImage(id);
  return new Response(null, { status: 204 });
});
