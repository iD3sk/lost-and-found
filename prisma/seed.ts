import "dotenv/config";
import { createHash } from "node:crypto";
import { ReportCategory } from "../generated/prisma/client";
import { CAMPUS_LOCATIONS, NOTIFICATIONS, REPORTS } from "../lib/mock-data";
import { getDb } from "../lib/server/db";

const depokUnits = [
  "Fakultas Kedokteran (RIK)",
  "Fakultas Kedokteran Gigi",
  "Fakultas Matematika dan Ilmu Pengetahuan Alam",
  "Fakultas Teknik",
  "Fakultas Hukum",
  "Fakultas Ekonomi dan Bisnis",
  "Fakultas Ilmu Pengetahuan Budaya",
  "Fakultas Psikologi",
  "Fakultas Ilmu Sosial dan Ilmu Politik",
  "Fakultas Kesehatan Masyarakat",
  "Fakultas Ilmu Komputer",
  "Fakultas Ilmu Keperawatan",
  "Fakultas Farmasi",
  "Fakultas Ilmu Administrasi",
  "Vokasi",
];

const salembaUnits = [
  "Fakultas Kedokteran",
  "Fakultas Kedokteran Gigi",
  "Fakultas Ilmu Komputer (MTI)",
  "Fakultas Ilmu Sosial dan Ilmu Politik (IASTH)",
  "Sekolah Pascasarjana Pembangunan Berkelanjutan",
];

const publicAreas = [
  "UI Depok - Asrama UI",
  "UI Depok - Halte Bikun Stasiun UI",
  "UI Depok - Halte Bikun Pondok Cina",
  "UI Depok - Gerbatama",
  "UI Depok - Rumpun Ilmu Kesehatan (RIK)",
  "UI Pegangsaan Timur - Fakultas Kedokteran",
];
const publicBuildings = [
  "UI Depok - Balairung",
  "UI Depok - Perpustakaan Pusat",
  "UI Depok - Masjid Ukhuwah Islamiyah",
  "UI Salemba - Gedung IMERI",
  "UI Salemba - Rumah Sakit Khusus Gigi dan Mulut",
];

function stableId(name: string) {
  const namespace = Buffer.from("c74818db138b42f39c6feebe43ac5e72", "hex");
  const bytes = createHash("sha1").update(namespace).update(name).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function seedDemoReports(locations: { id: string; name: string }[], testNpm?: string) {
  const db = getDb();
  const readerNpm = testNpm ?? "demo-ui-reporter";
  const finderNpm = "demo-ui-finder";
  const campusByName = new Map(locations.map(({ name, id }) => [name, id]));
  const name = "Demo Student";

  await db.$transaction(async (tx) => {
    for (const npm of new Set([readerNpm, finderNpm])) {
      await tx.user.upsert({
        where: { npm },
        update: {},
        create: { npm, name, fakultas: "Demo", major: "Demo" },
      });
    }

    for (const sample of REPORTS) {
      const id = stableId(`demo-report:${sample.id}`);
      const campusLocationId = campusByName.get(sample.locations[0]);
      const category = ReportCategory[sample.category.toUpperCase() as keyof typeof ReportCategory];
      if (!campusLocationId || !category) throw new Error(`Invalid demo report ${sample.id}.`);
      const isLost = sample.type === "lost";
      const event = new Date(sample.eventDate);
      const eventInWib = new Date(event.getTime() + 7 * 60 * 60 * 1000).toISOString();
      await tx.report.upsert({
        where: { id },
        update: {},
        create: {
          id,
          type: isLost ? "LOST" : "FOUND",
          itemName: sample.itemName,
          category,
          description: sample.description,
          contact: "Demo report",
          status: sample.status,
          user: { connect: { npm: isLost ? readerNpm : finderNpm } },
          location: {
            create: {
              campusLocationId,
              locationDetail: sample.locationDetail ?? (sample.locations.length > 1 ? sample.locations.join(", ") : undefined),
            },
          },
          lostFrom: isLost ? event : undefined,
          lostUntil: sample.eventUntil ? new Date(sample.eventUntil) : undefined,
          foundDate: isLost ? undefined : new Date(`${eventInWib.slice(0, 10)}T00:00:00Z`),
          foundTime: isLost ? undefined : new Date(`1970-01-01T${eventInWib.slice(11)}`),
          currentPosition: sample.currentPosition,
          createdAt: new Date(sample.createdAt),
          resolvedAt: sample.status === "RESOLVED" ? new Date(sample.createdAt) : undefined,
          images: { create: sample.images.map((imageUrl) => ({ imageUrl })) },
        },
      });
    }

    for (const sample of NOTIFICATIONS) {
      const id = stableId(`demo-notification:${readerNpm}:${sample.id}`);
      await tx.notification.upsert({
        where: { id },
        update: {},
        create: {
          id,
          userNpm: readerNpm,
          reportId: stableId(`demo-report:${sample.reportId}`),
          message: sample.message,
          createdAt: new Date(sample.createdAt),
          readAt: sample.readAt ? new Date(sample.readAt) : undefined,
        },
      });
    }
  });
  console.log(`Seeded ${REPORTS.length} demo reports and ${NOTIFICATIONS.length} demo notifications.`);
}

async function seed() {
  const demo = process.argv.includes("--demo");
  if (demo && process.env.NODE_ENV === "production") throw new Error("Demo seed requires a development environment.");
  const db = getDb();
  try {
    const areas = [
      ...depokUnits.map((name) => `UI Depok - ${name}`),
      ...salembaUnits.map((name) => `UI Salemba - ${name}`),
      ...publicAreas,
    ];
    const locations = [
      ...CAMPUS_LOCATIONS,
      ...areas.map((name) => ({ id: stableId(name), name, type: "AREA" as const })),
      ...publicBuildings.map((name) => ({ id: stableId(name), name, type: "BUILDING" as const })),
    ];
    await db.$transaction(locations.map(({ id, name, type }) =>
      db.campusLocation.upsert({ where: { id }, create: { id, name, type }, update: { name, type } }),
    ));

    const npm = process.env.NODE_ENV !== "production" && process.env.DEV_AUTH_TOKEN
      ? process.env.DEV_AUTH_NPM
      : undefined;
    if (npm) {
      await db.user.upsert({
        where: { npm },
        update: {},
        create: { npm, name: "Local Test User", fakultas: "Development", major: "Development" },
      });
    }
    console.log(`Seeded ${locations.length} campus locations.`);
    if (demo) await seedDemoReports(locations, npm);
  } finally {
    await db.$disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error("Database seed failed.", error);
  process.exitCode = 1;
});
