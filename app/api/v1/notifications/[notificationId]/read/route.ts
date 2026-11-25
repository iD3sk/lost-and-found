import { getDb } from "@/lib/server/db";
import { api, requireUser, uuid } from "@/lib/server/http";

type Context = { params: Promise<{ notificationId: string }> };

export const PATCH = api(async (request: Request, { params }: Context) => {
  const { npm } = await requireUser(request);
  const id = uuid((await params).notificationId, "notificationId");
  const notification = await getDb().$transaction(async (tx) => {
    await tx.notification.updateMany({
      where: { id, userNpm: npm, readAt: null },
      data: { readAt: new Date() },
    });
    return tx.notification.findUniqueOrThrow({
      where: { id, userNpm: npm },
      omit: { userNpm: true },
    });
  });
  return Response.json(notification, { headers: { "Cache-Control": "private, no-store" } });
});
