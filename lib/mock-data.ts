// Mock data. Bentuknya mengikuti tabel REPORT / NOTIFICATION di README.
// Nanti tinggal diganti dengan hasil fetch ke API backend (GET /reports, dst).

export type ReportType = "lost" | "found";
export type ReportStatus = "OPEN" | "CLAIM_PENDING" | "RESOLVED";

export interface Report {
  id: string;
  type: ReportType;
  itemName: string;
  category: string;
  description: string;
  locations: string[]; // nama CAMPUS_LOCATION (LOST: maks 3, FOUND: 1)
  locationDetail?: string;
  contact: string;
  status: ReportStatus;
  images: string[]; // URL foto (LOST: 0-10, FOUND: minimal 1 di form)
  eventDate: string; // lost: perkiraan awal hilang, found: waktu ditemukan (ISO)
  eventUntil?: string; // khusus LOST: perkiraan akhir waktu hilang (ISO)
  currentPosition?: string; // khusus FOUND
  createdAt: string; // ISO
}

export interface AppNotification {
  id: string;
  reportId: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

// Placeholder sampai backend menetapkan daftar kategori & lokasi.
export const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Documents",
  "Bags",
  "Clothing",
  "Bottles",
  "Vehicles",
  "Others",
];

interface CampusLocation {
  id: string;
  name: string;
  type: "AREA" | "BUILDING";
}

export const CAMPUS_LOCATIONS: CampusLocation[] = [
  { id: "42a4941b-6d0f-4139-8845-2f86dc660cc7", name: "Pacil Gedlam", type: "BUILDING" },
  { id: "9c3c2c1c-2610-47b8-a8d5-d1cb87818dc4", name: "Gedung A", type: "BUILDING" },
  { id: "8a078bbf-4c35-4281-b7fa-aa7329e8740c", name: "Perpustakaan", type: "BUILDING" },
  { id: "6f45baed-0b06-47b2-bf1e-a6022924cfd3", name: "Kantin", type: "AREA" },
  { id: "a8ca4df3-cb73-4a79-98cf-f2e2da0dcb27", name: "Masjid", type: "BUILDING" },
  { id: "93911355-d64e-4309-a60b-e70edbb21127", name: "Sekre", type: "AREA" },
  { id: "dc269b55-f4de-4900-97c8-e30ed525a6ac", name: "Parkiran", type: "AREA" },
];

export const LOCATIONS = CAMPUS_LOCATIONS.map(({ name }) => name);

export const REPORTS: Report[] = [
  {
    id: "1",
    type: "lost",
    itemName: "Motor pink",
    category: "Vehicles",
    description:
      "Vespa warna pink dengan motif polkadot putih dan helm senada di jok. Terakhir diparkir di dekat pintu masuk Gedlam sebelum kelas siang dimulai.",
    locations: ["Pacil Gedlam", "Parkiran"],
    locationDetail: "Dekat pintu masuk",
    contact: "LINE: motorpink_owner",
    status: "OPEN",
    images: [],
    eventDate: "2026-11-20T06:30:00.000Z",
    eventUntil: "2026-11-20T09:00:00.000Z",
    createdAt: "2026-11-20T09:15:00.000Z",
  },
  {
    id: "2",
    type: "found",
    itemName: "KTM atas nama Rani",
    category: "Documents",
    description:
      "Menemukan kartu tanda mahasiswa tergeletak di meja dekat jendela. Sudah dititipkan sementara dan bisa diambil dengan menunjukkan identitas yang sesuai.",
    locations: ["Perpustakaan"],
    locationDetail: "Lantai 2, dekat jendela",
    contact: "WhatsApp: 081234567890",
    status: "OPEN",
    images: [],
    eventDate: "2026-11-21T03:00:00.000Z",
    currentPosition: "Dititipkan di meja petugas perpustakaan",
    createdAt: "2026-11-21T04:10:00.000Z",
  },
  {
    id: "2b",
    type: "lost",
    itemName: "Black AirPods Case",
    category: "Electronics",
    description:
      "Case AirPods hitam dengan stiker kecil bergambar bintang di bagian belakang. Kemungkinan tertinggal saat belajar kelompok di sekitar kantin.",
    locations: ["Kantin"],
    contact: "WhatsApp: 081298765432",
    status: "CLAIM_PENDING",
    images: [],
    eventDate: "2026-11-19T08:00:00.000Z",
    createdAt: "2026-11-19T11:00:00.000Z",
  },
  {
    id: "3",
    type: "found",
    itemName: "Tumbler biru",
    category: "Bottles",
    description:
      "Tumbler berwarna biru dongker dengan tutup hitam ditemukan di ruangan A206 setelah kelas berakhir. Masih berisi sedikit air dan dalam kondisi baik.",
    locations: ["Gedung A"],
    locationDetail: "Ruang A206",
    contact: "LINE: finder_a206",
    status: "OPEN",
    images: [],
    eventDate: "2026-11-22T05:30:00.000Z",
    currentPosition: "Dibawa ke sekretariat",
    createdAt: "2026-11-22T06:00:00.000Z",
  },
  {
    id: "4",
    type: "lost",
    itemName: "Charger laptop",
    category: "Electronics",
    description:
      "Charger laptop merk Asus warna hitam dengan kabel yang dililit karet gelang oranye. Perasaan tadi masih ada di sekre sebelum rapat dimulai.",
    locations: ["Sekre"],
    contact: "WhatsApp: 081311112222",
    status: "RESOLVED",
    images: [],
    eventDate: "2026-11-17T10:00:00.000Z",
    createdAt: "2026-11-17T12:00:00.000Z",
  },
  {
    id: "5",
    type: "found",
    itemName: "Jaket jeans",
    category: "Clothing",
    description:
      "Jaket jeans ukuran M warna biru tua ditemukan tergantung di kursi masjid setelah salat Jumat. Ada tambalan kecil berbentuk bendera di lengan kiri.",
    locations: ["Masjid"],
    contact: "LINE: jaket_masjid",
    status: "OPEN",
    images: [],
    eventDate: "2026-11-20T06:15:00.000Z",
    currentPosition: "Dititipkan ke marbot masjid",
    createdAt: "2026-11-20T07:00:00.000Z",
  },
  {
    id: "6",
    type: "lost",
    itemName: "Tas ransel hijau",
    category: "Bags",
    description:
      "Ransel hijau army merk Eiger berisi buku catatan dan kotak pensil. Hilang di area parkiran saat hujan deras sehingga sempat dipindahkan orang lain.",
    locations: ["Parkiran"],
    contact: "WhatsApp: 081355556666",
    status: "OPEN",
    images: [],
    eventDate: "2026-11-18T09:00:00.000Z",
    createdAt: "2026-11-18T10:30:00.000Z",
  },
  {
    id: "7",
    type: "found",
    itemName: "Kacamata bingkai hitam",
    category: "Accessories",
    description:
      "Kacamata dengan bingkai hitam tebal dan lensa minus ditemukan di atas rak buku lantai satu. Terdapat goresan kecil di lensa sebelah kanan.",
    locations: ["Perpustakaan"],
    locationDetail: "Lantai 1, rak buku",
    contact: "WhatsApp: 081377778888",
    status: "CLAIM_PENDING",
    images: [],
    eventDate: "2026-11-21T08:00:00.000Z",
    currentPosition: "Dititipkan di meja petugas perpustakaan",
    createdAt: "2026-11-21T09:00:00.000Z",
  },
];

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    reportId: "3",
    message: "A found item may match your lost report: Tumbler biru.",
    readAt: null,
    createdAt: "2026-11-22T06:05:00.000Z",
  },
  {
    id: "n2",
    reportId: "2",
    message: "Someone found a document that looks like yours: KTM atas nama Rani.",
    readAt: null,
    createdAt: "2026-11-21T04:15:00.000Z",
  },
  {
    id: "n3",
    reportId: "7",
    message: "A claim is pending on a found item: Kacamata bingkai hitam.",
    readAt: "2026-11-21T10:00:00.000Z",
    createdAt: "2026-11-21T09:05:00.000Z",
  },
];

export function getReportById(id: string): Report | undefined {
  return REPORTS.find((r) => r.id === id);
}

export function getRecentReports(limit = 4): Report[] {
  return [...REPORTS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

// Zona waktu dikunci supaya server & browser menampilkan hasil yang sama.
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
}
