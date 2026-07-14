/**
 * Pure business-logic functions for Yastar's reverse-calculation engine.
 * No I/O, no Express types — keeps this testable and easy to reason about.
 */

export type CommissionModel = "flat" | "base_plus_commission" | "tiered";

export interface CommissionTier {
  minClients: number;
  percent: number;
}

export interface CommissionConfig {
  flatPercent?: number | null;
  baseSalary?: number | null;
  baseCommissionPercent?: number | null;
  tiers?: CommissionTier[] | null;
}

export interface ServiceItem {
  name: string;
  price: number;
  durationMinutes: number;
}

export type InsightSeverity = "info" | "success" | "warning" | "danger";

export interface Insight {
  severity: InsightSeverity;
  code: string;
  message: string;
}

export interface ReverseTargetInput {
  businessType: string;
  employeeCount: number;
  workingDaysPerMonth: number;
  workingHoursPerDay: number;
  fixedCosts: number;
  targetProfit: number;
  commissionModel: CommissionModel;
  commissionConfig: CommissionConfig;
  services: ServiceItem[];
}

export interface ReverseTargetResult {
  avgServicePrice: number;
  avgServiceDurationMinutes: number;
  effectiveCommissionPercent: number;
  netProfitPerClient: number;
  totalCostsMonthly: number;
  clientsNeededTotal: number;
  clientsNeededPerEmployee: number;
  clientsNeededPerDayPerEmployee: number;
  maxCapacityPerEmployeePerMonth: number;
  maxCapacityTotalPerMonth: number;
  utilizationPercent: number;
  marginPercent: number;
  isRealistic: boolean;
  insights: Insight[];
}

export interface BreakEvenInput {
  avgServicePrice: number;
  commissionModel: CommissionModel;
  commissionConfig: CommissionConfig;
  monthlyOverheadShare: number;
  estimatedClientsPerDay: number;
}

export interface BreakEvenResult {
  netProfitPerClient: number;
  monthlyFixedCostOfHire: number;
  breakEvenClientsNeeded: number;
  breakEvenDays: number;
  breakEvenWeeks: number;
  breakEvenMonths: number;
  insights: Insight[];
}

function average(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/**
 * Resolves the effective commission percent for a given commission model.
 * For "tiered", the tier bracket depends on how many clients are being
 * served, so callers doing a reverse (target -> clients) computation must
 * iterate: guess a client count, resolve the percent for that bracket,
 * recompute clients needed, and repeat until it stabilizes.
 */
function resolveCommissionPercent(
  model: CommissionModel,
  config: CommissionConfig,
  clientsPerMonth: number,
): number {
  if (model === "flat") {
    return config.flatPercent ?? 0;
  }
  if (model === "base_plus_commission") {
    return config.baseCommissionPercent ?? 0;
  }
  // tiered: pick the highest tier whose minClients <= clientsPerMonth
  const tiers = [...(config.tiers ?? [])].sort(
    (a, b) => a.minClients - b.minClients,
  );
  let percent = 0;
  for (const tier of tiers) {
    if (clientsPerMonth >= tier.minClients) {
      percent = tier.percent;
    }
  }
  return percent;
}

function monthlyBaseSalary(
  model: CommissionModel,
  config: CommissionConfig,
  employeeCount: number,
): number {
  if (model === "base_plus_commission") {
    return (config.baseSalary ?? 0) * employeeCount;
  }
  return 0;
}

export function calculateReverseTarget(
  input: ReverseTargetInput,
): ReverseTargetResult {
  const avgServicePrice = average(input.services.map((s) => s.price));
  const avgServiceDurationMinutes = average(
    input.services.map((s) => s.durationMinutes),
  );

  const baseSalaryMonthly = monthlyBaseSalary(
    input.commissionModel,
    input.commissionConfig,
    input.employeeCount,
  );
  const totalCostsMonthly =
    input.fixedCosts + baseSalaryMonthly + input.targetProfit;

  // Iteratively resolve clients needed <-> effective commission % for
  // tiered commission (fixed-point approximation, a few iterations is
  // enough since the tier ladder is coarse).
  let clientsNeededTotal = 0;
  let effectiveCommissionPercent = resolveCommissionPercent(
    input.commissionModel,
    input.commissionConfig,
    0,
  );

  for (let i = 0; i < 25; i++) {
    const netProfitPerClient =
      avgServicePrice * (1 - effectiveCommissionPercent / 100);
    if (netProfitPerClient <= 0) {
      clientsNeededTotal = Number.POSITIVE_INFINITY;
      break;
    }
    const nextClients = totalCostsMonthly / netProfitPerClient;
    const nextPercent = resolveCommissionPercent(
      input.commissionModel,
      input.commissionConfig,
      nextClients,
    );
    if (
      Math.abs(nextClients - clientsNeededTotal) < 0.01 &&
      nextPercent === effectiveCommissionPercent
    ) {
      clientsNeededTotal = nextClients;
      break;
    }
    clientsNeededTotal = nextClients;
    effectiveCommissionPercent = nextPercent;
  }

  const netProfitPerClient =
    avgServicePrice * (1 - effectiveCommissionPercent / 100);
  const clientsNeededPerEmployee = clientsNeededTotal / input.employeeCount;
  const clientsNeededPerDayPerEmployee =
    clientsNeededPerEmployee / input.workingDaysPerMonth;

  const workingMinutesPerMonth =
    input.workingHoursPerDay * 60 * input.workingDaysPerMonth;
  const maxCapacityPerEmployeePerMonth = avgServiceDurationMinutes
    ? workingMinutesPerMonth / avgServiceDurationMinutes
    : 0;
  const maxCapacityTotalPerMonth =
    maxCapacityPerEmployeePerMonth * input.employeeCount;

  const utilizationPercent = maxCapacityTotalPerMonth
    ? (clientsNeededTotal / maxCapacityTotalPerMonth) * 100
    : Number.POSITIVE_INFINITY;

  const revenueTotal = clientsNeededTotal * avgServicePrice;
  const marginPercent = revenueTotal
    ? (input.targetProfit / revenueTotal) * 100
    : 0;

  const isRealistic = utilizationPercent <= 100 && Number.isFinite(utilizationPercent);

  const insights: Insight[] = [];

  if (!Number.isFinite(clientsNeededTotal)) {
    insights.push({
      severity: "danger",
      code: "commission_exceeds_price",
      message:
        "Komisi yang ditetapkan sama atau lebih besar dari harga layanan, sehingga target profit ini tidak mungkin tercapai. Turunkan komisi atau naikkan harga layanan.",
    });
  } else {
    if (utilizationPercent > 120) {
      insights.push({
        severity: "danger",
        code: "utilization_far_over_capacity",
        message: `Target ini butuh utilisasi ${utilizationPercent.toFixed(0)}% dari kapasitas jam kerja — jauh melebihi kapasitas fisik. Target profit ini tidak realistis dengan jumlah karyawan dan jam kerja saat ini.`,
      });
    } else if (utilizationPercent > 100) {
      insights.push({
        severity: "warning",
        code: "utilization_over_capacity",
        message: `Target ini butuh utilisasi ${utilizationPercent.toFixed(0)}% dari kapasitas jam kerja, sedikit melebihi kapasitas yang tersedia. Pertimbangkan menambah jam kerja, karyawan, atau menurunkan target.`,
      });
    } else if (utilizationPercent > 85) {
      insights.push({
        severity: "warning",
        code: "utilization_near_capacity",
        message: `Target ini butuh utilisasi ${utilizationPercent.toFixed(0)}% dari kapasitas — mendekati batas. Tidak banyak ruang untuk hari sepi atau cuti karyawan.`,
      });
    } else {
      insights.push({
        severity: "success",
        code: "utilization_realistic",
        message: `Target ini hanya butuh utilisasi ${utilizationPercent.toFixed(0)}% dari kapasitas jam kerja — realistis untuk dicapai.`,
      });
    }

    if (marginPercent < 10) {
      insights.push({
        severity: "danger",
        code: "margin_too_thin",
        message: `Margin profit hanya ${marginPercent.toFixed(1)}% dari total pendapatan — sangat tipis dan rentan terhadap kenaikan biaya atau hari sepi.`,
      });
    } else if (marginPercent < 20) {
      insights.push({
        severity: "warning",
        code: "margin_thin",
        message: `Margin profit ${marginPercent.toFixed(1)}% masih tergolong tipis untuk usaha jasa. Pertimbangkan menekan biaya tetap atau menaikkan harga.`,
      });
    }

    if (effectiveCommissionPercent > 50) {
      insights.push({
        severity: "warning",
        code: "commission_above_recommended",
        message: `Komisi efektif ${effectiveCommissionPercent.toFixed(0)}% berada di atas kisaran yang umum disarankan (biasanya 30-50%) untuk industri ini.`,
      });
    }

    if (clientsNeededPerDayPerEmployee > 0 && avgServiceDurationMinutes > 0) {
      const minutesNeededPerDay =
        clientsNeededPerDayPerEmployee * avgServiceDurationMinutes;
      if (minutesNeededPerDay > input.workingHoursPerDay * 60 * 0.95) {
        insights.push({
          severity: "warning",
          code: "daily_schedule_tight",
          message: `Setiap karyawan perlu melayani sekitar ${clientsNeededPerDayPerEmployee.toFixed(1)} klien per hari — jadwal akan sangat padat tanpa jeda istirahat.`,
        });
      }
    }
  }

  return {
    avgServicePrice,
    avgServiceDurationMinutes,
    effectiveCommissionPercent,
    netProfitPerClient,
    totalCostsMonthly,
    clientsNeededTotal,
    clientsNeededPerEmployee,
    clientsNeededPerDayPerEmployee,
    maxCapacityPerEmployeePerMonth,
    maxCapacityTotalPerMonth,
    utilizationPercent,
    marginPercent,
    isRealistic,
    insights,
  };
}

export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const clientsPerMonthEstimate =
    input.estimatedClientsPerDay * 30.4 /* avg days per month */;
  const effectiveCommissionPercent = resolveCommissionPercent(
    input.commissionModel,
    input.commissionConfig,
    clientsPerMonthEstimate,
  );
  const netProfitPerClient =
    input.avgServicePrice * (1 - effectiveCommissionPercent / 100);
  const baseSalary =
    input.commissionModel === "base_plus_commission"
      ? input.commissionConfig.baseSalary ?? 0
      : 0;
  const monthlyFixedCostOfHire = baseSalary + input.monthlyOverheadShare;

  const insights: Insight[] = [];

  if (netProfitPerClient <= 0) {
    return {
      netProfitPerClient,
      monthlyFixedCostOfHire,
      breakEvenClientsNeeded: Number.POSITIVE_INFINITY,
      breakEvenDays: Number.POSITIVE_INFINITY,
      breakEvenWeeks: Number.POSITIVE_INFINITY,
      breakEvenMonths: Number.POSITIVE_INFINITY,
      insights: [
        {
          severity: "danger",
          code: "commission_exceeds_price",
          message:
            "Komisi yang ditetapkan sama atau lebih besar dari harga layanan — karyawan baru ini tidak akan pernah balik modal dengan skema ini.",
        },
      ],
    };
  }

  const breakEvenClientsNeeded = monthlyFixedCostOfHire / netProfitPerClient;
  const breakEvenDays = breakEvenClientsNeeded / input.estimatedClientsPerDay;
  const breakEvenWeeks = breakEvenDays / 7;
  const breakEvenMonths = breakEvenDays / 30.4;

  if (breakEvenMonths > 3) {
    insights.push({
      severity: "danger",
      code: "break_even_too_slow",
      message: `Butuh sekitar ${breakEvenMonths.toFixed(1)} bulan untuk balik modal — cukup lama. Pertimbangkan estimasi klien per hari yang lebih realistis atau skema komisi yang berbeda sebelum merekrut.`,
    });
  } else if (breakEvenMonths > 1.5) {
    insights.push({
      severity: "warning",
      code: "break_even_moderate",
      message: `Balik modal diperkirakan sekitar ${breakEvenMonths.toFixed(1)} bulan — wajar, tapi pastikan estimasi klien per hari realistis.`,
    });
  } else {
    insights.push({
      severity: "success",
      code: "break_even_fast",
      message: `Balik modal diperkirakan hanya sekitar ${breakEvenMonths.toFixed(1)} bulan — cukup cepat, merekrut tampak layak secara finansial.`,
    });
  }

  return {
    netProfitPerClient,
    monthlyFixedCostOfHire,
    breakEvenClientsNeeded,
    breakEvenDays,
    breakEvenWeeks,
    breakEvenMonths,
    insights,
  };
}
