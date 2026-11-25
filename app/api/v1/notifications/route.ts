import { getDb } from "@/lib/server/db";
import { api, requireUser } from "@/lib/server/http";

export const GET = api(async (request: Request) => {
  const { npm } = await requireUser(request);
  const notifications = await getDb().notification.findMany({
    where: { userNpm: npm },
    omit: { userNpm: true },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });
  return Response.json(notifications, { headers: { "Cache-Control": "private, no-store" } });
});
