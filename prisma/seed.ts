import "dotenv/config";
import { createHash } from "node:crypto";
import { CAMPUS_LOCATIONS } from "../lib/mock-data";
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

function locationId(name: string) {
  const namespace = Buffer.from("c74818db138b42f39c6feebe43ac5e72", "hex");
  const bytes = createHash("sha1").update(namespace).update(name).digest().subarray(0, 16);
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function seed() {
  const db = getDb();
  try {
    const areas = [
      ...depokUnits.map((name) => `UI Depok - ${name}`),
      ...salembaUnits.map((name) => `UI Salemba - ${name}`),
      ...publicAreas,
    ];
    const locations = [
      ...CAMPUS_LOCATIONS,
      ...areas.map((name) => ({ id: locationId(name), name, type: "AREA" as const })),
      ...publicBuildings.map((name) => ({ id: locationId(name), name, type: "BUILDING" as const })),
    ];
    await db.$transaction(locations.map(({ id, name, type }) =>
      db.campusLocation.upsert({ where: { id }, create: { id, name, type }, update: { name, type } }),
    ));

    const npm = process.env.DEV_AUTH_NPM;
    if (process.env.NODE_ENV !== "production" && npm && process.env.DEV_AUTH_TOKEN) {
      await db.user.upsert({
        where: { npm },
        update: {},
        create: { npm, name: "Local Test User", fakultas: "Development", major: "Development" },
      });
    }
    console.log(`Seeded ${locations.length} campus locations.`);
  } finally {
    await db.$disconnect();
  }
}

seed().catch((error: unknown) => {
  console.error("Database seed failed.", error);
  process.exitCode = 1;
});
