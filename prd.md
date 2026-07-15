# PRD — Yastar
**Product Requirements Document**
Versi: 0.6 | Status: Living Document

---

## 1. Ringkasan Produk

**Yastar** adalah *business decision software* berbasis web untuk pemilik salon, barbershop, nail studio, dan spa di Indonesia. Produk ini membalik arah kalkulator bisnis konvensional: alih-alih memproyeksikan pendapatan ke depan, owner memasukkan **target profit bulanan yang diinginkan**, dan sistem menghitung mundur — berapa klien yang dibutuhkan, apakah itu realistis, dan di mana rencana tersebut rapuh.

### Positioning
> *"Ini bukan kalkulator komisi. Ini alat pengambil keputusan."*

Yastar menjawab pertanyaan seperti:
- "Kalau saya naikkan komisi ke 45%, rugi tidak?"
- "Berapa lama kapster baru balik modal?"
- "Mending tambah staf atau buka cabang baru?"

### Diferensiasi dari kompetitor
Software kasir salon yang ada (Glossify, Majoo, Moka, Qasir, Kluto) **mencatat transaksi yang sudah terjadi** dan bersaing di ranah POS/payroll/booking. Yastar mengisi ruang yang hampir kosong di pasar Indonesia: **business decision software** — bukan pencatatan operasional.

---

## 2. Target Pengguna

### Primer
Pemilik/owner salon atau barbershop independen (1–5 cabang), skala UKM.

**Sub-segmen:**

| Sub-segmen | Kebutuhan | Pola Pakai |
|---|---|---|
| **Calon owner** (belum buka usaha) | Validasi apakah rencana modal/harga/komisi realistis sebelum keluar modal | 1–3× di fase perencanaan, stakes tinggi |
| **Owner yang sudah berjalan** | Evaluasi ulang saat ada pemicu spesifik — naik sewa, rekrut, UMR berubah, mau buka cabang | Jarang, dipicu kejadian (*event-driven*), bukan siklus bulanan rutin |

### Pola Pakai Inti
Produk ini **tidak** dirancang untuk dibuka setiap bulan. Pemakaiannya **jarang tapi bernilai tinggi per sesi** — mirip software pajak, legal, atau valuasi bisnis. Nilai datang dari besarnya keputusan yang dibantu, bukan frekuensi buka aplikasi.

---

## 3. Tujuan Produk

1. Membantu owner membuat keputusan skema komisi & harga **berbasis angka dan rekomendasi**, bukan feeling.
2. Mengurangi risiko owner baru yang salah hitung modal/BEP saat mau buka usaha.
3. Menjadi alat bantu keputusan bernilai tinggi yang dipakai **saat dibutuhkan** (*event-driven*) — model harga dan siklus produk didesain selaras dengan pola pakai ini.

---

## 4. Fitur

### 4.1 Kalkulator Target Mundur (Core)
Owner mengisi:
- Target profit bulanan (Rp)
- Biaya tetap bulanan (sewa, listrik, dll.)
- Daftar layanan beserta harga & durasi per layanan
- Jumlah karyawan
- Skema komisi (pilih salah satu model)
- Jam operasional (hari/bulan, jam/hari)

Sistem menampilkan:
- Jumlah klien yang dibutuhkan (total, per karyawan, per hari)
- Utilisasi kapasitas (%)
- Margin laba (%)
- Indikator realisme target
- Rekomendasi otomatis dari *Rules-Based Insight Engine*

### 4.2 Skema Komisi Fleksibel
Mendukung 3 model:
- **(a) Flat %** — komisi tetap dari setiap transaksi
- **(b) Gaji pokok + komisi** — gaji dasar ditambah komisi atas pencapaian
- **(c) Tiered / bertingkat** — semakin tinggi jumlah klien, semakin besar % komisi

### 4.3 Multi-Layanan
Owner dapat menginput beberapa jenis layanan dengan harga & durasi berbeda (contoh: potong rambut 30 menit vs. creambath 60 menit vs. smoothing 120 menit). Sistem menghitung rata-rata tertimbang secara otomatis.

### 4.4 Rules-Based Insight Engine
Rekomendasi otomatis berbasis aturan (bukan AI/LLM). Contoh:

| Kondisi | Pesan |
|---|---|
| Utilisasi > 90% | "Target ini membutuhkan utilisasi hampir penuh — hampir tidak ada ruang untuk hari libur atau klien batal." |
| Margin < 15% | "Margin terlalu tipis — pertimbangkan menaikkan harga atau menurunkan biaya tetap." |
| Komisi > 50% | "Komisi berada di atas rata-rata industri yang disarankan." |
| Utilisasi < 50% | "Masih ada kapasitas kosong — target bisa dinaikkan tanpa menambah karyawan." |

> LLM/AI generatif **boleh ditambahkan belakangan** hanya untuk menjelaskan hasil dalam bahasa lebih natural — bukan untuk logika inti rekomendasi (menjaga biaya operasional tetap rendah).

### 4.5 Simpan & Bandingkan Skenario
- Owner menyimpan skenario dengan nama (misal "Skema Komisi 40%" vs. "Skema Gaji Pokok + 20%")
- Skenario tersimpan dapat dibandingkan berdampingan
- Jumlah skenario yang bisa disimpan **dibatasi per tier paket**

### 4.6 Kalkulator Kapster Baru (Break-Even Karyawan)
Simulasi: kapster baru butuh berapa lama dan berapa klien sampai kontribusinya positif ke profit (break-even rekrutmen).

### 4.7 Export & Share Hasil
Export ringkasan ke PDF atau share via WhatsApp. *(Prioritas: dapat ditunda ke fase berikutnya jika riset menunjukkan kebutuhan rendah.)*

### 4.8 Reminder Berkala
Notifikasi (email/WhatsApp) mengingatkan owner menjelang masa berlaku paketnya habis, atau saat momen keputusan relevan mendekat (awal tahun anggaran, jelang gajian).

---

## 5. Alur Pengguna

```
1. Owner buka web app
        ↓
2. Login dengan email (akun ter-provisioning oleh admin)
        ↓
3. Pilih jenis usaha (Barbershop / Salon / Nail Studio / Spa)
        ↓
4. Isi data: biaya tetap, daftar layanan, karyawan, skema komisi, target profit
        ↓
5. Klik "Simulasikan"
        ↓
6. Hasil muncul: klien dibutuhkan, utilisasi, margin, insights
        ↓
7. Ubah variabel → klik ulang → eksperimen bebas tanpa batas klik
        ↓
8. Simpan skenario dengan nama
        ↓
9. [Opsional] Bandingkan beberapa skenario tersimpan
        ↓
10. [Jika limit tercapai] Klik "Upgrade Paket" → chat WhatsApp admin
        ↓
11. Bayar manual (transfer/QRIS/e-wallet) → admin verifikasi → tier naik otomatis
```

---

## 6. Struktur Tier & Monetisasi

### 6.1 Prinsip Pembatasan
- Owner **bebas menekan "Simulasikan" berkali-kali** tanpa dibatasi jumlah klik
- Yang dibatasi antar tier: **jumlah skenario tersimpan**, akses export/share, dan akses benchmark data

### 6.2 Tabel Tier

| Paket | Skenario Tersimpan | Export/Share | Benchmark | Masa Berlaku |
|---|---|---|---|---|
| **Gratis** | 1–2 skenario | ✗ | ✗ | — |
| **Starter** | hingga 15 skenario | ✓ | ✗ | ~1 tahun |
| **Professional** | Unlimited | ✓ | ✓ | ~1 tahun |

> Angka pasti dan harga per tier menunggu hasil riset/validasi pasar.

### 6.3 Masa Berlaku
Masa berlaku paket **~1 tahun** (bukan 30 hari). Alasan: jika siklus keputusan besar rata-rata terjadi setahun sekali atau lebih jarang, memaksakan siklus 30 hari membuat owner merasa dirugikan karena tidak sempat memakai jatahnya.

### 6.4 Alur Upgrade (Manual, MVP)
1. Owner klik **"Upgrade Paket"** → diarahkan ke chat WhatsApp admin
2. Owner pilih paket, kirim pembayaran (transfer/QRIS/e-wallet) + bukti
3. Admin verifikasi pembayaran secara manual
4. Admin buka **Admin Dashboard** → cari akun owner by email → atur tier + masa berlaku
5. Status paket owner **langsung aktif tanpa perlu logout–login ulang**
6. Dashboard mencatat riwayat perubahan (siapa, kapan, paket apa)

> Payment gateway otomatis dapat diintegrasikan di fase berikutnya setelah validasi model bisnis.

---

## 7. Admin Dashboard

Panel internal (tidak terlihat oleh owner). Fungsi:

| Fitur | Deskripsi |
|---|---|
| **Login admin** | Password tunggal (`ADMIN_PASSWORD` secret), tanpa akun per-admin |
| **Cari akun owner** | Pencarian berdasarkan email atau nama bisnis |
| **Lihat detail akun** | Tier, batas skenario, tanggal paket, riwayat tier |
| **Edit tier & limit** | Ubah tier, batas skenario, toggle export/benchmark, set tanggal mulai/habis |
| **Buat akun owner** | Provisioning akun baru langsung dari dashboard (email + nama bisnis + tier) |
| **Riwayat perubahan** | Log setiap perubahan tier (siapa, kapan, dari/ke tier apa) |

---

## 8. Arsitektur Teknis (Implementasi Saat Ini)

### Stack
| Layer | Teknologi |
|---|---|
| Frontend | React + Vite, Wouter (routing), TanStack Query, shadcn/ui |
| Backend | Node.js 24, Express 5, TypeScript 5.9 |
| Database | PostgreSQL 16 + Drizzle ORM |
| Validasi | Zod v4, drizzle-zod |
| API Contract | OpenAPI (Orval codegen → `@workspace/api-client-react`) |
| Build | esbuild (API server), Vite (frontend) |
| Monorepo | pnpm workspaces |

### Autentikasi
| Aktor | Mekanisme |
|---|---|
| **Owner** | Email + password → signed HMAC session cookie (`yastar_owner_session`, 30 hari) |
| **Admin** | Password tunggal (`ADMIN_PASSWORD` env secret) → signed HMAC session cookie (`yastar_admin_session`, 12 jam) |

### Skema Database Utama
- `accounts` — data owner: email, businessName, tier, scenarioLimit, exportEnabled, benchmarkAccess, packageStartedAt, packageExpiresAt, passwordHash
- `scenarios` — skenario tersimpan per akun: input lengkap + resultSnapshot (kalkulasi ter-cache)
- `account_history` — log setiap perubahan tier per akun

---

## 9. Logika Kalkulasi Inti

### Reverse Target
```
avgServicePrice     = rata-rata harga layanan
avgDuration         = rata-rata durasi layanan (menit)
effectiveCommission = resolved dari model komisi (flat / base+commission / tiered)
netProfitPerClient  = avgServicePrice × (1 - effectiveCommission%)
totalCosts          = fixedCosts + totalBaseSalary (jika model base+commission)
clientsNeeded       = ceil((totalCosts + targetProfit) / netProfitPerClient)
maxCapacity/emp/mo  = (workingDays × workingHours × 60) / avgDuration
utilizationPercent  = clientsNeeded / maxCapacityTotal × 100
isRealistic         = utilizationPercent ≤ 85%
```

### Break-Even Karyawan
```
breakEvenClients  = monthlyOverheadShare / netProfitPerClient
breakEvenMonths   = breakEvenClients / (estimatedClientsPerDay × 25)
```

---

## 10. Non-Tujuan (Out of Scope)

- **Bukan POS / pencatatan transaksi** — tidak ada input transaksi harian
- **Bukan payroll software** — tidak menghitung slip gaji aktual
- **Bukan booking system** — tidak ada jadwal/reservasi klien
- **Tidak butuh input rutin** — produk tidak meminta owner memasukkan data setiap bulan
- **Bukan AI chatbot** — insight engine berbasis rules, bukan LLM (LLM boleh ditambah di fase lanjut untuk penjelasan natural language saja)

---

## 11. Metrik Keberhasilan

| Metrik | Indikator |
|---|---|
| **Aktivasi** | % pengunjung yang menyelesaikan 1 simulasi penuh |
| **Konversi login** | % pengunjung yang membuat akun dan login |
| **Retensi** | % akun yang kembali dalam 3 bulan setelah simulasi pertama |
| **Konversi upgrade** | % akun gratis yang upgrade ke Starter/Professional |
| **NPS / kepuasan** | Skor kepuasan setelah sesi simulasi |
| **Waktu ke "aha moment"** | Waktu rata-rata dari landing → hasil simulasi pertama |

---

## 12. Jalur Pertumbuhan

| Jalur | Keterangan |
|---|---|
| **B2C organik** | Owner menemukan via pencarian / referral |
| **B2B franchise** | Potensi jalur distribusi utama — sifat pemakaian yang jarang membuat pertumbuhan 1-per-1 relatif lambat |
| **Lead magnet** | Tools gratis sebagai funnel ke jasa konsultasi bisnis / kelas buka usaha |

---

## 13. Asumsi & Risiko

| Asumsi | Risiko jika salah |
|---|---|
| Siklus keputusan besar terjadi ~1× per tahun | Jika lebih sering, masa berlaku 1 tahun mungkin kurang menarik untuk diperbarui |
| Owner bersedia login sebelum mencoba | Gesekan login bisa menurunkan konversi percobaan pertama |
| Admin bisa merespons upgrade manual dalam waktu wajar | Keterlambatan verifikasi membuat owner frustrasi dan churn |
| Rules-based insight sudah cukup tanpa LLM | Jika insight terasa generik, nilai produk melemah |

---

## 14. Riwayat Versi

| Versi | Perubahan Utama |
|---|---|
| v0.5 | Model prabayar 30 hari, jatah dihitung per klik "Simulasikan" |
| **v0.6 (saat ini)** | Ganti ke pembatasan berbasis fitur & skenario tersimpan; masa berlaku diperpanjang ke ~1 tahun; auth Clerk diganti email+password sederhana; Rules-Based Insight Engine ditambahkan |
