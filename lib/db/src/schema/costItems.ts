import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { accountsTable } from "./accounts";

export const costItemsTable = pgTable("cost_items", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id")
    .notNull()
    .references(() => accountsTable.id, { onDelete: "cascade" }),
  nama: text("nama").notNull(),
  mode: text("mode").notNull(), // 'produk' | 'jasa'
  hppInput: jsonb("hpp_input").notNull(),
  hppResult: jsonb("hpp_result").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertCostItemSchema = createInsertSchema(costItemsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCostItem = z.infer<typeof insertCostItemSchema>;
export type CostItemRow = typeof costItemsTable.$inferSelect;
