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
  businessType: text("business_type").notNull(),
  employeeCount: integer("employee_count").notNull(),
  workingDaysPerMonth: integer("working_days_per_month").notNull(),
  workingHoursPerDay: numeric("working_hours_per_day", {
    mode: "number",
  }).notNull(),
  fixedCosts: numeric("fixed_costs", { mode: "number" }).notNull(),
  targetProfit: numeric("target_profit", { mode: "number" }).notNull(),
  commissionModel: text("commission_model").notNull(),
  commissionConfig: jsonb("commission_config").notNull(),
  services: jsonb("services").notNull(),
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
