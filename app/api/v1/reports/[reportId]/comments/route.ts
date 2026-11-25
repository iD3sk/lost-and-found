import { getDb } from "@/lib/server/db";
import { ApiError, allowFields, api, jsonBody, requiredText, requireUser, uuid } from "@/lib/server/http";

type Context = { params: Promise<{ reportId: string }> };

const commentSelection = {
  id: true,
  reportId: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { name: true } },
} as const;

async function existingReport(id: string) {
  const report = await getDb().report.findUnique({ where: { id }, select: { id: true } });
  if (!report) throw new ApiError(404, "Report not found.");
}

export const GET = api(async (_request: Request, { params }: Context) => {
  const reportId = uuid((await params).reportId, "reportId");
  await existingReport(reportId);
  const comments = await getDb().comment.findMany({
    where: { reportId },
    select: commentSelection,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });
  return Response.json(comments);
});

export const POST = api(async (request: Request, { params }: Context) => {
  const { npm } = await requireUser(request);
  const reportId = uuid((await params).reportId, "reportId");
  const data = await jsonBody(request);
  allowFields(data, ["content"]);
  const content = requiredText(data.content, "content", 3000);
  const comment = await getDb().comment.create({
    data: { report: { connect: { id: reportId } }, user: { connect: { npm } }, content },
    select: commentSelection,
  });
  return Response.json(comment, { status: 201 });
});
