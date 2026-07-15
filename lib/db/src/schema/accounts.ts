import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tierEnum = ["free", "starter", "professional"] as const;
export type TierValue = (typeof tierEnum)[number];

export const MODULE_TYPES = [
  "target_mundur",
  "break_even_karyawan",
  "hpp",
  "harga_jual",
  "bep_usaha",
  "ekspansi",
  "pinjaman",
  "pajak",
] as const;
export type ModuleType = (typeof MODULE_TYPES)[number];

export interface ModuleAccess {
  target_mundur: boolean;
  break_even_karyawan: boolean;
  hpp: boolean;
  harga_jual: boolean;
  bep_usaha: boolean;
  ekspansi: boolean;
  pinjaman: boolean;
  pajak: boolean;
}

export const DEFAULT_MODULE_ACCESS_BY_TIER: Record<TierValue, ModuleAccess> = {
  free: {
    target_mundur: true,
    break_even_karyawan: true,
    hpp: true,
    harga_jual: false,
    bep_usaha: false,
    ekspansi: false,
    pinjaman: false,
    pajak: false,
  },
  starter: {
    target_mundur: true,
    break_even_karyawan: true,
    hpp: true,
    harga_jual: true,
    bep_usaha: true,
    ekspansi: false,
    pinjaman: false,
    pajak: true,
  },
  professional: {
    target_mundur: true,
    break_even_karyawan: true,
    hpp: true,
    harga_jual: true,
    bep_usaha: true,
    ekspansi: true,
    pinjaman: true,
    pajak: true,
  },
};

export const DEFAULT_MODULE_ACCESS: ModuleAccess =
  DEFAULT_MODULE_ACCESS_BY_TIER.free;

export const accountsTable = pgTable(
  "accounts",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    email: text("email").notNull(),
    businessName: text("business_name"),
    tier: text("tier").notNull().default("free"),
    scenarioLimit: integer("scenario_limit").default(2),
    exportEnabled: boolean("export_enabled").notNull().default(false),
    benchmarkAccess: boolean("benchmark_access").notNull().default(false),
    moduleAccess: jsonb("module_access").$type<ModuleAccess>(),
    packageStartedAt: timestamp("package_started_at", { withTimezone: true }),
    packageExpiresAt: timestamp("package_expires_at", { withTimezone: true }),
    passwordHash: text("password_hash"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Enforce canonical (lowercased) email uniqueness at the DB level so
    // case variants of the same address cannot create duplicate rows.
    uniqueIndex("accounts_email_unique").on(sql`lower(${table.email})`),
  ],
);

export const insertAccountSchema = createInsertSchema(accountsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;
