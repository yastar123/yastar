# PRD — Yastar
**Product Requirements Document**
Versi: 0.7 | Status: Living Document | Terakhir diperbarui: Juli 2026

---

## 1. Ringkasan Produk

**Yastar** adalah *business decision software* berbasis web untuk pemilik salon, barbershop, nail studio, dan spa di Indonesia. Produk ini membalik arah kalkulator bisnis konvensional: alih-alih memproyeksikan pendapatan ke depan, owner memasukkan **target profit bulanan yang diinginkan**, dan sistem menghitung mundur — berapa klien yang dibutuhkan, apakah itu realistis, dan di mana rencana tersebut rapuh.

### Positioning Eksplisit
> *"Ini bukan kalkulator komisi. Ini alat pengambil keputusan."*

Yastar menjawab pertanyaan seperti:
- "Kalau saya naikkan komisi ke 45%, rugi tidak?"
- "Berapa lama kapster baru balik modal?"
- "Mending tambah staf atau buka cabang baru?"
- "HPP layanan saya berapa, dan margin saya sehat tidak?"
- "Kalau saya ambil pinjaman Rp 100 juta, dampaknya ke profit bulanan berapa?"

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
Admin internal (tim Yastar) — mengelola akun pelanggan, mengonfirmasi pembayaran, menyesuaikan tier dan akses modul per akun.

---

## 3. Tujuan Produk

1. Membantu owner membuat keputusan komisi & harga **berbasis angka dan rekomendasi**, bukan feeling.
2. Mengurangi risiko owner baru yang salah hitung modal/BEP saat mau buka usaha.
3. Menjadi alat bantu keputusan bernilai tinggi yang dipakai **saat dibutuhkan** (*event-driven*).
4. Menyediakan hub simulasi bisnis lengkap: dari HPP sampai kelayakan ekspansi, dalam satu platform.

---

## 4. Peta Halaman (Pages) & Navigasi

### 4.1 Struktur Navigasi

```
/ (publik)
├── /sign-in
├── /sign-up → redirect ke /sign-in
└── /user-portal/:module (butuh login owner)
    ├── /user-portal/beranda          ← default
    ├── /user-portal/target-mundur
    ├── /user-portal/hpp
    ├── /user-portal/bep-usaha
    ├── /user-portal/harga-jual
    ├── /user-portal/pajak
    ├── /user-portal/ekspansi
    ├── /user-portal/pinjaman
    └── /user-portal/skenario

/admin (butuh login admin)
├── /admin/dashboard
├── /admin/akun
└── /admin/cms
```

---

### 4.2 Landing Page — `/`

**Tipe:** Halaman publik, tidak perlu login. Jika session owner aktif, redirect otomatis ke `/user-portal/beranda`.

**Layout:** Single-page scroll, warna dominan hijau tua (#1B4332 area) dan putih.

**Konten (urutan dari atas):**

**Header / Navbar:**
- Logo Yastar (icon + teks) di kiri
- Tombol "Masuk" (ghost) dan "Hubungi Kami" (primary) di kanan

**Section 1 — Hero:**
- Badge kecil: "Kalkulator Bisnis Terbalik"
- Headline besar: *"Mulai dari laba yang kamu mau, temukan jalannya."*
- Subheadline: deskripsi singkat Yastar (kalkulator terbalik untuk salon/barbershop)
- CTA primer: "Masuk & Hitung Sekarang" → `/sign-in`
- CTA sekunder: "Tanya via WhatsApp" → link WhatsApp

**Section 2 — Diferensiasi ("Kenapa Yastar Berbeda"):**
- Headline: *"Berhenti menebak, mulai merencanakan"*
- Penjelasan: kalkulator biasa memberi tahu laba setelah semuanya terjadi; Yastar membalik urutannya
- Dua kolom perbandingan: "Cara lama" (merah ×) vs "Cara Yastar" (hijau ✓)

**Section 3 — Value Propositions (3 kartu):**
- Kalkulator target terbalik untuk salon, barbershop, nail studio, dan spa
- Insight otomatis yang menandai risiko sebelum jadi masalah
- Simpan dan bandingkan skenario pertumbuhan bisnis

**Section 4 — Pricing Table:**
- 3 tier: Gratis, Starter, Professional
- Setiap tier: nama, daftar fitur dengan ikon centang/silang, CTA
- CTA upgrade mengarah ke WhatsApp admin

**Footer:**
- Copyright Yastar

---

### 4.3 Halaman Login Owner — `/sign-in`

**Tipe:** Publik. Jika sudah login, redirect ke `/user-portal/beranda`.

**Layout:** Split-screen — kiri hijau tua (branding), kanan putih (form).

**Kiri:**
- Logo Yastar
- Tagline dan 3 bullet point value proposition

**Kanan (Form):**
- Judul: "Selamat datang kembali"
- Sub: "Masuk ke akun Yastar Anda."
- Field: Email (`email@contoh.com`)
- Field: Password (masked)
- Tombol: "Masuk" (primary full-width)
- Link bawah: "Belum punya akun? Hubungi admin untuk mendaftar."

**Perilaku:**
- Email/password salah → toast error: `"Email atau password salah."`
- Akun belum set password → toast: `"Akun ini belum diatur passwordnya. Hubungi admin."`
- Berhasil login → redirect ke `/user-portal/beranda`
- API: `POST /api/owner/login` → body `{ email, password }`

---

### 4.4 Halaman Sign-Up — `/sign-up`

Redirect otomatis ke `/sign-in`. Akun hanya bisa dibuat oleh admin.

---

### 4.5 User Portal — `/user-portal/:module`

**Tipe:** Protected (butuh login owner). Jika tidak terautentikasi → redirect ke `/`.

**Layout: Sidebar Dashboard** — sidebar tetap di kiri, konten utama di kanan.

#### Sidebar (lebar 240px, desktop):
```
┌─────────────────────┐
│ ☆ Yastar            │  ← logo + nama brand
├─────────────────────┤
│ 🏠 Beranda          │  ← aktif = highlight hijau
├─────────────────────┤
│  SIMULASI BISNIS    │  ← section label (uppercase, kecil)
│ 🧮 Target Profit → Klien
│ 📊 Hitung HPP
│ 📈 Titik Impas Usaha   [Starter+]
│ 🏷️ Uji Harga Jual      [Starter+]
│ 🧾 Estimasi Pajak UMKM [Starter+]
│ 🏗️ Kelayakan Cabang Baru [Pro]
│ 💳 Simulasi Pinjaman    [Pro]
├─────────────────────┤
│  AKUN               │  ← section label
│ 📂 Skenario Tersimpan
├─────────────────────┤
│ [nama usaha]        │  ← footer
│ [badge tier] · [N skenario]
│ → Keluar            │
└─────────────────────┘
```

**Badge module:** Modul yang belum bisa diakses menampilkan label tier minimum ("Starter+" atau "Pro") di sisi kanan item nav.

**Item aktif:** Background hijau primer, teks putih, ikon panah kecil di kanan.

**Mobile:** Sidebar tersembunyi, diganti hamburger menu di topbar. Tap area gelap untuk tutup sidebar.

**Topbar mobile:**
- Ikon hamburger (kiri) → buka sidebar
- Logo Yastar (tengah)
- Badge tier akun (kanan)

**Konten halaman:** Berganti sesuai item sidebar yang aktif. Semua konten dibungkus padding `p-6`, max-width `5xl`, centered.

---

### 4.6 Beranda — `/user-portal/beranda`

**Tipe:** Dashboard overview. Default halaman setelah login.

**Konten:**

**Heading:**
- Judul: "Selamat datang, [nama usaha]"
- Sub: "Pilih simulasi bisnis yang ingin kamu jalankan hari ini."

**Stats Strip (row horizontal):**
- Kartu paket: label "Paket" + badge tier (Gratis / Starter / Professional)
- Kartu skenario (klikable): ikon + "[N] dari [max] skenario tersimpan" → klik → `/user-portal/skenario`

**Grid Module Cards (1–3 kolom, responsive):**
Tujuh kartu modul simulasi:

| Kartu | Ikon | Badge |
|---|---|---|
| Target Profit → Klien | Calculator | — |
| Hitung HPP | BarChart2 | — |
| Titik Impas Usaha | TrendingUp | Starter+ |
| Uji Harga Jual & Margin | Tag | Starter+ |
| Estimasi Pajak UMKM | Receipt | Starter+ |
| Kelayakan Cabang Baru | Building2 | Pro |
| Simulasi Pinjaman Modal | CreditCard | Pro |

Setiap kartu:
- Ikon di dalam kotak berwarna (hijau jika accessible, abu jika locked)
- Judul modul
- Deskripsi singkat
- Hover: tampil "Buka simulasi →" (fade in)
- Locked: ikon kunci, teks "Upgrade paket untuk mengakses →"
- Klik kartu accessible → navigasi ke halaman modul

**CTA Upgrade (khusus akun Gratis):**
- Banner di bawah grid
- Teks: "Buka lebih banyak simulasi"
- Tombol: "Hubungi Kami" → WhatsApp link

---

### 4.7 Kalkulator Target Profit → Klien — `/user-portal/target-mundur`

**Deskripsi:** Modul inti Yastar. Owner memasukkan target laba, sistem menghitung mundur berapa klien yang dibutuhkan.

**Layout:** Form input di atas, hasil di bawah (muncul setelah hitung).

**Form Input:**

| Field | Tipe | Keterangan |
|---|---|---|
| Jenis Usaha | Select | Barbershop / Salon / Nail Studio / Spa / Lainnya |
| Jumlah karyawan aktif | Number | |
| Hari kerja per bulan | Number | |
| Jam operasional per hari | Number | |
| Biaya tetap bulanan (Rp) | CurrencyInput | Sewa, listrik, dll. |
| Target profit bulanan (Rp) | CurrencyInput | Titik awal perhitungan mundur |
| Daftar layanan | ServiceListInput | Nama, harga (Rp), durasi (menit) per layanan; bisa tambah/hapus |
| Model komisi | Select | Flat % / Gaji Pokok + Komisi / Komisi Bertingkat |
| Konfigurasi komisi | CommissionConfigInput | Conditional — berubah sesuai model dipilih |

**Tombol:** "Simulasikan" (primary) → hitung; spinner saat loading.

**Output Kalkulasi (Card hasil):**

| Metrik | Contoh |
|---|---|
| Total klien dibutuhkan / bulan | 320 |
| Klien per karyawan / bulan | 160 |
| Klien per karyawan / hari | 6,7 |
| Kapasitas maksimum / bulan | 384 |
| Utilisasi kapasitas | 83,3% |
| Margin laba | 22,4% |
| Status | ✅ Realistis / ⚠️ Perlu ditinjau |

**Insight Engine:** Daftar rekomendasi otomatis dengan badge severity (info/success/warning/danger). Lihat bagian 5.5.

**Aksi:** Tombol "Simpan Skenario" → dialog input nama → `POST /api/scenarios`. Dinonaktifkan jika limit tercapai.

---

### 4.8 Hitung HPP — `/user-portal/hpp`

**Deskripsi:** Menghitung Harga Pokok Produksi/Layanan per unit atau per sesi. Mendukung dua mode.

**Layout:** Toggle mode di atas, form sesuai mode, hasil di bawah.

**Tab Mode:**
- **Produk** — untuk usaha retail/F&B
- **Jasa** — untuk layanan/servis

**Form — Mode Produk:**

| Field | Tipe |
|---|---|
| Nama produk | Text |
| Harga jual (opsional, untuk hitung margin) | CurrencyInput |
| Daftar bahan baku | List: Nama + Qty + Harga Satuan (bisa tambah/hapus) |
| Biaya tenaga kerja langsung per unit | CurrencyInput |
| Biaya overhead produksi bulanan | CurrencyInput |
| Estimasi unit diproduksi / bulan | Number |
| Biaya kemasan per unit | CurrencyInput |

**Form — Mode Jasa:**

| Field | Tipe |
|---|---|
| Nama layanan | Text |
| Harga jual (opsional) | CurrencyInput |
| Bahan habis pakai per sesi | List: Nama + Qty + Harga (bisa tambah/hapus) |
| Biaya tetap bulanan (sewa, listrik, dll.) | CurrencyInput |
| Estimasi jumlah sesi / bulan | Number |
| Komisi/gaji terapis per sesi | CurrencyInput |

**Output:**

| Metrik | Keterangan |
|---|---|
| HPP per unit/sesi | Total biaya pokok |
| Breakdown komponen | Pie / list biaya per komponen |
| Margin (%) | Hanya jika harga jual diisi |
| Markup (%) | Hanya jika harga jual diisi |
| Insights | margin_thin, margin_negative, overhead_allocation_high |

**Aksi:** "Simpan sebagai HPP Tersimpan" → `POST /api/cost-items` (untuk direferensikan modul lain). "Simpan Skenario" → `POST /api/scenarios/module`.

---

### 4.9 Titik Impas Usaha (BEP) — `/user-portal/bep-usaha`

**Deskripsi:** Menghitung berapa unit/sesi per bulan yang harus terjual agar usaha tidak merugi (BEP level bisnis, bukan level karyawan).

**Form Input:**

| Field | Tipe |
|---|---|
| Total biaya tetap bulanan | CurrencyInput |
| Harga jual rata-rata per unit/sesi | CurrencyInput atau "Pilih dari HPP Tersimpan" |
| HPP per unit/sesi | CurrencyInput atau "Pilih dari HPP Tersimpan" |

**"Pilih dari HPP Tersimpan":** Dropdown yang meload data dari `GET /api/cost-items` — owner bisa pilih HPP yang sudah pernah dihitung tanpa input ulang.

**Output:**

| Metrik | Keterangan |
|---|---|
| Unit BEP / bulan | Jumlah minimal unit/sesi |
| Revenue BEP / bulan | Dalam rupiah |
| Kontribusi margin per unit | Harga jual − HPP |
| Insight | Apakah target penjualan owner di atas/bawah BEP |

**Aksi:** Simpan Skenario.

---

### 4.10 Uji Harga Jual & Margin — `/user-portal/harga-jual`

**Deskripsi:** Dua arah kalkulasi harga. Toggle arah kalkulasi.

**Arah 1 — Dari HPP ke Harga Jual:**

| Field | Tipe |
|---|---|
| HPP per unit/sesi | CurrencyInput atau dari HPP Tersimpan |
| Target margin (%) | Number |
| Target markup (%) | Number |

Output: Harga jual yang harus ditetapkan (margin-based & markup-based).

**Arah 2 — Dari Harga Jual ke Margin Aktual:**

| Field | Tipe |
|---|---|
| Harga jual (misal: harga kompetitor) | CurrencyInput |
| HPP per unit/sesi | CurrencyInput atau dari HPP Tersimpan |

Output: Margin aktual (%), markup aktual (%), insight apakah margin sehat.

**Aksi:** Simpan Skenario.

---

### 4.11 Estimasi Pajak UMKM — `/user-portal/pajak`

**Deskripsi:** Estimasi kewajiban pajak bulanan berdasarkan omzet dan skema pajak UMKM.

**⚠️ Disclaimer (selalu ditampilkan di UI):** *"Estimasi ini bersifat umum dan bukan pengganti konsultasi dengan konsultan pajak resmi."*

**Form Input:**

| Field | Tipe |
|---|---|
| Omzet bulanan | CurrencyInput |
| Skema pajak | Select: PPh Final 0,5% (PP 23/2018) / PPh Pasal 17 (Tarif Normal) |
| Total biaya bulanan (opsional, untuk PPh Pasal 17) | CurrencyInput |

**Output:**

| Metrik | Keterangan |
|---|---|
| Estimasi pajak / bulan | Dalam rupiah |
| Estimasi pajak / tahun | |
| Persentase dari omzet | |
| Laba kena pajak (untuk Pasal 17) | Omzet − biaya |

**Aksi:** Simpan Skenario.

---

### 4.12 Kelayakan Cabang Baru — `/user-portal/ekspansi`

**Deskripsi:** Menghitung payback period dan ROI dari rencana pembukaan cabang baru.

**Form Input:**

| Field | Tipe |
|---|---|
| Modal awal cabang baru | CurrencyInput |
| Proyeksi revenue bulanan | CurrencyInput |
| Proyeksi biaya tetap bulanan | CurrencyInput |
| HPP rata-rata (% dari revenue) | Number atau dari HPP Tersimpan |

**Output:**

| Metrik | Keterangan |
|---|---|
| Proyeksi profit bulanan | (Revenue × (1 − HPP%)) − Biaya Tetap |
| Payback period | Dalam bulan dan tahun |
| ROI tahunan (%) | (Profit Bulanan × 12 / Modal Awal) × 100 |
| Insight kelayakan | Contoh: "Payback > 36 bulan — risiko tinggi" |

**Aksi:** Simpan Skenario.

---

### 4.13 Simulasi Pinjaman Modal — `/user-portal/pinjaman`

**Deskripsi:** Simulasi cicilan dan total bunga pinjaman bank/fintech, plus dampak ke profit usaha.

**Form Input:**

| Field | Tipe |
|---|---|
| Plafon pinjaman | CurrencyInput |
| Suku bunga per tahun (%) | Number |
| Tenor | Number (bulan) |
| Metode bunga | Select: Anuitas / Flat |
| Profit bulanan saat ini (opsional) | CurrencyInput |

**Output:**

| Metrik | Keterangan |
|---|---|
| Cicilan bulanan | |
| Total bunga dibayar | Selama tenor |
| Total pembayaran | Pokok + bunga |
| Tabel amortisasi | Bulan per bulan (expandable) |
| Profit setelah cicilan | Hanya jika profit saat ini diisi |

**Aksi:** Simpan Skenario.

---

### 4.14 Skenario Tersimpan — `/user-portal/skenario`

**Deskripsi:** Riwayat semua hasil simulasi yang pernah disimpan owner.

**Layout:** Filter di atas, list/grid kartu skenario di bawah.

**Filter:**
- Dropdown: filter by module type (semua / target mundur / HPP / BEP / dst.)

**Setiap Kartu Skenario:**
- Nama skenario (custom)
- Label module type (badge berwarna)
- Tanggal disimpan
- Ringkasan hasil (berbeda per modul):
  - Target Mundur: Target laba | Klien dibutuhkan | Utilisasi | Status (Realistis/Tidak)
  - HPP: HPP per unit | Margin (jika ada)
  - BEP Usaha: Unit BEP/bulan | Revenue BEP
  - Harga Jual: Harga dari margin | Harga dari markup
  - Pajak: Estimasi pajak/bulan
  - Ekspansi: Payback period | ROI
  - Pinjaman: Cicilan/bulan | Total bunga
- Tombol hapus (ikon trash) → dialog konfirmasi → `DELETE /api/scenarios/:id`

**Footer info:** Jumlah skenario tersimpan vs batas tier. Jika limit tercapai: "Upgrade paket untuk menyimpan lebih banyak."

---

### 4.15 Admin Login — `/admin`

**Tipe:** Publik. Jika admin sudah login, redirect otomatis ke `/admin/dashboard`.

**Layout:** Halaman sederhana, form terpusat.

**Form:**
- Judul: "Yastar Admin"
- Field: Password (satu field, tidak ada email)
- Tombol: "Masuk" (primary)
- Error: "Password salah." jika tidak cocok

**API:** `POST /api/admin/login` → body `{ password }`

---

### 4.16 Admin Dashboard — `/admin/dashboard`

**Layout:** Sidebar admin (kiri) + konten (kanan).

**Sidebar Admin:**
```
┌──────────────────┐
│ Yastar Admin     │
├──────────────────┤
│ 📊 Dashboard     │
│ 👥 Manajemen Akun│
│ 📝 CMS Landing   │
├──────────────────┤
│     [Keluar]     │
└──────────────────┘
```

**Konten Dashboard (Admin Overview):**

**Stat Cards (4 kartu):**
- Total Akun (semua tier)
- Akun Professional
- Akun Starter
- Akun Gratis

**Charts:**
- Pie chart (donut): distribusi akun per tier (Gratis / Starter / Professional)
- Bar chart: rata-rata skenario tersimpan per tier

**Status Paket:**
- Aktif
- Habis dalam 30 hari
- Kadaluarsa
- Tanpa paket (tier Free)

---

### 4.17 Manajemen Akun Admin — `/admin/akun`

**Layout:** Dua kolom — daftar akun (kiri) + detail akun (kanan).

**Kolom Kiri — Daftar Akun:**
- Search input: cari by email
- Tabel: Email | Tier (badge) | Skenario (N/limit) | Kadaluarsa
- Klik baris → muat detail di kanan
- Tombol "Buat Akun" (kanan atas) → buka dialog

**Kolom Kanan — Detail Akun:**
- Email + tanggal daftar
- Nama usaha
- Select tier (Gratis / Starter / Professional) → simpan → `PATCH /api/admin/accounts/:id`
- Input batas skenario (number, kosong = unlimited)
- Date picker kadaluarsa paket
- **Toggle akses per modul:** Switch on/off untuk setiap dari 8 modul:
  - Target Profit → Klien
  - BEP Karyawan
  - Hitung HPP
  - Uji Harga Jual
  - Titik Impas Usaha
  - Kelayakan Cabang
  - Simulasi Pinjaman
  - Estimasi Pajak
- **Riwayat perubahan tier** (scrollable list, kronologis)

**Dialog Buat Akun:**
- Field: Email*, Nama Usaha, Tier (select), Batas Skenario, Tanggal Kadaluarsa
- API: `POST /api/admin/accounts`

---

### 4.18 CMS Landing Page — `/admin/cms`

**Status:** Placeholder — "Segera Hadir". Belum diimplementasikan.

**Rencana:** Edit konten halaman utama (headline, tagline, poin fitur, harga) tanpa deploy ulang.

---

## 5. Detail Fitur & Logika Kalkulasi

### 5.1 Target Profit → Klien (Reverse Target Engine)

**Formula:**
```
avgServicePrice        = rata-rata harga semua layanan (unweighted)
avgDuration            = rata-rata durasi layanan (menit)
effectiveCommission    = resolved dari model komisi dipilih
netProfitPerClient     = avgServicePrice × (1 − effectiveCommission%)
totalMonthlyCosts      = fixedCosts + totalBaseSalary (jika model base+commission)
clientsNeeded          = ceil((totalMonthlyCosts + targetProfit) / netProfitPerClient)
maxCapacityPerEmp/mo   = (workingDays × workingHours × 60) / avgDuration
maxCapacityTotal       = maxCapacityPerEmp × employeeCount
utilizationPercent     = (clientsNeeded / maxCapacityTotal) × 100
isRealistic            = utilizationPercent ≤ 85%
marginPercent          = (netProfitPerClient / avgServicePrice) × 100
```

**Model Komisi Tiered:** Engine melakukan iterasi fixed-point karena commission % bergantung pada jumlah klien, yang juga bergantung pada commission %. Loop berjalan sampai nilai stabil (max 100 iterasi).

---

### 5.2 Hitung HPP

**Mode Produk:**
```
totalBahanBaku     = Σ (qty × hargaSatuan) untuk setiap bahan
overheadPerUnit    = biayaOverheadBulanan / estimasiUnitPerBulan
HPP                = totalBahanBaku + biayaTenagaKerja + overheadPerUnit + biayaKemasan
margin             = (hargaJual − HPP) / hargaJual × 100   [jika harga jual diisi]
markup             = (hargaJual − HPP) / HPP × 100          [jika harga jual diisi]
```

**Mode Jasa:**
```
totalKonsumabel      = Σ (qty × harga) untuk setiap bahan habis pakai
alokasiBiayaTetap    = biayaTetapBulanan / estimasiSesiPerBulan
HPP                  = totalKonsumabel + alokasiBiayaTetap + komisiPerSesi
margin               = (hargaJual − HPP) / hargaJual × 100  [jika harga jual diisi]
```

---

### 5.3 Titik Impas Usaha (BEP)

```
kontribusiMarginPerUnit  = hargaJual − HPP
unitBEPBulanan           = ceil(biayaTetapBulanan / kontribusiMarginPerUnit)
revenueBEPBulanan        = unitBEPBulanan × hargaJual
```

---

### 5.4 Uji Harga Jual & Margin

**Arah 1 (HPP → Harga Jual):**
```
hargaDariMargin   = HPP / (1 − targetMarginPercent / 100)
hargaDariMarkup   = HPP × (1 + targetMarkupPercent / 100)
```

**Arah 2 (Harga Jual → Margin):**
```
marginAktual   = (hargaJual − HPP) / hargaJual × 100
markupAktual   = (hargaJual − HPP) / HPP × 100
```

---

### 5.5 Estimasi Pajak UMKM

**PPh Final 0,5% (PP 23/2018):**
```
pajakBulanan   = omzetBulanan × 0.005
pajakTahunan   = omzetTahunan × 0.005
```

**PPh Pasal 17 (simplified):**
```
labaKenaPajak   = omzetBulanan − totalBiayaBulanan
pajakBulanan    = hitung berdasarkan bracket tarif progresif PPh 17
```
> Disclaimer wajib: estimasi umum, bukan pengganti konsultan pajak.

---

### 5.6 Kelayakan Cabang Baru (Ekspansi)

```
hppPercentOfRevenue   = hpp / hargaJual × 100
profitBulananProyeksi = (revenueBulanan × (1 − hppPercent/100)) − biayaTetapBulanan
paybackPeriodBulan    = ceil(modalAwal / profitBulananProyeksi)
paybackTahun          = paybackPeriodBulan / 12
roiTahunan            = (profitBulananProyeksi × 12 / modalAwal) × 100
```

---

### 5.7 Simulasi Pinjaman Modal

**Metode Anuitas:**
```
bungaPerBulan    = sukuBungaTahunan / 12 / 100
cicilan          = plafon × bungaPerBulan / (1 − (1 + bungaPerBulan)^(−tenor))
totalBunga       = (cicilan × tenor) − plafon
```

**Metode Flat:**
```
cicilanPokok     = plafon / tenor
bungaBulanan     = (plafon × sukuBungaTahunan / 100) / 12
cicilan          = cicilanPokok + bungaBulanan
totalBunga       = bungaBulanan × tenor
```

**Tabel amortisasi:** sisa pokok, bunga dibayar, cicilan per bulan (selama tenor).

---

### 5.8 BEP Karyawan (Break-Even Kapster)

Menghitung berapa lama kapster baru sampai kontribusinya positif ke profit.

**Input:** Harga rata-rata layanan, model komisi, biaya overhead yang ditanggung kapster baru, estimasi klien per hari.

**Output:** Break-even clients needed, break-even days/weeks/months + insights.

**API:** `POST /api/calculate/break-even`

> Catatan: Modul ini ada di backend dan tersedia via API, namun saat ini belum ada halaman mandiri di sidebar. Tersedia melalui kalkulator lama.

---

### 5.9 Rules-Based Insight Engine

Semua modul menghasilkan insight otomatis berbasis aturan (bukan LLM). Insight ditampilkan dengan komponen `InsightList` — badge berwarna per severity.

**Insight Target Mundur:**

| Kode | Kondisi | Severity |
|---|---|---|
| `capacity_exceeded` | Utilisasi > 100% | danger |
| `capacity_warning` | Utilisasi > 85% | warning |
| `margin_danger` | Margin < 10% | danger |
| `margin_warning` | Margin < 15% | warning |
| `high_commission` | Komisi > 50% | warning |
| `capacity_headroom` | Utilisasi < 50% | info |
| `realistic` | Utilisasi ≤ 85% & margin ≥ 15% | success |
| `utilization_too_high` | Utilisasi hampir 100% | danger |

**Insight HPP:**

| Kode | Kondisi | Severity |
|---|---|---|
| `margin_thin_product` | Margin < 15% | warning |
| `margin_negative` | Harga jual < HPP | danger |
| `overhead_allocation_high` | Overhead > 30% dari HPP | warning |

**Insight Ekspansi:**
- Payback period > 36 bulan → danger
- Payback > 24 bulan → warning
- ROI < 20% → warning

---

### 5.10 HPP Tersimpan (Cost Items)

Hasil kalkulasi HPP dapat disimpan sebagai "HPP Tersimpan" (`cost_items`) agar bisa direferensikan oleh modul lain (BEP Usaha, Ekspansi, Harga Jual) tanpa input ulang.

**Alur:** Hitung HPP → klik "Simpan sebagai HPP Tersimpan" → tersedia di dropdown modul BEP dan Harga Jual.

---

### 5.11 Simpan & Bandingkan Skenario

- Setiap hasil kalkulasi bisa disimpan dengan nama custom
- Skenario tersimpan menyimpan: modul type + input lengkap + result snapshot
- Batas skenario bergantung tier (lihat bagian 7)
- Di halaman Skenario Tersimpan, bisa filter by module type
- Hapus skenario satu per satu (dengan dialog konfirmasi)

---

## 6. Alur Pengguna

### 6.1 Alur Owner Baru
```
1. Buka landing page (/) → baca value prop, lihat pricing
2. Klik "Masuk & Hitung Sekarang" atau "Hubungi Kami" → WhatsApp admin
3. Admin provisioning akun + set password awal
4. Login di /sign-in dengan email + password
5. Masuk → redirect otomatis ke /user-portal/beranda
6. Lihat grid modul → pilih modul (misal: Target Profit → Klien)
7. Isi form, klik "Simulasikan"
8. Lihat hasil: metrik + insight
9. Ubah variabel sesuka hati (tidak dibatasi per klik)
10. Simpan skenario dengan nama
11. [Jika limit skenario tercapai] → Upgrade Paket via WhatsApp
```

### 6.2 Alur Upgrade Paket (Manual)
```
1. Owner klik "Hubungi Kami" → buka WhatsApp admin
2. Owner pilih paket, kirim pembayaran + bukti
3. Admin verifikasi
4. Admin buka /admin/akun → cari email → ubah tier + set kadaluarsa
5. Akses modul dan limit skenario berubah real-time
```

### 6.3 Alur Admin Provisioning Akun
```
1. Login ke /admin dengan ADMIN_PASSWORD
2. /admin/akun → "Buat Akun" → isi email, nama usaha, tier, dll.
3. Admin set password owner via tool terpisah (atau API langsung)
4. Bagikan email + password ke owner → langsung bisa login
```

---

## 7. Struktur Tier & Akses Modul

### 7.1 Prinsip
- Klik "Simulasikan" **tidak dibatasi** di modul manapun (bebas eksperimen)
- Yang dibatasi: **akses modul tertentu**, **jumlah skenario tersimpan**, export, benchmark
- Masa berlaku **~1 tahun** (selaras siklus keputusan besar)
- Override per-akun: admin bisa toggle akses modul individual terlepas dari tier

### 7.2 Akses Modul per Tier

| Modul | Gratis | Starter | Professional |
|---|---|---|---|
| Target Profit → Klien | ✓ | ✓ | ✓ |
| BEP Karyawan | ✓ | ✓ | ✓ |
| Hitung HPP | ✓ | ✓ | ✓ |
| Uji Harga Jual & Margin | ✗ | ✓ | ✓ |
| Titik Impas Usaha (BEP) | ✗ | ✓ | ✓ |
| Estimasi Pajak UMKM | ✗ | ✓ | ✓ |
| Kelayakan Cabang Baru | ✗ | ✗ | ✓ |
| Simulasi Pinjaman | ✗ | ✗ | ✓ |

### 7.3 Fitur Lain per Tier

| Fitur | Gratis | Starter | Professional |
|---|---|---|---|
| Skenario tersimpan | 2 | 15 | Unlimited |
| Export / Share | ✗ | ✓ | ✓ |
| Benchmark industri | ✗ | ✗ | ✓ (belum rilis) |

### 7.4 Alur Pembayaran (MVP)
Tidak ada payment gateway otomatis. Upgrade manual via WhatsApp → transfer/QRIS/e-wallet → admin update tier di dashboard.

---

## 8. Autentikasi & Otorisasi

### 8.1 Owner Auth

| Item | Detail |
|---|---|
| Endpoint login | `POST /api/owner/login` — body: `{ email, password }` |
| Password storage | `scrypt` hash + salt, kolom `passwordHash` di tabel `accounts` |
| Session | Signed HMAC cookie `yastar_owner_session` (30 hari), key = `SESSION_SECRET` |
| Logout | `POST /api/owner/logout` — clear cookie |
| Session check | `GET /api/owner/session` → `{ authenticated, accountId, email, businessName }` |
| Proteksi backend | Middleware `requireAuth` di semua endpoint `/api/scenarios`, `/api/me`, `/api/cost-items`, `/api/calculate/*` |
| Proteksi frontend | `UserPortalRoute` di App.tsx → redirect ke `/` jika tidak terautentikasi |

### 8.2 Admin Auth

| Item | Detail |
|---|---|
| Endpoint login | `POST /api/admin/login` — body: `{ password }` |
| Password | `ADMIN_PASSWORD` env secret (plain compare, tidak ada akun DB) |
| Session | Signed HMAC cookie `yastar_admin_session` (12 jam) |
| Logout | `POST /api/admin/logout` |
| Session check | `GET /api/admin/session` |
| Proteksi backend | Middleware `requireAdminAuth` di semua endpoint `/api/admin/*` |
| Proteksi frontend | `AdminGate` di App.tsx — tampilkan form login jika sesi tidak ada |

---

## 9. Arsitektur Teknis

### 9.1 Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | React 18, Vite 7, TypeScript 5.9 |
| **Routing** | Wouter v3 |
| **State / Data Fetching** | TanStack Query v5 |
| **UI Components** | shadcn/ui (Radix UI + Tailwind CSS) |
| **Charts** | Recharts 2 |
| **Backend** | Node.js 24, Express 5, TypeScript 5.9 |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL 16 |
| **Validasi** | Zod v4, drizzle-zod |
| **API Contract** | OpenAPI spec (`lib/api-spec/openapi.yaml`) + Orval codegen → `@workspace/api-client-react` |
| **Build** | esbuild (API server bundle), Vite (frontend) |
| **Monorepo** | pnpm workspaces |
| **Password Hashing** | Node.js `crypto.scrypt` |
| **Session Signing** | Node.js `crypto.createHmac` SHA-256 |

### 9.2 Struktur Monorepo

```
/
├── artifacts/
│   ├── api-server/          # Express API (port via $PORT, default 8080)
│   │   └── src/
│   │       ├── routes/      # Semua route handler
│   │       ├── lib/         # calculationEngine, calculationModules, auth helpers
│   │       └── middlewares/ # requireAuth, requireAdminAuth, clerkProxy
│   └── yastar/              # React frontend (port via $PORT)
│       └── src/
│           ├── pages/       # Halaman-halaman (satu file per halaman)
│           ├── components/  # Komponen reusable
│           └── lib/         # ownerAuth context, queryClient, format utils
├── lib/
│   ├── api-spec/            # openapi.yaml + orval.config.ts
│   ├── api-client-react/    # Generated hooks & types (jangan edit manual)
│   ├── api-zod/             # Zod schemas untuk request/response validation
│   └── db/                  # Drizzle schema, config, client
├── scripts/
│   └── src/
│       └── seed.ts          # Seed demo accounts
└── prd.md
```

### 9.3 Skema Database

#### Tabel `accounts`

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | serial PK | — | |
| `clerk_user_id` | text UNIQUE NOT NULL | — | Placeholder untuk akun non-Clerk |
| `email` | text NOT NULL | — | Lowercase canonical, unique index |
| `business_name` | text | null | Nama usaha owner |
| `tier` | text NOT NULL | `'free'` | `free` / `starter` / `professional` |
| `scenario_limit` | integer | 2 | null = unlimited |
| `export_enabled` | boolean NOT NULL | false | Akses export/share |
| `benchmark_access` | boolean NOT NULL | false | Akses benchmark data |
| `module_access` | jsonb | null | Override akses per modul (lihat 7.2) |
| `package_started_at` | timestamptz | null | |
| `package_expires_at` | timestamptz | null | |
| `password_hash` | text | null | scrypt hash; null = belum set password |
| `created_at` | timestamptz NOT NULL | now() | |
| `updated_at` | timestamptz NOT NULL | now() | auto-update |

**Struktur `module_access` JSONB:**
```json
{
  "target_mundur": true,
  "break_even_karyawan": true,
  "hpp": true,
  "harga_jual": false,
  "bep_usaha": false,
  "ekspansi": false,
  "pinjaman": false,
  "pajak": false
}
```

#### Tabel `scenarios`

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | serial PK | — | |
| `account_id` | integer FK → accounts | — | ON DELETE CASCADE |
| `name` | text NOT NULL | — | Nama skenario (custom oleh owner) |
| `module_type` | text NOT NULL | `'target_mundur'` | Salah satu dari MODULE_TYPES |
| `module_input` | jsonb | null | Input spesifik untuk modul baru |
| `business_type` | text | null | Legacy: untuk modul target_mundur |
| `employee_count` | integer | null | Legacy |
| `working_days_per_month` | integer | null | Legacy |
| `working_hours_per_day` | numeric | null | Legacy |
| `fixed_costs` | numeric | null | Legacy |
| `target_profit` | numeric | null | Legacy |
| `commission_model` | text | null | Legacy |
| `commission_config` | jsonb | null | Legacy |
| `services` | jsonb | null | Legacy |
| `result_snapshot` | jsonb NOT NULL | — | Hasil kalkulasi ter-cache |
| `created_at` | timestamptz NOT NULL | now() | |
| `updated_at` | timestamptz NOT NULL | now() | |

#### Tabel `account_history`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | serial PK | |
| `account_id` | integer FK → accounts | ON DELETE CASCADE |
| `previous_tier` | text | Tier sebelum perubahan |
| `new_tier` | text | Tier setelah perubahan |
| `previous_expires_at` | timestamptz | |
| `new_expires_at` | timestamptz | |
| `note` | text | Catatan admin (opsional) |
| `created_at` | timestamptz NOT NULL | Waktu perubahan |

#### Tabel `cost_items`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | serial PK | |
| `account_id` | integer FK → accounts | ON DELETE CASCADE |
| `nama` | text NOT NULL | Nama produk/layanan |
| `mode` | text NOT NULL | `'produk'` atau `'jasa'` |
| `hpp_input` | jsonb NOT NULL | Input lengkap kalkulasi HPP |
| `hpp_result` | jsonb NOT NULL | Hasil HPP (hpp, margin, breakdown, dll.) |
| `created_at` | timestamptz NOT NULL | |
| `updated_at` | timestamptz NOT NULL | |

---

## 10. API Endpoints

### Owner Auth
| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/owner/login` | — | Login dengan email + password |
| POST | `/api/owner/logout` | — | Hapus session cookie |
| GET | `/api/owner/session` | — | Cek status sesi aktif |

### Owner Account
| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/me` | Owner | Profil owner + tier + batas skenario + module_access |

### Scenarios
| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/scenarios` | Owner | Daftar skenario milik owner |
| POST | `/api/scenarios` | Owner | Simpan skenario target_mundur (legacy) |
| POST | `/api/scenarios/module` | Owner | Simpan skenario modul baru |
| GET | `/api/scenarios/:id` | Owner | Detail skenario |
| PATCH | `/api/scenarios/:id` | Owner | Update nama skenario |
| DELETE | `/api/scenarios/:id` | Owner | Hapus skenario |

### HPP Tersimpan (Cost Items)
| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/cost-items` | Owner | Daftar HPP tersimpan milik owner |
| POST | `/api/cost-items` | Owner | Simpan hasil HPP sebagai cost item |

### Kalkulasi (Stateless — tidak otomatis simpan)
| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/calculate/reverse-target` | Owner | Hitung klien dari target profit |
| POST | `/api/calculate/break-even` | Owner | Hitung break-even kapster baru |
| POST | `/api/calculate/hpp` | Owner | Hitung HPP produk/jasa |
| POST | `/api/calculate/bep-usaha` | Owner | Hitung BEP level bisnis |
| POST | `/api/calculate/harga-jual` | Owner | Hitung harga jual / margin aktual |
| POST | `/api/calculate/pajak` | Owner | Estimasi pajak UMKM |
| POST | `/api/calculate/ekspansi` | Owner | Proyeksi kelayakan cabang baru |
| POST | `/api/calculate/pinjaman` | Owner | Simulasi cicilan pinjaman |

### Admin Auth
| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| POST | `/api/admin/login` | — | Login admin dengan password |
| POST | `/api/admin/logout` | Admin | Logout admin |
| GET | `/api/admin/session` | — | Cek sesi admin |

### Admin Accounts
| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/admin/accounts` | Admin | Daftar semua akun (filter: search by email) |
| POST | `/api/admin/accounts` | Admin | Buat akun baru |
| GET | `/api/admin/accounts/:id` | Admin | Detail akun + riwayat tier |
| PATCH | `/api/admin/accounts/:id` | Admin | Update tier/limit/kadaluarsa/module_access |

### Lainnya
| Method | Path | Auth | Deskripsi |
|---|---|---|---|
| GET | `/api/healthz` | — | Health check |

---

## 11. Komponen Frontend

### Layout Components

| Komponen | File | Fungsi |
|---|---|---|
| `PortalLayout` | `components/portal-layout.tsx` | Sidebar dashboard owner — nav modul, user footer, mobile hamburger |
| `AdminLayout` | `components/admin-layout.tsx` | Sidebar admin — Dashboard / Manajemen Akun / CMS + tombol logout |
| `AuthSplitLayout` | `components/auth-split-layout.tsx` | Layout split-screen hijau+putih untuk halaman login |

### Input Components

| Komponen | File | Fungsi |
|---|---|---|
| `CurrencyInput` | `components/currency-input.tsx` | Input angka dengan format IDR (Rp) real-time |
| `CommissionConfigInput` | `components/commission-config-input.tsx` | Form dinamis untuk 3 model komisi — flat, base+commission, tiered |
| `ServiceListInput` | `components/service-list-input.tsx` | Daftar layanan dinamis — tambah/hapus, nama + harga + durasi |

### Display Components

| Komponen | File | Fungsi |
|---|---|---|
| `InsightList` | `components/insight-list.tsx` | Render daftar insight dengan badge severity berwarna |
| `ValueProposition` | `components/value-proposition.tsx` | Kartu value prop di landing page |

### Context / Providers

| Komponen | File | Fungsi |
|---|---|---|
| `OwnerAuthProvider` | `lib/ownerAuth.tsx` | React context — session owner, `login()`, `logout()`, `refetch()` |

### shadcn/ui Components (dipakai)
`Badge`, `Button`, `Card`, `Dialog`, `DropdownMenu`, `Input`, `Label`, `Select`, `Separator`, `Sheet`, `Switch`, `Table`, `Tabs`, `Toast`, `Tooltip`, `Calendar`, `Popover`, `CurrencyInput`, `ScrollArea`

---

## 12. Konfigurasi & Secrets

| Variabel | Tipe | Fungsi |
|---|---|---|
| `ADMIN_PASSWORD` | Secret | Password login admin dashboard (plain text compare) |
| `SESSION_SECRET` | Secret | Kunci HMAC untuk signing session cookie owner & admin |
| `DATABASE_URL` | Env (runtime-managed) | Koneksi PostgreSQL — diset otomatis oleh Replit |
| `PORT` | Env (runtime-managed) | Port service — diset otomatis per artifact oleh Replit |
| `BASE_PATH` | Env (runtime-managed) | Base URL prefix frontend — diset otomatis oleh Replit |

---

## 13. Akun Demo (Development)

Diseed via `pnpm --filter @workspace/scripts run seed`:

| Email | Password | Tier | Batas Skenario |
|---|---|---|---|
| `demo.free@yastar.app` | `demo1234` | Free | 2 |
| `demo.starter@yastar.app` | `demo1234` | Starter | 15 |
| `demo.professional@yastar.app` | `demo1234` | Professional | Unlimited |

**Admin:** buka `/admin` → masukkan `ADMIN_PASSWORD` secret.

> Catatan: Akun demo tidak terhubung ke sesi Clerk asli (pakai placeholder `clerkUserId`). Hanya terlihat di admin dashboard, tidak bisa login via Clerk. Login via email+password biasa berjalan normal.

---

## 14. Non-Tujuan (Out of Scope)

- Pencatatan transaksi harian (bukan POS)
- Penghitungan payroll / slip gaji aktual
- Sistem booking/reservasi klien
- Input data rutin bulanan (bukan dashboard operasional)
- AI/LLM untuk logika inti kalkulasi (boleh ditambah untuk penjelasan natural language saja)
- Payment gateway otomatis (fase MVP: manual via WhatsApp)
- Penghapusan / reset password mandiri oleh owner (saat ini harus minta admin)

---

## 15. Metrik Keberhasilan

| Metrik | Indikator |
|---|---|
| Aktivasi | % pengunjung yang menyelesaikan 1 simulasi penuh |
| Konversi signup | % pengunjung yang meminta akun (via WhatsApp) |
| Retensi | % akun yang kembali dalam 3 bulan |
| Konversi upgrade | % akun Gratis yang upgrade ke Starter/Professional |
| Time-to-value | Waktu dari landing → hasil simulasi pertama |
| Breadth of use | Rata-rata jumlah modul yang dipakai per akun per bulan |

---

## 16. Risiko & Asumsi

| Asumsi | Risiko jika salah |
|---|---|
| Siklus keputusan besar ~1× per tahun | Masa berlaku 1 tahun mungkin kurang menarik untuk diperbarui |
| Owner bersedia minta akun ke admin (tidak self-register) | Gesekan onboarding tinggi → konversi rendah |
| Admin bisa respons upgrade manual dalam waktu wajar | Keterlambatan → owner frustrasi & churn |
| Rules-based insight cukup bernilai tanpa LLM | Jika insight terasa generik, differensiasi melemah |
| 8 modul cukup untuk keputusan bisnis utama | Owner butuh modul lain yang belum terpikirkan |

---

## 17. Roadmap / Fitur Belum Diimplementasikan

| Fitur | Prioritas | Status | Keterangan |
|---|---|---|---|
| Module access control (middleware) | 🔴 High | Belum | Endpoint belum diproteksi per modul — semua owner bisa akses semua endpoint kalkulasi |
| Export PDF | 🟡 Medium | Belum | Untuk Starter & Professional |
| Password reset mandiri | 🔴 High | Belum | Saat ini harus minta admin |
| CMS Landing Page | 🟡 Medium | Placeholder | Edit konten tanpa deploy |
| Benchmark data industri | 🟢 Low | Belum | Untuk Professional |
| Payment gateway otomatis | 🟡 Medium | Belum | Setelah validasi model bisnis |
| LLM untuk penjelasan natural language | 🟢 Low | Belum | Opsional di atas rules engine |
| Mobile app (Expo) | 🟡 Medium | Belum | Owner lebih banyak di HP |
| Unit test formula kalkulasi | 🔴 High | Belum | HPP, BEP, pinjaman anuitas rawan rounding |
| Self-service password setup | 🔴 High | Belum | Owner harus bisa set password sendiri saat akun baru |

---

## 18. Riwayat Versi

| Versi | Perubahan Utama |
|---|---|
| v0.5 | Model prabayar 30 hari, jatah dihitung per klik "Simulasikan" |
| v0.6 | Ganti ke pembatasan berbasis fitur & skenario; masa berlaku ~1 tahun; auth Clerk diganti email+password (`scrypt`); Rules-Based Insight Engine; sidebar admin 3 menu; chart di admin dashboard |
| v0.7 | Tambah 6 modul baru (HPP, BEP Usaha, Harga Jual, Pajak, Ekspansi, Pinjaman); User Portal diubah dari tab-based menjadi sidebar dashboard (`/user-portal/:module`); halaman Beranda sebagai overview hub; tabel `cost_items` untuk HPP tersimpan; `module_access` JSONB per akun; admin panel dengan toggle akses per modul |
