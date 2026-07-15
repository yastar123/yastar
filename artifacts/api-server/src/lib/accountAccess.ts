import { eq, sql } from "drizzle-orm";
import { db, accountsTable, scenariosTable, type Account } from "@workspace/db";
import { logger } from "./logger";

/**
 * Loads the account by its primary key. Throws if not found.
 */
export async function getAccountById(id: number): Promise<Account> {
  const [account] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.id, id));

  if (!account) {
    throw new Error(`Account ${id} not found`);
  }
  return account;
}

export async function getScenarioCount(accountId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scenariosTable)
    .where(eq(scenariosTable.accountId, accountId));
  return row?.count ?? 0;
}
