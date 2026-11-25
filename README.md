# Lost and Found
this is a description of the webapp

## A. Define App pages, Features, and Team Responsibilities
### Application Pages
1. Register/Login with SSO UI (CAS2)
2. Profile (Name, Faculty, Major, NPM, Contacts)
3. Home (choose whether you’ve lost/found something)
4. Lost (Fill a form of what you have lost)
5. Found (Post what you found)

### Features
1. User authentication (login with SSO, for safety measures)
2. Profile editing
3. Search and filter
4. Notifications [inbox] (If someone has found something with similar criteria of what you have lost)
5. Upload images (camera, gallery, etc)
6. Comments (In web communication, before further details)

### Team Responsibilites
1. Frontend Developer
- Mishel
- Regina
2. Backend Developer
- Fiqhi
3. UI/UX Designer
- Mishel
- Regina



## B. Design Report fields, data types, and database relation

### USER

Menyimpan data pengguna

Fields:
- `npm`: String - PK, wajib diisi. Nomor pokok mahasiswa.
- `name`: String - wajib diisi. 
- `fakultas`: String - wajib diisi.
- `major`: String - wajib diisi. Program studi pengguna.
- `contact`: String - optional

PK: npm
FK: None


### REPORT

Menyimpan laporan barang hilang dan ditemukan.

Fields:
- `id`: UUID - PK, otomatis.
- `userNpm`: String - FK, wajib diisi. Pembuat laporan.
- `report_location`: UUID - FK, wajib diisi, unik. Merujuk ke detail lokasi laporan.
- `type`: Enum(LOST, FOUND) - wajib diisi.
- `itemName`: String - wajib diisi. Nama barang.
- `category`: Enum - wajib diisi; pilihan kategori ditentukan nanti.
- `description`: String - wajib diisi, minimal 15 kata.
- `contact`: String - wajib diisi. Kontak yang dapat dihubungi untuk laporan ini.
- `status`: Enum(OPEN, CLAIM_PENDING, RESOLVED) - wajib diisi, default OPEN.
- `lostFrom`: DateTime - wajib untuk LOST, kosong untuk FOUND. Awal perkiraan waktu hilang.
- `lostUntil`: DateTime - opsional untuk LOST, kosong untuk FOUND. Akhir perkiraan waktu hilang; penggunaan rentang waktu masih perlu dipastikan.
- `foundDate`: Date - wajib untuk FOUND, kosong untuk LOST.
- `foundTime`: Time - opsional untuk FOUND, kosong untuk LOST.
- `currentPosition`: String - wajib untuk FOUND, kosong untuk LOST. Posisi barang saat ini.
- `createdAt`: DateTime - otomatis saat laporan dibuat.
- `updatedAt`: DateTime - otomatis saat laporan diperbarui.
- `resolvedAt`: DateTime - opsional, diisi saat laporan selesai ditangani.

PK: id

FK:
- userNpm merujuk ke USER(npm).
- report_location merujuk ke LOCATION(id).

Relationships:
- USER ke REPORT: 1:N.
- REPORT ke REPORT_IMAGE: 1:N.
- REPORT ke LOCATION: 1:1. Setiap laporan memiliki satu detail lokasi tersendiri.
- REPORT ke COMMENT: 1:N.
- REPORT ke NOTIFICATION: 1:N.

Notes:
- Type menunjukkan jenis laporan; status menunjukkan tahap penanganannya.
- Field khusus LOST atau FOUND boleh kosong di database, tetapi wajib divalidasi sesuai type laporan.
- Rancangan ini memakai satu lokasi per laporan; ketentuan sebelumnya tentang maksimal 3 lokasi LOST perlu diselaraskan di dokumen requirement.

### REPORT_IMAGE

Menyimpan referensi foto laporan. File gambar disimpan di storage.

Fields:
- `id`: UUID - PK, otomatis.
- `reportId`: UUID - FK, wajib diisi.
- `imageUrl`: String - wajib diisi. URL atau path gambar.
- `createdAt`: DateTime - otomatis saat foto ditambahkan.

PK: id

FK: reportId merujuk ke REPORT(id)

Relationships:
- REPORT ke REPORT_IMAGE: 1:N.

Notes:
- LOST: foto opsional, maksimal 10 foto.
- FOUND: minimal 1 foto; batas maksimal belum ditentukan.
- Format gambar: PNG atau JPG.

### LOCATION

Menyimpan detail lokasi terakhir barang terlihat atau lokasi barang ditemukan untuk suatu laporan.

Fields:
- `id`: UUID - PK, otomatis.
- `location_id`: UUID - FK, wajib diisi. Area atau gedung kampus.
- `location_detail`: String - opsional. Deskripsi spesifik, misalnya dekat pintu masuk perpustakaan.
- `latitude`: Decimal - opsional. Koordinat lintang, rentang -90 sampai 90.
- `longitude`: Decimal - opsional. Koordinat bujur, rentang -180 sampai 180.

PK: id

FK: location_id merujuk ke CAMPUS_LOCATION(id)

Relationships:
- REPORT ke LOCATION: 1:1.
- CAMPUS_LOCATION ke LOCATION: 1:N.

### CAMPUS_LOCATION

Menyimpan daftar area dan gedung kampus yang dapat dipilih pengguna.

Fields:
- `id`: UUID - PK, otomatis.
- `name`: String - wajib diisi. Nama tempat, misalnya Perpustakaan atau Gedung A.
- `type`: Enum(AREA, BUILDING) - wajib diisi.

PK: id

FK: None

Relationships:
- CAMPUS_LOCATION ke LOCATION: 1:N. Satu tempat kampus dapat dirujuk oleh banyak detail lokasi laporan.

### COMMENT

Menyimpan komentar pengguna pada laporan.

Fields:
- `id`: UUID - PK, otomatis.
- `reportId`: UUID - FK, wajib diisi.
- `userNpm`: String - FK, wajib diisi. Penulis komentar.
- `content`: String - wajib diisi. Isi komentar.
- `createdAt`: DateTime - otomatis saat komentar dibuat.
- `updatedAt`: DateTime - otomatis saat komentar diperbarui.

PK: id

FK:
- reportId merujuk ke REPORT(id).
- userNpm merujuk ke USER(npm).

Relationships:
- REPORT ke COMMENT: 1:N.
- USER ke COMMENT: 1:N.

### NOTIFICATION

Menyimpan notifikasi untuk pengguna ketika ada laporan barang ditemukan yang berpotensi cocok.

Fields:
- `id`: UUID - PK, otomatis.
- `userNpm`: String - FK, wajib diisi. Penerima notifikasi.
- `reportId`: UUID - FK, wajib diisi. Laporan FOUND yang berpotensi cocok.
- `message`: String - wajib diisi. Isi notifikasi.
- `readAt`: DateTime - opsional. Kosong berarti belum dibaca.
- `createdAt`: DateTime - otomatis saat notifikasi dibuat.

PK: id

FK:
- userNpm merujuk ke USER(npm).
- reportId merujuk ke REPORT(id).

Relationships:
- USER ke NOTIFICATION: 1:N.
- REPORT ke NOTIFICATION: 1:N.

Notes:
- Category menggunakan enum di REPORT, sehingga tidak membutuhkan tabel terpisah.
- Mapping model Prisma ada di `prisma/schema.prisma`.

## Search/Filter Query Parameters

Semua query parameter bersifat opsional.

- `keyword`: String - mencari nama barang pada field itemName.
- `type`: Enum(LOST, FOUND) - memfilter jenis laporan.
- `status`: Enum(OPEN, CLAIM_PENDING, RESOLVED) - memfilter status penanganan laporan.
- `category`: Enum - memfilter kategori barang; pilihan kategori ditentukan nanti.
- `dateFrom`: Date (YYYY-MM-DD) - batas awal tanggal kejadian.
- `dateTo`: Date (YYYY-MM-DD) - batas akhir tanggal kejadian.
- `timeFrom`: Time (HH:mm) - batas awal waktu kejadian.
- `timeTo`: Time (HH:mm) - batas akhir waktu kejadian.
- `locationId`: UUID - ID dari CAMPUS_LOCATION untuk memfilter area atau gedung melalui LOCATION.location_id.

Notes:
- Filter tanggal dan waktu mengacu pada kejadian, bukan waktu laporan dibuat.
- Untuk LOST, rentang filter dicocokkan dengan perkiraan waktu hilang (lostFrom dan lostUntil).
- Untuk FOUND, rentang filter dicocokkan dengan foundDate dan foundTime.

## REST API Endpoints

Endpoint dengan base path `/api/v1`.

### Profile

- `GET /api/v1/users/me` - melihat profil pengguna yang sedang login.
- `PATCH /api/v1/users/me` - memperbarui profil sendiri.

### Reports

- `GET /api/v1/reports` - melihat daftar laporan dengan search/filter.
- `POST /api/v1/reports` - membuat laporan LOST atau FOUND beserta foto dan lokasi.
- `GET /api/v1/reports/{reportId}` - melihat detail laporan.
- `PATCH /api/v1/reports/{reportId}` - memperbarui data atau status laporan sendiri.

### Report Images

- `POST /api/v1/reports/{reportId}/images` - menambahkan foto pada laporan sendiri.
- `GET /api/v1/reports/{reportId}/images/{imageId}` - mengambil file foto laporan.
- `DELETE /api/v1/reports/{reportId}/images/{imageId}` - menghapus foto pada laporan sendiri.

### Campus Locations

- `GET /api/v1/campus-locations` - melihat daftar area/building untuk pilihan lokasi dan filter.

### Comments

- `GET /api/v1/reports/{reportId}/comments` - melihat komentar pada laporan.
- `POST /api/v1/reports/{reportId}/comments` - menambahkan komentar pada laporan.

### Notifications / Inbox

- `GET /api/v1/notifications` - melihat inbox pengguna yang sedang login.
- `PATCH /api/v1/notifications/{notificationId}/read` - menandai notifikasi milik sendiri sebagai sudah dibaca.

### Authentication

- `GET /api/v1/auth/sso/login` - memulai login melalui SSO UI.
- `GET /api/v1/auth/sso/callback` - memvalidasi tiket CAS2 dan membuka sesi aplikasi.
- `POST /api/v1/auth/sso/complete` - memilih prodi jika kode SSO hanya mengidentifikasi fakultas.
- `POST /api/v1/auth/logout` - mencabut sesi aplikasi dan menghapus cookie.

Untuk pengembangan, callback default adalah `http://localhost:3000/api/v1/auth/sso/callback`. Untuk deployment, set `SSO_SERVICE_URL` ke URL HTTPS callback aplikasi. CAS UI harus menerima URL service tersebut dengan query `state` yang dibuat untuk tiap login. Jalankan migrasi Prisma sebelum memakai SSO.

NPM dan nama berasal dari respons validasi tiket. Fakultas dan prodi dipetakan dari `kd_org` memakai salinan lokal [katalog kode organisasi UI](https://git.fossy.my.id/femboy/kd_org/raw/branch/master/code.json). Sesi disimpan di PostgreSQL dan endpoint privat membaca cookie sesi. Logout mengakhiri sesi aplikasi.

### Menjalankan API dengan PostgreSQL lokal

1. Jalankan `npm ci`, lalu isi `DATABASE_URL` di `.env` dengan URL database development. Isi juga `SHADOW_DATABASE_URL` jika memakai shadow database terpisah.
2. Jalankan `npx prisma migrate dev` dan `npm run db:seed` untuk membuat tabel dan mengisi katalog lokasi.
3. Untuk operasi yang membutuhkan akun, isi `DEV_AUTH_NPM` dengan identitas akun uji dan `DEV_AUTH_TOKEN` dengan token acak. Jalankan ulang `npm run db:seed` untuk membuat akun uji, lalu kirim header `Authorization: Bearer <DEV_AUTH_TOKEN>`. Mekanisme ini hanya aktif saat `npm run dev`.

Jalankan `npm run db:seed:demo` untuk mengisi PostgreSQL lokal dengan laporan dan notifikasi demo. Home dan Explore menampilkan laporan demo dari database. My Reports dan Notifications menampilkan data milik akun yang sedang login. Notifikasi demo diberikan ke akun uji development.

Pembuatan laporan memakai `multipart/form-data` dengan `locationId` dari katalog, satu lokasi per laporan, dan field `images` yang dapat diulang. Upload tambahan memakai field `images` yang sama. Foto harus PNG atau JPEG, maksimal 5 MiB per file dan 10 foto per laporan. Laporan FOUND harus menyimpan minimal satu foto. File disimpan di `.report-uploads/` secara lokal atau di direktori persisten dari `REPORT_UPLOAD_DIR`.

Operasi PATCH dan pembuatan komentar memakai JSON. Filter tanggal dan jam menggunakan WIB. Laporan FOUND baru membuat satu notifikasi per pengguna dengan laporan LOST berstatus OPEN yang cocok pada nama barang, kategori, dan lokasi kampus.
