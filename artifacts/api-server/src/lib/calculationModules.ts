/**
 * Calculation engine for all Yastar modules beyond the original reverse-target.
 * Pure functions — no I/O, no Express types.
 */

import type { Insight } from "./calculationEngine";

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface RawMaterialItem {
  name: string;
  qty: number;
  unitPrice: number;
}

// ─── HPP (Hitung Harga Pokok Produksi / Layanan) ─────────────────────────────

export interface HppProdukInput {
  mode: "produk";
  nama: string;
  sellingPrice?: number | null;
  rawMaterials: RawMaterialItem[];
  directLaborCostPerUnit: number;
  monthlyOverhead: number;
  estimatedUnitsPerMonth: number;
  packagingCostPerUnit: number;
}

export interface HppJasaInput {
  mode: "jasa";
  nama: string;
  sellingPrice?: number | null;
  consumablesPerSession: RawMaterialItem[];
  monthlyFixedCosts: number;
  estimatedSessionsPerMonth: number;
  therapistCommissionPerSession: number;
}

export type HppInput = HppProdukInput | HppJasaInput;

export interface HppResult {
  hpp: number;
  sellingPrice: number | null;
  margin: number | null;
  markup: number | null;
  breakdown: Record<string, number>;
  insights: Insight[];
}

export function calculateHpp(input: HppInput): HppResult {
  const insights: Insight[] = [];
  let hpp = 0;
  let breakdown: Record<string, number> = {};

  if (input.mode === "produk") {
    const totalBahanBaku = input.rawMaterials.reduce(
      (sum, m) => sum + m.qty * m.unitPrice,
      0,
    );
    const overheadPerUnit =
      input.estimatedUnitsPerMonth > 0
        ? input.monthlyOverhead / input.estimatedUnitsPerMonth
        : 0;
    hpp =
      totalBahanBaku +
      input.directLaborCostPerUnit +
      overheadPerUnit +
      input.packagingCostPerUnit;
    breakdown = {
      bahan_baku: totalBahanBaku,
      tenaga_kerja: input.directLaborCostPerUnit,
      overhead_per_unit: overheadPerUnit,
      kemasan: input.packagingCostPerUnit,
    };
    if (overheadPerUnit > 0 && hpp > 0) {
      const overheadRatio = overheadPerUnit / hpp;
      if (overheadRatio > 0.3) {
        insights.push({
          severity: "warning",
          code: "overhead_allocation_high",
          message: `Alokasi overhead ${(overheadRatio * 100).toFixed(0)}% dari HPP — cukup tinggi. Pertimbangkan efisiensi biaya operasional atau naikkan volume produksi.`,
        });
      }
    }
  } else {
    const totalKonsumabel = input.consumablesPerSession.reduce(
      (sum, m) => sum + m.qty * m.unitPrice,
      0,
    );
    const alokasiBiayaTetap =
      input.estimatedSessionsPerMonth > 0
        ? input.monthlyFixedCosts / input.estimatedSessionsPerMonth
        : 0;
    hpp =
      totalKonsumabel +
      alokasiBiayaTetap +
      input.therapistCommissionPerSession;
    breakdown = {
      konsumabel: totalKonsumabel,
      alokasi_biaya_tetap: alokasiBiayaTetap,
      komisi_terapis: input.therapistCommissionPerSession,
    };
  }

  const sp = input.sellingPrice ?? null;
  let margin: number | null = null;
  let markup: number | null = null;

  if (sp !== null && sp > 0) {
    margin = ((sp - hpp) / sp) * 100;
    markup = hpp > 0 ? ((sp - hpp) / hpp) * 100 : null;

    if (sp < hpp) {
      insights.push({
        severity: "danger",
        code: "margin_negative",
        message: `Harga jual (${formatIDRSimple(sp)}) lebih rendah dari HPP (${formatIDRSimple(hpp)}). Kamu menjual rugi!`,
      });
    } else if (margin < 15) {
      insights.push({
        severity: "warning",
        code: "margin_thin_product",
        message: `Margin ${margin.toFixed(1)}% tergolong tipis. Idealnya margin minimal 15% untuk keberlanjutan usaha.`,
      });
    }
  }

  return { hpp, sellingPrice: sp, margin, markup, breakdown, insights };
}

// ─── BEP Usaha (Break-Even Point level bisnis) ────────────────────────────────

export interface BepUsahaInput {
  totalBiayaTetapBulanan: number;
  hargaJualPerUnit: number;
  hppPerUnit: number;
}

export interface BepUsahaResult {
  kontribusiMarginPerUnit: number;
  unitBepBulanan: number;
  revenueBepBulanan: number;
  insights: Insight[];
}

export function calculateBepUsaha(input: BepUsahaInput): BepUsahaResult {
  const kontribusiMarginPerUnit = input.hargaJualPerUnit - input.hppPerUnit;
  const insights: Insight[] = [];

  if (kontribusiMarginPerUnit <= 0) {
    return {
      kontribusiMarginPerUnit,
      unitBepBulanan: Number.POSITIVE_INFINITY,
      revenueBepBulanan: Number.POSITIVE_INFINITY,
      insights: [
        {
          severity: "danger",
          code: "margin_nonpositive",
          message:
            "HPP per unit/sesi lebih besar atau sama dengan harga jual — bisnis tidak akan pernah mencapai titik impas dengan angka ini.",
        },
      ],
    };
  }

  const unitBepBulanan = Math.ceil(
    input.totalBiayaTetapBulanan / kontribusiMarginPerUnit,
  );
  const revenueBepBulanan = unitBepBulanan * input.hargaJualPerUnit;

  const marginRatio =
    input.hargaJualPerUnit > 0
      ? (kontribusiMarginPerUnit / input.hargaJualPerUnit) * 100
      : 0;
  if (marginRatio < 20) {
    insights.push({
      severity: "warning",
      code: "contribution_margin_low",
      message: `Contribution margin ${marginRatio.toFixed(1)}% — tipis. Naikkan harga atau tekan HPP untuk BEP lebih cepat.`,
    });
  } else {
    insights.push({
      severity: "success",
      code: "bep_calculated",
      message: `Kamu perlu menjual ${unitBepBulanan} unit/sesi per bulan untuk menutup semua biaya tetap.`,
    });
  }

  return {
    kontribusiMarginPerUnit,
    unitBepBulanan,
    revenueBepBulanan,
    insights,
  };
}

// ─── Harga Jual & Margin ──────────────────────────────────────────────────────

export type HargaJualMode = "dari_hpp" | "dari_harga";
export type HargaJualBasis = "margin" | "markup" | null;

export interface HargaJualInput {
  mode: HargaJualMode;
  hpp: number;
  // from_hpp direction
  targetMarginPercent?: number | null;
  targetMarkupPercent?: number | null;
  // from_price direction
  hargaJual?: number | null;
}

export interface HargaJualResult {
  mode: HargaJualMode;
  hpp: number;
  hargaDariMargin: number | null;
  hargaDariMarkup: number | null;
  marginAktual: number | null;
  markupAktual: number | null;
  insights: Insight[];
}

export function calculateHargaJual(input: HargaJualInput): HargaJualResult {
  const insights: Insight[] = [];
  let hargaDariMargin: number | null = null;
  let hargaDariMarkup: number | null = null;
  let marginAktual: number | null = null;
  let markupAktual: number | null = null;

  if (input.mode === "dari_hpp") {
    if (
      input.targetMarginPercent != null &&
      input.targetMarginPercent > 0 &&
      input.targetMarginPercent < 100
    ) {
      hargaDariMargin = input.hpp / (1 - input.targetMarginPercent / 100);
    }
    if (input.targetMarkupPercent != null && input.targetMarkupPercent >= 0) {
      hargaDariMarkup = input.hpp * (1 + input.targetMarkupPercent / 100);
    }
    if (hargaDariMargin !== null) {
      insights.push({
        severity: "info",
        code: "price_from_margin",
        message: `Harga jual ${formatIDRSimple(hargaDariMargin)} menghasilkan margin ${input.targetMarginPercent}% dari pendapatan.`,
      });
    }
    if (hargaDariMarkup !== null) {
      insights.push({
        severity: "info",
        code: "price_from_markup",
        message: `Harga jual ${formatIDRSimple(hargaDariMarkup)} menghasilkan markup ${input.targetMarkupPercent}% dari HPP.`,
      });
    }
  } else {
    const hj = input.hargaJual;
    if (hj != null && hj > 0) {
      marginAktual = ((hj - input.hpp) / hj) * 100;
      markupAktual = input.hpp > 0 ? ((hj - input.hpp) / input.hpp) * 100 : 0;
      if (hj < input.hpp) {
        insights.push({
          severity: "danger",
          code: "selling_below_hpp",
          message: `Harga jual ini lebih rendah dari HPP — setiap penjualan menyebabkan kerugian.`,
        });
      } else if (marginAktual < 15) {
        insights.push({
          severity: "warning",
          code: "margin_thin",
          message: `Margin aktual ${marginAktual.toFixed(1)}% masih tipis untuk usaha jasa.`,
        });
      } else {
        insights.push({
          severity: "success",
          code: "margin_healthy",
          message: `Margin aktual ${marginAktual.toFixed(1)}% — dalam kisaran yang sehat.`,
        });
      }
    }
  }

  return {
    mode: input.mode,
    hpp: input.hpp,
    hargaDariMargin,
    hargaDariMarkup,
    marginAktual,
    markupAktual,
    insights,
  };
}

// ─── Pajak UMKM ───────────────────────────────────────────────────────────────

export type PajakSkema = "ppfinal" | "normal";

export interface PajakInput {
  omzetBulanan: number;
  skema: PajakSkema;
  totalBiayaBulanan?: number | null; // only for normal scheme
}

export interface PajakResult {
  pajakBulanan: number;
  skema: PajakSkema;
  disclaimer: string;
  insights: Insight[];
}

const PPH_BRACKETS = [
  { maxIncome: 60_000_000, rate: 0.05 },
  { maxIncome: 250_000_000, rate: 0.15 },
  { maxIncome: 500_000_000, rate: 0.25 },
  { maxIncome: 5_000_000_000, rate: 0.3 },
  { maxIncome: Infinity, rate: 0.35 },
];

export function calculatePajak(input: PajakInput): PajakResult {
  const insights: Insight[] = [];
  let pajakBulanan = 0;

  const DISCLAIMER =
    "Estimasi ini bersifat umum dan bukan pengganti konsultasi dengan konsultan pajak atau akuntan resmi. Angka final pajak Anda bisa berbeda berdasarkan kondisi usaha spesifik.";

  if (input.skema === "ppfinal") {
    pajakBulanan = input.omzetBulanan * 0.005;
    insights.push({
      severity: "info",
      code: "ppfinal_info",
      message: `PPh Final 0.5% berlaku selama omzet kumulatif belum melewati Rp 4,8 miliar/tahun (PP 23/2018). Pastikan kondisi usahamu memenuhi syarat.`,
    });
  } else {
    // Simplified progressive: annualize, apply brackets, divide by 12
    const labaKenaPajakTahunan =
      Math.max(0, input.omzetBulanan - (input.totalBiayaBulanan ?? 0)) * 12;
    let totalTax = 0;
    let remaining = labaKenaPajakTahunan;
    let prevBracket = 0;
    for (const bracket of PPH_BRACKETS) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, bracket.maxIncome - prevBracket);
      totalTax += taxable * bracket.rate;
      remaining -= taxable;
      prevBracket = bracket.maxIncome;
    }
    pajakBulanan = totalTax / 12;
    insights.push({
      severity: "warning",
      code: "normal_simplified",
      message: `Kalkulasi PPh Pasal 17 ini menggunakan penyederhanaan laba = omzet dikurangi biaya. Tarif progresif aktual membutuhkan pembukuan lengkap dan konsultasi pajak.`,
    });
  }

  if (pajakBulanan > input.omzetBulanan * 0.02) {
    insights.push({
      severity: "warning",
      code: "tax_burden_high",
      message: `Estimasi pajak bulanan cukup besar relatif terhadap omzet. Pertimbangkan konsultasi dengan konsultan pajak untuk optimalisasi yang sah.`,
    });
  }

  return { pajakBulanan, skema: input.skema, disclaimer: DISCLAIMER, insights };
}

// ─── Ekspansi (Kelayakan Cabang Baru) ─────────────────────────────────────────

export interface EkspansiInput {
  modalAwal: number;
  revenueBulanan: number;
  biayaTetapBulanan: number;
  hppPercentOfRevenue: number; // 0-100
}

export interface EkspansiResult {
  profitBulananProyeksi: number;
  paybackPeriodBulan: number;
  paybackPeriodTahun: number;
  roiTahunan: number;
  insights: Insight[];
}

export function calculateEkspansi(input: EkspansiInput): EkspansiResult {
  const insights: Insight[] = [];
  const profitBulananProyeksi =
    input.revenueBulanan * (1 - input.hppPercentOfRevenue / 100) -
    input.biayaTetapBulanan;

  if (profitBulananProyeksi <= 0) {
    return {
      profitBulananProyeksi,
      paybackPeriodBulan: Number.POSITIVE_INFINITY,
      paybackPeriodTahun: Number.POSITIVE_INFINITY,
      roiTahunan: -100,
      insights: [
        {
          severity: "danger",
          code: "negative_projected_profit",
          message: `Proyeksi profit bulanan negatif (${formatIDRSimple(profitBulananProyeksi)}). Dengan angka ini cabang baru tidak akan pernah mencapai titik impas. Tinjau kembali proyeksi revenue atau tekan biaya tetap.`,
        },
      ],
    };
  }

  const paybackPeriodBulan = input.modalAwal / profitBulananProyeksi;
  const paybackPeriodTahun = paybackPeriodBulan / 12;
  const roiTahunan =
    ((profitBulananProyeksi * 12) / input.modalAwal) * 100;

  if (paybackPeriodBulan > 36) {
    insights.push({
      severity: "danger",
      code: "payback_too_slow",
      message: `Payback period ${paybackPeriodBulan.toFixed(0)} bulan (${paybackPeriodTahun.toFixed(1)} tahun) — lebih dari 3 tahun. Risiko tinggi. Pertimbangkan apakah modal bisa dialokasikan lebih efisien.`,
    });
  } else if (paybackPeriodBulan > 18) {
    insights.push({
      severity: "warning",
      code: "payback_moderate",
      message: `Payback period ${paybackPeriodBulan.toFixed(0)} bulan (${paybackPeriodTahun.toFixed(1)} tahun) — cukup wajar, tapi pastikan proyeksi revenue realistis.`,
    });
  } else {
    insights.push({
      severity: "success",
      code: "payback_fast",
      message: `Payback period ${paybackPeriodBulan.toFixed(0)} bulan — ekspansi tampak layak secara finansial.`,
    });
  }

  if (roiTahunan > 0) {
    insights.push({
      severity: "info",
      code: "roi_info",
      message: `ROI tahunan proyeksi ${roiTahunan.toFixed(1)}% — bandingkan dengan alternatif investasi untuk menilai kelayakannya.`,
    });
  }

  return {
    profitBulananProyeksi,
    paybackPeriodBulan,
    paybackPeriodTahun,
    roiTahunan,
    insights,
  };
}

// ─── Pinjaman Modal ───────────────────────────────────────────────────────────

export type PinjamanMetode = "flat" | "anuitas";

export interface PinjamanInput {
  plafonPinjaman: number;
  sukuBungaTahunan: number; // percent, e.g. 12 for 12%
  tenorBulan: number;
  metode: PinjamanMetode;
  profitBulananSaatIni?: number | null;
}

export interface JadwalCicilan {
  bulan: number;
  pokokBayar: number;
  bungaBayar: number;
  totalCicilan: number;
  saldo: number;
}

export interface PinjamanResult {
  cicilanBulanan: number;
  totalBunga: number;
  totalPembayaran: number;
  profitSetelahCicilan: number | null;
  jadwal: JadwalCicilan[];
  insights: Insight[];
}

export function calculatePinjaman(input: PinjamanInput): PinjamanResult {
  const insights: Insight[] = [];
  const bungaPerBulan = input.sukuBungaTahunan / 12 / 100;
  let cicilanBulanan: number;
  const jadwal: JadwalCicilan[] = [];

  if (input.metode === "anuitas") {
    if (bungaPerBulan === 0) {
      cicilanBulanan = input.plafonPinjaman / input.tenorBulan;
    } else {
      cicilanBulanan =
        (input.plafonPinjaman *
          bungaPerBulan *
          Math.pow(1 + bungaPerBulan, input.tenorBulan)) /
        (Math.pow(1 + bungaPerBulan, input.tenorBulan) - 1);
    }
    let saldo = input.plafonPinjaman;
    for (let i = 1; i <= input.tenorBulan; i++) {
      const bungaBayar = saldo * bungaPerBulan;
      const pokokBayar = cicilanBulanan - bungaBayar;
      saldo = Math.max(0, saldo - pokokBayar);
      jadwal.push({
        bulan: i,
        pokokBayar: Math.round(pokokBayar),
        bungaBayar: Math.round(bungaBayar),
        totalCicilan: Math.round(cicilanBulanan),
        saldo: Math.round(saldo),
      });
    }
  } else {
    // flat
    const cicilanPokok = input.plafonPinjaman / input.tenorBulan;
    const bungaBulanan =
      (input.plafonPinjaman * input.sukuBungaTahunan) / 100 / 12;
    cicilanBulanan = cicilanPokok + bungaBulanan;
    let saldo = input.plafonPinjaman;
    for (let i = 1; i <= input.tenorBulan; i++) {
      saldo = Math.max(0, saldo - cicilanPokok);
      jadwal.push({
        bulan: i,
        pokokBayar: Math.round(cicilanPokok),
        bungaBayar: Math.round(bungaBulanan),
        totalCicilan: Math.round(cicilanBulanan),
        saldo: Math.round(saldo),
      });
    }
  }

  const totalPembayaran = cicilanBulanan * input.tenorBulan;
  const totalBunga = totalPembayaran - input.plafonPinjaman;

  const profitSetelahCicilan =
    input.profitBulananSaatIni != null
      ? input.profitBulananSaatIni - cicilanBulanan
      : null;

  if (totalBunga / input.plafonPinjaman > 0.3) {
    insights.push({
      severity: "warning",
      code: "high_interest_burden",
      message: `Total bunga ${formatIDRSimple(totalBunga)} — ${((totalBunga / input.plafonPinjaman) * 100).toFixed(0)}% dari pokok pinjaman. Pertimbangkan tenor lebih pendek atau negosiasi suku bunga.`,
    });
  }

  if (profitSetelahCicilan !== null) {
    if (profitSetelahCicilan < 0) {
      insights.push({
        severity: "danger",
        code: "cicilan_exceeds_profit",
        message: `Cicilan (${formatIDRSimple(cicilanBulanan)}) melebihi profit bulanan saat ini. Pinjaman ini akan membuat usaha merugi setiap bulan.`,
      });
    } else if (cicilanBulanan / input.profitBulananSaatIni! > 0.4) {
      insights.push({
        severity: "warning",
        code: "cicilan_high_ratio",
        message: `Cicilan mengambil ${((cicilanBulanan / input.profitBulananSaatIni!) * 100).toFixed(0)}% dari profit — cukup besar. Sisakan buffer untuk kebutuhan operasional.`,
      });
    } else {
      insights.push({
        severity: "success",
        code: "cicilan_manageable",
        message: `Cicilan masih dalam batas yang dapat ditanggung dari profit bulanan saat ini.`,
      });
    }
  }

  return {
    cicilanBulanan: Math.round(cicilanBulanan),
    totalBunga: Math.round(totalBunga),
    totalPembayaran: Math.round(totalPembayaran),
    profitSetelahCicilan:
      profitSetelahCicilan !== null ? Math.round(profitSetelahCicilan) : null,
    jadwal,
    insights,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIDRSimple(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
