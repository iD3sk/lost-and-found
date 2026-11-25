import { connection } from "next/server";
import { getDb } from "@/lib/server/db";
import { api } from "@/lib/server/http";

const listLocations = api(async () => {
  const locations = await getDb().campusLocation.findMany({ orderBy: { name: "asc" } });
  return Response.json(locations);
});

export async function GET() {
  await connection();
  return listLocations();
}
