import {
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { accountsTable } from "./accounts";

export const scenariosTable = pgTable("scenarios", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id")
    .notNull()
    .references(() => accountsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // moduleType identifies which calculation module produced this scenario.
  // 'target_mundur' is the legacy default; new modules set their own type.
  moduleType: text("module_type").notNull().default("target_mundur"),
  // moduleInput stores the raw input for non-target_mundur modules (JSONB).
  // For target_mundur, the specific columns below are used instead.
  moduleInput: jsonb("module_input"),
  // ---- target_mundur-specific columns (kept for backward compat) ----
  businessType: text("business_type").notNull().default("custom"),
  employeeCount: integer("employee_count").notNull().default(1),
  workingDaysPerMonth: integer("working_days_per_month").notNull().default(26),
  workingHoursPerDay: numeric("working_hours_per_day", {
    mode: "number",
  }).notNull().default(8),
  fixedCosts: numeric("fixed_costs", { mode: "number" }).notNull().default(0),
  targetProfit: numeric("target_profit", { mode: "number" }).notNull().default(0),
  commissionModel: text("commission_model").notNull().default("flat"),
  commissionConfig: jsonb("commission_config").notNull().default({}),
  services: jsonb("services").notNull().default([]),
  // resultSnapshot holds the calculation result for all module types.
  resultSnapshot: jsonb("result_snapshot").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertScenarioSchema = createInsertSchema(scenariosTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertScenario = z.infer<typeof insertScenarioSchema>;
export type ScenarioRow = typeof scenariosTable.$inferSelect;
