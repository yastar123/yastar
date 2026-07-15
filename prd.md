# PRD — Yastar
**Product Requirements Document**
Versi: 0.6 | Status: Living Document | Terakhir diperbarui: Juli 2026

---

## 1. Ringkasan Produk

**Yastar** adalah *business decision software* berbasis web untuk pemilik salon, barbershop, nail studio, dan spa di Indonesia. Produk ini membalik arah kalkulator bisnis konvensional: alih-alih memproyeksikan pendapatan ke depan, owner memasukkan **target profit bulanan yang diinginkan**, dan sistem menghitung mundur — berapa klien yang dibutuhkan, apakah itu realistis, dan di mana rencana tersebut rapuh.

### Positioning Eksplisit
> *"Ini bukan kalkulator komisi. Ini alat pengambil keputusan."*

Yastar menjawab pertanyaan seperti:
- "Kalau saya naikkan komisi ke 45%, rugi tidak?"
- "Berapa lama kapster baru balik modal?"
- "Mending tambah staf atau buka cabang baru?"

### Diferensiasi dari Kompetitor
Software kasir salon yang ada (Glossify, Majoo, Moka, Qasir, Kluto) **mencatat transaksi yang sudah terjadi** dan bersaing di ranah POS/payroll/booking. Yastar mengisi ruang yang hampir kosong di pasar Indonesia: **business decision software** — bukan pencatatan operasional.

Yastar **sengaja tidak** meminta input rutin bulanan. Itu akan mengubah produk menjadi POS-lite dan mengandalkan disiplin input pengguna. Sebagai gantinya, produk menerima pola pakai **jarang tapi bernilai tinggi per sesi** — mirip software pajak, legal, atau valuasi bisnis.

---

## 2. Target Pengguna

### Primer
Pemilik/owner salon atau barbershop independen (1–5 cabang), skala UKM.

| Sub-segmen | Kebutuhan | Pola Pakai |
|---|---|---|
| **Calon owner** (belum buka usaha) | Validasi apakah rencana modal/harga/komisi realistis sebelum keluar modal | 1–3× di fase perencanaan, stakes tinggi |
| **Owner aktif** | Evaluasi ulang saat ada pemicu: naik sewa, UMR berubah, rekrut, buka cabang | Jarang, *event-driven*, bukan siklus bulanan |

### Sekunder
Admin internal (tim Yastar) — mengelola akun pelanggan, mengonfirmasi pembayaran, menyesuaikan tier paket.

---

## 3. Tujuan Produk

1. Membantu owner membuat keputusan komisi & harga **berbasis angka dan rekomendasi**, bukan feeling.
2. Mengurangi risiko owner baru yang salah hitung modal/BEP saat mau buka usaha.
3. Menjadi alat bantu keputusan bernilai tinggi yang dipakai **saat dibutuhkan** (*event-driven*).

---

## 4. Peta Halaman (Pages)

### 4.1 Landing Page — `/`
Halaman publik, tidak perlu login.

**Konten:**
- Hero section dengan tagline dan CTA utama ("Mulai Gratis")
- 3 value proposition utama (kalkulator terbalik, insight otomatis, simpan & bandingkan skenario)
- Tabel harga 3 tier (Gratis, Starter, Professional) dengan fitur per tier
- CTA upgrade via WhatsApp
- Footer

**Navigasi:** Jika user sudah login (session aktif), redirect otomatis ke `/user-portal`.

---

### 4.2 Halaman Login Owner — `/sign-in`
Halaman autentikasi owner. Akun tidak bisa dibuat sendiri — harus diprovisioning oleh admin.

**Form:** Email + Password → `POST /api/owner/login`

**Perilaku:**
- Password salah / email tidak ditemukan → pesan error `"Email atau password salah."` (sama untuk keduanya, untuk keamanan)
- Akun belum diset password → pesan khusus "Hubungi admin"
- Berhasil → redirect ke `/user-portal`

---

### 4.3 Halaman Sign-Up — `/sign-up`
Redirect langsung ke `/sign-in`. Akun owner hanya bisa dibuat oleh admin.

---

### 4.4 User Portal — `/user-portal`
Halaman utama owner setelah login. Memerlukan autentikasi — jika tidak login, redirect ke `/`.

**Layout:** Tabs (Kalkulator | Skenario Tersimpan) + info akun di header (nama usaha, tier, jumlah skenario tersimpan).

**Sub-halaman:**
- Tab **Kalkulator** → `calculator.tsx`
- Tab **Skenario** → `scenarios.tsx`

---

### 4.5 Kalkulator Target Mundur — (tab di User Portal)
Fitur inti Yastar.

**Form input:**
| Field | Tipe | Keterangan |
|---|---|---|
| Jenis usaha | Select | Barbershop / Salon / Nail Studio / Spa / Custom |
| Jumlah karyawan | Number | |
| Hari kerja per bulan | Number | |
| Jam operasional per hari | Number | |
| Biaya tetap bulanan | Currency (IDR) | Sewa, listrik, dll. |
| Target profit bulanan | Currency (IDR) | Titik awal perhitungan mundur |
| Daftar layanan | List | Nama, harga, durasi (menit) per layanan |
| Model komisi | Select | Flat % / Gaji pokok + komisi / Tiered |
| Konfigurasi komisi | Conditional | Bergantung model yang dipilih |

**Output kalkulasi:**
- Total klien dibutuhkan per bulan
- Klien per karyawan per bulan
- Klien per karyawan per hari
- Kapasitas maksimum (berdasarkan jam operasional)
- Utilisasi kapasitas (%)
- Margin laba (%)
- Indikator "Realistis / Tidak Realistis"
- Daftar insight/rekomendasi otomatis (Rules-Based)

**Aksi:** Tombol "Simpan Skenario" → simpan dengan nama → `POST /api/scenarios`

---

### 4.6 Skenario Tersimpan — (tab di User Portal)
Daftar semua skenario yang pernah disimpan oleh akun ini.

**Fitur:**
- Lihat ringkasan setiap skenario (nama, target profit, klien dibutuhkan, tier komisi)
- Hapus skenario → `DELETE /api/scenarios/:id`
- Indikator jumlah skenario vs batas tier (misal: "2/2 — upgrade untuk menyimpan lebih")

---

### 4.7 Admin Login — `/admin` (jika belum login)
Form login admin dengan password tunggal.

**Form:** Password → `POST /api/admin/login`

Tidak ada field email. Password diambil dari env secret `ADMIN_PASSWORD`.

---

### 4.8 Admin Dashboard — `/admin/dashboard`
Halaman ringkasan untuk admin. Redirect otomatis dari `/admin` jika sudah login.

**Komponen:**
- 4 stat cards: Total Akun, Professional, Starter, Gratis
- Pie chart (donut): distribusi akun per tier
- Bar chart: rata-rata skenario tersimpan per tier
- Status paket: Aktif / Habis dalam 30 hari / Kadaluarsa / Tanpa paket

---

### 4.9 Manajemen Akun — `/admin/akun`
CRUD akun owner.

**Kiri — Daftar Akun:**
- Search by email
- Tabel: Email, Tier (badge), Skenario (count/limit), Kadaluarsa
- Tombol "Buat Akun" → dialog

**Kanan — Detail Akun** (muncul setelah pilih akun):
- Email + tanggal daftar
- Ubah tier (select)
- Ubah batas skenario (input number, kosong = unlimited)
- Ubah tanggal kadaluarsa paket (date picker)
- Riwayat perubahan tier (scrollable list)

**Dialog Buat Akun:**
- Email*, Nama Usaha, Tier, Batas Skenario, Tanggal Kadaluarsa
- `POST /api/admin/accounts`

---

### 4.10 CMS Landing Page — `/admin/cms`
Placeholder. Akan digunakan untuk mengedit konten halaman utama (headline, tagline, poin fitur, harga) tanpa perlu deploy ulang.

**Status:** Belum diimplementasikan (tampil placeholder "Segera Hadir").

---

## 5. Fitur Detail

### 5.1 Kalkulator Target Mundur (Reverse Calculation Engine)
**Formula inti:**
```
avgServicePrice     = rata-rata harga dari semua layanan yang diinput
avgDuration         = rata-rata durasi layanan (menit)
effectiveCommission = resolved dari model komisi yang dipilih
netProfitPerClient  = avgServicePrice × (1 − effectiveCommission%)
totalMonthlyCosts   = fixedCosts + totalBaseSalary (jika model base+commission)
clientsNeeded       = ceil((totalMonthlyCosts + targetProfit) / netProfitPerClient)
maxCapacity/emp/mo  = (workingDays × workingHours × 60) / avgDuration
utilizationPercent  = clientsNeeded / maxCapacityTotal × 100
isRealistic         = utilizationPercent ≤ 85%
```

### 5.2 Skema Komisi Fleksibel (3 Model)

| Model | Cara Kerja |
|---|---|
| **Flat %** | Komisi tetap dari setiap transaksi |
| **Gaji Pokok + Komisi** | Gaji dasar per karyawan + komisi atas pencapaian |
| **Tiered (Bertingkat)** | % komisi naik seiring jumlah klien; bracket dikonfigurasi bebas |

Untuk model tiered, engine mengiterasi sampai nilai bracket stabil (karena commission % bergantung pada jumlah klien yang juga bergantung pada commission %).

### 5.3 Multi-Layanan
Owner input beberapa jenis layanan dengan harga & durasi masing-masing. Sistem menghitung rata-rata tertimbang (unweighted average) dari semua layanan.

### 5.4 Kalkulator Break-Even Karyawan
Menghitung berapa lama kapster baru sampai kontribusinya positif ke profit.

**Input:** harga rata-rata layanan, model komisi, biaya overhead yang ditanggung kapster baru, estimasi klien per hari

**Output:** break-even clients needed, break-even days/weeks/months + insights

### 5.5 Rules-Based Insight Engine
Rekomendasi otomatis berdasarkan aturan (bukan LLM):

| Kode | Kondisi | Severitas | Pesan |
|---|---|---|---|
| `capacity_exceeded` | Utilisasi > 100% | danger | Target tidak mungkin dicapai dengan kapasitas saat ini |
| `capacity_warning` | Utilisasi > 85% | warning | Target membutuhkan utilisasi sangat tinggi — hampir tidak ada buffer |
| `margin_danger` | Margin < 10% | danger | Margin terlalu tipis — usaha rentan rugi kalau ada biaya tak terduga |
| `margin_warning` | Margin < 15% | warning | Margin di bawah rata-rata industri yang disarankan |
| `high_commission` | Komisi > 50% | warning | Komisi di atas rata-rata industri |
| `capacity_headroom` | Utilisasi < 50% | info | Masih ada ruang kapasitas — target bisa dinaikkan |
| `realistic` | Utilisasi ≤ 85%, margin ≥ 15% | success | Target realistis dan margin sehat |

> LLM/AI generatif **boleh ditambahkan di fase lanjut** hanya untuk menjelaskan insight dalam bahasa lebih natural — bukan untuk logika inti.

### 5.6 Simpan & Bandingkan Skenario
- Setiap hasil kalkulasi dapat disimpan dengan nama custom
- Skenario tersimpan dapat dilihat dan dibandingkan dari tab "Skenario"
- Batas jumlah skenario bergantung tier
- Skenario menyimpan: input lengkap + result snapshot (kalkulasi ter-cache)

---

## 6. Alur Pengguna

### 6.1 Alur Owner Baru
```
1. Buka landing page (/) → baca value prop, lihat pricing
2. Klik "Mulai Gratis" / "Upgrade Paket" → chat WhatsApp admin
3. Admin provisioning akun + set password awal
4. Login di /sign-in dengan email + password
5. Masuk User Portal → pilih jenis usaha
6. Isi form kalkulator → klik "Simulasikan"
7. Lihat hasil: klien dibutuhkan, utilisasi, margin, insights
8. Ubah variabel (eksperimen bebas, tak ada batas klik)
9. Simpan skenario dengan nama
10. [Jika limit tercapai] Klik "Upgrade Paket" → WhatsApp admin
```

### 6.2 Alur Upgrade Paket (Manual)
```
1. Owner klik "Upgrade Paket" → buka WhatsApp admin
2. Owner pilih paket, kirim pembayaran + bukti transfer
3. Admin verifikasi pembayaran
4. Admin buka /admin/akun → cari by email → ubah tier + set tanggal kadaluarsa
5. Status paket owner berubah real-time tanpa logout
```

### 6.3 Alur Admin Provisioning Akun Baru
```
1. Login ke /admin dengan ADMIN_PASSWORD
2. Buka /admin/akun → klik "Buat Akun"
3. Isi: email, nama usaha, tier, batas skenario, tanggal kadaluarsa
4. Akun terbuat → owner bisa langsung login (admin set password terpisah)
```

---

## 7. Struktur Tier & Monetisasi

### 7.1 Prinsip
- Klik tombol "Simulasikan" **tidak dibatasi** (bebas bereksperimen)
- Yang dibatasi: **jumlah skenario tersimpan**, akses export, akses benchmark data
- Masa berlaku **~1 tahun** (selaras siklus keputusan besar, bukan siklus gajian bulanan)

### 7.2 Tabel Tier

| Paket | Skenario Tersimpan | Export/Share | Benchmark | Masa Berlaku |
|---|---|---|---|---|
| **Gratis** | 1–2 | ✗ | ✗ | — |
| **Starter** | hingga 15 | ✓ | ✗ | ~1 tahun |
| **Professional** | Unlimited | ✓ | ✓ (saat rilis) | ~1 tahun |

> Angka pasti dan harga per tier masih menunggu validasi pasar.

### 7.3 Alur Pembayaran (MVP)
Tidak ada payment gateway otomatis. Upgrade dilakukan manual via WhatsApp admin → pembayaran transfer/QRIS/e-wallet → admin update tier di dashboard.

---

## 8. Autentikasi & Otorisasi

### 8.1 Owner Auth
| Item | Detail |
|---|---|
| Endpoint login | `POST /api/owner/login` — body: `{ email, password }` |
| Password storage | `scrypt` hash + salt, disimpan di kolom `passwordHash` tabel `accounts` |
| Session | Signed HMAC cookie `yastar_owner_session` (30 hari), signed dengan `SESSION_SECRET` |
| Logout | `POST /api/owner/logout` — clear cookie |
| Session check | `GET /api/owner/session` → `{ authenticated, accountId }` |
| Proteksi route backend | Middleware `requireAuth` di semua endpoint `/api/scenarios` dan `/api/me` |
| Proteksi route frontend | `UserPortalRoute` di App.tsx redirect ke `/` jika tidak terautentikasi |

### 8.2 Admin Auth
| Item | Detail |
|---|---|
| Endpoint login | `POST /api/admin/login` — body: `{ password }` |
| Password | `ADMIN_PASSWORD` env secret (dibandingkan langsung, tidak di-hash) |
| Session | Signed HMAC cookie `yastar_admin_session` (12 jam) |
| Logout | `POST /api/admin/logout` |
| Session check | `GET /api/admin/session` |
| Proteksi route backend | Middleware `requireAdminAuth` di semua endpoint `/api/admin/*` |
| Proteksi route frontend | `AdminGate` di App.tsx — tampilkan login form jika sesi tidak ada |

---

## 9. Arsitektur Teknis

### 9.1 Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | React 18, Vite, TypeScript 5.9 |
| **Routing** | Wouter |
| **State / Data Fetching** | TanStack Query v5 |
| **UI Components** | shadcn/ui (Radix UI primitives + Tailwind CSS) |
| **Charts** | Recharts 2 |
| **Backend** | Node.js 24, Express 5, TypeScript 5.9 |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL 16 |
| **Validasi** | Zod v4, drizzle-zod |
| **API Contract** | OpenAPI spec + Orval codegen → `@workspace/api-client-react` |
| **Build** | esbuild (API server), Vite (frontend) |
| **Monorepo** | pnpm workspaces |
| **Password Hashing** | Node.js built-in `crypto.scrypt` |
| **Session Signing** | Node.js built-in `crypto.createHmac` (SHA-256) |

### 9.2 Struktur Monorepo
```
/
├── artifacts/
│   ├── api-server/          # Express API (port via $PORT)
│   └── yastar/              # React frontend (port via $PORT)
├── lib/
│   └── db/                  # Drizzle schema, migrations, client
├── scripts/
│   └── src/seed.ts          # Seed demo accounts
└── prd.md
```

### 9.3 Skema Database

#### Tabel `accounts`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | serial PK | |
| `email` | text UNIQUE | lowercase canonical |
| `businessName` | text | nama usaha |
| `tier` | text | `free` / `starter` / `professional` |
| `scenarioLimit` | integer | null = unlimited |
| `exportEnabled` | boolean | akses export/share |
| `benchmarkAccess` | boolean | akses data benchmark |
| `passwordHash` | text | scrypt hash, null = belum diset |
| `packageStartedAt` | timestamptz | |
| `packageExpiresAt` | timestamptz | |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

#### Tabel `scenarios`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | serial PK | |
| `accountId` | integer FK → accounts | |
| `name` | text | nama skenario |
| `input` | jsonb | semua input kalkulator |
| `resultSnapshot` | jsonb | hasil kalkulasi ter-cache |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

#### Tabel `account_history`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | serial PK | |
| `accountId` | integer FK → accounts | |
| `previousTier` | text | |
| `newTier` | text | |
| `previousExpiresAt` | timestamptz | |
| `newExpiresAt` | timestamptz | |
| `note` | text | catatan opsional admin |
| `createdAt` | timestamptz | |

---

## 10. API Endpoints

### Owner Auth
| Method | Path | Deskripsi |
|---|---|---|
| POST | `/api/owner/login` | Login dengan email + password |
| POST | `/api/owner/logout` | Hapus session cookie |
| GET | `/api/owner/session` | Cek status sesi aktif |

### Owner Account
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/me` | Profil owner + tier + batas skenario |

### Scenarios
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/scenarios` | Daftar skenario milik owner |
| POST | `/api/scenarios` | Simpan skenario baru (cek limit tier) |
| GET | `/api/scenarios/:id` | Detail skenario |
| PATCH | `/api/scenarios/:id` | Update nama/input skenario |
| DELETE | `/api/scenarios/:id` | Hapus skenario |

### Kalkulasi
| Method | Path | Deskripsi |
|---|---|---|
| POST | `/api/calculate/reverse-target` | Hitung klien dibutuhkan dari target profit |
| POST | `/api/calculate/break-even` | Hitung break-even kapster baru |

### Admin Auth
| Method | Path | Deskripsi |
|---|---|---|
| POST | `/api/admin/login` | Login admin dengan password |
| POST | `/api/admin/logout` | Logout admin |
| GET | `/api/admin/session` | Cek sesi admin |

### Admin Accounts
| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/admin/accounts` | Daftar semua akun (dengan filter search) |
| POST | `/api/admin/accounts` | Buat akun baru |
| GET | `/api/admin/accounts/:id` | Detail akun + riwayat tier |
| PATCH | `/api/admin/accounts/:id` | Update tier/limit/kadaluarsa |

---

## 11. Komponen Kunci (Frontend)

| Komponen | Fungsi |
|---|---|
| `AdminLayout` | Sidebar navigasi admin (Dashboard, Manajemen Akun, CMS) + tombol logout |
| `AuthSplitLayout` | Layout split-screen hijau tua + putih untuk halaman login |
| `CommissionConfigInput` | Form dinamis untuk 3 model komisi (flat/base+commission/tiered) |
| `ServiceListInput` | Daftar layanan dengan harga & durasi per item, bisa tambah/hapus |
| `InsightList` | Render daftar insight dengan badge severity (info/success/warning/danger) |
| `CurrencyInput` | Input angka dengan format IDR (Rp) |
| `OwnerAuthProvider` | React context — session owner, login(), logout() |

---

## 12. Konfigurasi & Secrets

| Variabel | Tipe | Fungsi |
|---|---|---|
| `ADMIN_PASSWORD` | Secret | Password login admin dashboard |
| `SESSION_SECRET` | Secret | Kunci HMAC untuk signing session cookie (owner & admin) |
| `DATABASE_URL` | Env | Koneksi ke PostgreSQL |
| `PORT` | Env | Port yang dipakai setiap service (diset otomatis oleh Replit) |

---

## 13. Akun Demo (Development)

Diseed via `pnpm --filter @workspace/scripts run seed`:

| Email | Password | Tier | Batas Skenario |
|---|---|---|---|
| `demo.free@yastar.app` | `demo1234` | Free | 2 |
| `demo.starter@yastar.app` | `demo1234` | Starter | 15 |
| `demo.professional@yastar.app` | `demo1234` | Professional | Unlimited |

**Admin:** buka `/admin` → masukkan `ADMIN_PASSWORD` secret.

---

## 14. Non-Tujuan (Out of Scope)

- Pencatatan transaksi harian (bukan POS)
- Penghitungan payroll / slip gaji aktual
- Sistem booking/reservasi klien
- Input data rutin bulanan (bukan dashboard operasional)
- AI/LLM untuk logika inti (boleh ditambah untuk natural language saja)
- Payment gateway otomatis (fase MVP: manual via WhatsApp)

---

## 15. Metrik Keberhasilan

| Metrik | Indikator |
|---|---|
| Aktivasi | % pengunjung yang menyelesaikan 1 simulasi penuh |
| Konversi signup | % pengunjung yang meminta akun (via WhatsApp) |
| Retensi | % akun yang kembali dalam 3 bulan |
| Konversi upgrade | % akun gratis yang upgrade ke Starter/Professional |
| Time-to-value | Waktu dari landing → hasil simulasi pertama |

---

## 16. Risiko & Asumsi

| Asumsi | Risiko jika salah |
|---|---|
| Siklus keputusan besar ~1× per tahun | Masa berlaku 1 tahun mungkin kurang menarik untuk diperbarui |
| Owner bersedia minta akun ke admin (tidak self-register) | Gesekan onboarding tinggi → konversi rendah |
| Admin bisa respons upgrade manual dalam waktu wajar | Keterlambatan → owner frustrasi & churn |
| Rules-based insight cukup bernilai tanpa LLM | Jika insight terasa generik, differensiasi melemah |

---

## 17. Roadmap / Fitur Belum Diimplementasi

| Fitur | Prioritas | Keterangan |
|---|---|---|
| Export PDF / Share WhatsApp | Medium | Untuk Starter & Professional |
| CMS Landing Page | Medium | Edit konten tanpa deploy |
| Benchmark data industri | Low | Akses untuk Professional |
| Password reset | High | Saat ini harus minta admin |
| Payment gateway otomatis | Medium | Setelah validasi model bisnis |
| LLM untuk penjelasan natural language | Low | Opsional di atas rules engine |
| Mobile app (Expo) | Medium | Pemilik salon lebih banyak di HP |

---

## 18. Riwayat Versi

| Versi | Perubahan Utama |
|---|---|
| v0.5 | Model prabayar 30 hari, jatah dihitung per klik "Simulasikan" |
| v0.6 | Ganti ke pembatasan berbasis fitur & skenario; masa berlaku ~1 tahun; auth Clerk diganti email+password (`scrypt`); Rules-Based Insight Engine; sidebar admin dengan 3 menu; chart di admin dashboard |
