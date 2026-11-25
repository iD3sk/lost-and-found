import { getDb } from "@/lib/server/db";
import { ApiError, allowFields, api, jsonBody, optionalText, requiredText, requireUser } from "@/lib/server/http";

export const GET = api(async (request: Request) => {
  const user = await requireUser(request);
  return Response.json(user, { headers: { "Cache-Control": "private, no-store" } });
});

export const PATCH = api(async (request: Request) => {
  const { npm } = await requireUser(request);
  const data = await jsonBody(request);
  allowFields(data, ["name", "fakultas", "major", "contact"]);
  if (!Object.keys(data).length) throw new ApiError(400, "Provide at least one profile field.");

  const user = await getDb().user.update({
    where: { npm },
    data: {
      name: "name" in data ? requiredText(data.name, "name", 200) : undefined,
      fakultas: "fakultas" in data ? requiredText(data.fakultas, "fakultas", 200) : undefined,
      major: "major" in data ? requiredText(data.major, "major", 200) : undefined,
      contact: "contact" in data ? optionalText(data.contact, "contact", 300) : undefined,
    },
  });
  return Response.json(user, { headers: { "Cache-Control": "private, no-store" } });
});
