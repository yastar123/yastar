import {
  boolean,
  integer,
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
    packageStartedAt: timestamp("package_started_at", { withTimezone: true }),
    packageExpiresAt: timestamp("package_expires_at", { withTimezone: true }),
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
