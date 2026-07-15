/**
 * Seeds demo owner accounts (one per tier) with sample saved scenarios so the
 * app and the admin dashboard have realistic data to explore without signing
 * up for real.
 *
 * These are NOT real Clerk-linked users — their clerkUserId is a stable
 * placeholder (`demo_<tier>_owner`) that will never match a real Clerk
 * session, so they can only be inspected through the admin dashboard, not
 * signed into on the owner side.
 *
 * The internal admin dashboard itself has no database row — it is guarded by
 * the shared ADMIN_PASSWORD secret (see artifacts/api-server/src/lib/adminAuth.ts).
 * This script does not create or touch that secret.
 *
 * Usage: pnpm --filter @workspace/scripts run seed
 * Safe to re-run: existing demo accounts (matched by clerkUserId) are
 * updated in place instead of duplicated, and their scenarios are replaced.
 */
import {
  accountHistoryTable,
  accountsTable,
  db,
  pool,
  scenariosTable,
  type InsertScenario,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);
async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = (await scrypt(plain, salt, 64)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

// All demo accounts share this password for easy testing.
const DEMO_PASSWORD = "demo1234";

interface DemoAccountSeed {
  clerkUserId: string;
  email: string;
  businessName: string;
  tier: "free" | "starter" | "professional";
  scenarioLimit: number | null;
  exportEnabled: boolean;
  benchmarkAccess: boolean;
  packageStartedAt: Date | null;
  packageExpiresAt: Date | null;
  scenarios: Omit<InsertScenario, "accountId">[];
}

const now = new Date();
const daysFromNow = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

const demoAccounts: DemoAccountSeed[] = [
  {
    clerkUserId: "demo_free_owner",
    email: "demo.free@yastar.app",
    businessName: "Barbershop Rapi Jaya",
    tier: "free",
    scenarioLimit: 2,
    exportEnabled: false,
    benchmarkAccess: false,
    packageStartedAt: null,
    packageExpiresAt: null,
    scenarios: [
      {
        name: "Target laba Rp10 juta/bulan",
        businessType: "barbershop",
        employeeCount: 2,
        workingDaysPerMonth: 24,
        workingHoursPerDay: 9,
        fixedCosts: 8_000_000,
        targetProfit: 10_000_000,
        commissionModel: "flat",
        commissionConfig: { flatPercent: 40 },
        services: [
          { name: "Potong rambut", price: 35_000, durationMinutes: 30 },
          { name: "Cukur jenggot", price: 20_000, durationMinutes: 15 },
        ],
        resultSnapshot: {
          avgServicePrice: 27_500,
          avgServiceDurationMinutes: 22.5,
          effectiveCommissionPercent: 40,
          netProfitPerClient: 16_500,
          totalCostsMonthly: 18_000_000,
          clientsNeededTotal: 1091,
          clientsNeededPerEmployee: 545.5,
          clientsNeededPerDayPerEmployee: 22.7,
          maxCapacityPerEmployeePerMonth: 576,
          maxCapacityTotalPerMonth: 1152,
          utilizationPercent: 94.7,
          marginPercent: 35.7,
          isRealistic: false,
          insights: [
            {
              severity: "danger",
              code: "utilization_too_high",
              message:
                "Target ini membutuhkan utilisasi 94.7% dari kapasitas maksimum — hampir tidak ada ruang untuk hari libur atau klien batal.",
            },
          ],
        },
      },
    ],
  },
  {
    clerkUserId: "demo_starter_owner",
    email: "demo.starter@yastar.app",
    businessName: "Salon Cantika Indah",
    tier: "starter",
    scenarioLimit: 15,
    exportEnabled: true,
    benchmarkAccess: false,
    packageStartedAt: daysFromNow(-20),
    packageExpiresAt: daysFromNow(10),
    scenarios: [
      {
        name: "Rencana sebelum tambah karyawan",
        businessType: "salon",
        employeeCount: 3,
        workingDaysPerMonth: 25,
        workingHoursPerDay: 8,
        fixedCosts: 15_000_000,
        targetProfit: 20_000_000,
        commissionModel: "base_plus_commission",
        commissionConfig: { baseSalary: 2_500_000, baseCommissionPercent: 20 },
        services: [
          { name: "Creambath", price: 80_000, durationMinutes: 60 },
          { name: "Potong & styling", price: 60_000, durationMinutes: 45 },
          { name: "Smoothing", price: 350_000, durationMinutes: 120 },
        ],
        resultSnapshot: {
          avgServicePrice: 163_333,
          avgServiceDurationMinutes: 75,
          effectiveCommissionPercent: 20,
          netProfitPerClient: 122_667,
          totalCostsMonthly: 22_500_000,
          clientsNeededTotal: 346,
          clientsNeededPerEmployee: 115.3,
          clientsNeededPerDayPerEmployee: 4.6,
          maxCapacityPerEmployeePerMonth: 160,
          maxCapacityTotalPerMonth: 480,
          utilizationPercent: 72.1,
          marginPercent: 47.1,
          isRealistic: true,
          insights: [
            {
              severity: "success",
              code: "healthy_margin",
              message:
                "Margin laba 47.1% berada di kisaran sehat untuk usaha salon dengan model gaji pokok + komisi.",
            },
          ],
        },
      },
      {
        name: "Skenario musim ramai Lebaran",
        businessType: "salon",
        employeeCount: 3,
        workingDaysPerMonth: 26,
        workingHoursPerDay: 10,
        fixedCosts: 15_000_000,
        targetProfit: 35_000_000,
        commissionModel: "base_plus_commission",
        commissionConfig: { baseSalary: 2_500_000, baseCommissionPercent: 20 },
        services: [
          { name: "Creambath", price: 80_000, durationMinutes: 60 },
          { name: "Potong & styling", price: 60_000, durationMinutes: 45 },
          { name: "Smoothing", price: 350_000, durationMinutes: 120 },
        ],
        resultSnapshot: {
          avgServicePrice: 163_333,
          avgServiceDurationMinutes: 75,
          effectiveCommissionPercent: 20,
          netProfitPerClient: 122_667,
          totalCostsMonthly: 22_500_000,
          clientsNeededTotal: 468,
          clientsNeededPerEmployee: 156,
          clientsNeededPerDayPerEmployee: 6,
          maxCapacityPerEmployeePerMonth: 208,
          maxCapacityTotalPerMonth: 624,
          utilizationPercent: 75,
          marginPercent: 60.2,
          isRealistic: true,
          insights: [
            {
              severity: "warning",
              code: "seasonal_spike",
              message:
                "Target musiman ini realistis, tapi pastikan jam kerja tambahan tidak berlangsung terus-menerus di luar musim ramai.",
            },
          ],
        },
      },
    ],
  },
  {
    clerkUserId: "demo_professional_owner",
    email: "demo.professional@yastar.app",
    businessName: "Nirvana Spa & Wellness",
    tier: "professional",
    scenarioLimit: null,
    exportEnabled: true,
    benchmarkAccess: true,
    packageStartedAt: daysFromNow(-90),
    packageExpiresAt: daysFromNow(275),
    scenarios: [
      {
        name: "Target laba tahunan cabang utama",
        businessType: "spa",
        employeeCount: 6,
        workingDaysPerMonth: 24,
        workingHoursPerDay: 9,
        fixedCosts: 45_000_000,
        targetProfit: 60_000_000,
        commissionModel: "tiered",
        commissionConfig: {
          tiers: [
            { minClients: 0, percent: 15 },
            { minClients: 50, percent: 25 },
            { minClients: 90, percent: 35 },
          ],
        },
        services: [
          { name: "Pijat relaksasi 60 menit", price: 250_000, durationMinutes: 60 },
          { name: "Lulur & mandi susu", price: 300_000, durationMinutes: 90 },
          { name: "Paket spa pasangan", price: 550_000, durationMinutes: 120 },
        ],
        resultSnapshot: {
          avgServicePrice: 366_667,
          avgServiceDurationMinutes: 90,
          effectiveCommissionPercent: 25,
          netProfitPerClient: 275_000,
          totalCostsMonthly: 105_000_000,
          clientsNeededTotal: 382,
          clientsNeededPerEmployee: 63.7,
          clientsNeededPerDayPerEmployee: 2.7,
          maxCapacityPerEmployeePerMonth: 144,
          maxCapacityTotalPerMonth: 864,
          utilizationPercent: 44.2,
          marginPercent: 45.9,
          isRealistic: true,
          insights: [
            {
              severity: "info",
              code: "capacity_headroom",
              message:
                "Utilisasi hanya 44.2% dari kapasitas maksimum — masih ada ruang untuk menaikkan target laba tanpa menambah karyawan.",
            },
          ],
        },
      },
    ],
  },
];

async function seed() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  for (const demo of demoAccounts) {
    const [existing] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.clerkUserId, demo.clerkUserId));

    let accountId: number;

    if (existing) {
      accountId = existing.id;
      await db
        .update(accountsTable)
        .set({
          email: demo.email,
          businessName: demo.businessName,
          tier: demo.tier,
          scenarioLimit: demo.scenarioLimit,
          exportEnabled: demo.exportEnabled,
          benchmarkAccess: demo.benchmarkAccess,
          packageStartedAt: demo.packageStartedAt,
          packageExpiresAt: demo.packageExpiresAt,
          passwordHash,
        })
        .where(eq(accountsTable.id, accountId));

      // Replace existing demo scenarios so re-running the seed stays idempotent.
      await db.delete(scenariosTable).where(eq(scenariosTable.accountId, accountId));
    } else {
      const [created] = await db
        .insert(accountsTable)
        .values({
          clerkUserId: demo.clerkUserId,
          email: demo.email,
          businessName: demo.businessName,
          tier: demo.tier,
          scenarioLimit: demo.scenarioLimit,
          exportEnabled: demo.exportEnabled,
          benchmarkAccess: demo.benchmarkAccess,
          packageStartedAt: demo.packageStartedAt,
          packageExpiresAt: demo.packageExpiresAt,
          passwordHash,
        })
        .returning();
      accountId = created.id;

      await db.insert(accountHistoryTable).values({
        accountId,
        previousTier: "free",
        newTier: demo.tier,
        previousExpiresAt: null,
        newExpiresAt: demo.packageExpiresAt,
        note: "Akun demo dibuat oleh seed script",
      });
    }

    if (demo.scenarios.length > 0) {
      await db.insert(scenariosTable).values(
        demo.scenarios.map((scenario) => ({
          ...scenario,
          accountId,
        })),
      );
    }

    console.log(
      `✔ ${demo.tier.padEnd(12)} ${demo.email} — ${demo.scenarios.length} skenario`,
    );
  }

  console.log("\nSelesai. Akun demo di atas hanya terlihat lewat admin dashboard");
  console.log("(clerkUserId placeholder-nya tidak terhubung ke sesi Clerk asli).");
  console.log(
    "Admin dashboard sendiri memakai secret ADMIN_PASSWORD, bukan baris database.",
  );
}

seed()
  .catch((error) => {
    console.error("Seed gagal:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
