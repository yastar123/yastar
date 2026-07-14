import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { accountsTable } from "./accounts";

export const accountHistoryTable = pgTable("account_history", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id")
    .notNull()
    .references(() => accountsTable.id, { onDelete: "cascade" }),
  previousTier: text("previous_tier").notNull(),
  newTier: text("new_tier").notNull(),
  previousExpiresAt: timestamp("previous_expires_at", { withTimezone: true }),
  newExpiresAt: timestamp("new_expires_at", { withTimezone: true }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAccountHistorySchema = createInsertSchema(
  accountHistoryTable,
).omit({ id: true, createdAt: true });
export type InsertAccountHistory = z.infer<typeof insertAccountHistorySchema>;
export type AccountHistoryRow = typeof accountHistoryTable.$inferSelect;
