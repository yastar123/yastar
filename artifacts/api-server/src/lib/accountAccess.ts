import { eq, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import { db, accountsTable, scenariosTable, type Account } from "@workspace/db";
import { logger } from "./logger";

const DEFAULT_FREE_SCENARIO_LIMIT = 2;

/**
 * Loads the account for a Clerk user, creating one on first sight (JIT
 * provisioning). New accounts start on the free tier.
 */
export async function getOrCreateAccount(clerkUserId: string): Promise<Account> {
  const [existing] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.clerkUserId, clerkUserId));

  if (existing) {
    return existing;
  }

  const user = await clerkClient.users.getUser(clerkUserId);
  const primaryEmail = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId,
  );
  const email = primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";

  const [created] = await db
    .insert(accountsTable)
    .values({
      clerkUserId,
      email,
      tier: "free",
      scenarioLimit: DEFAULT_FREE_SCENARIO_LIMIT,
      exportEnabled: false,
      benchmarkAccess: false,
    })
    .onConflictDoNothing({ target: accountsTable.clerkUserId })
    .returning();

  if (created) {
    logger.info({ accountId: created.id }, "Provisioned new account");
    return created;
  }

  // Lost a race with a concurrent request for the same user — read it back.
  const [raced] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.clerkUserId, clerkUserId));
  if (!raced) {
    throw new Error("Failed to provision account");
  }
  return raced;
}

export async function getScenarioCount(accountId: number): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scenariosTable)
    .where(eq(scenariosTable.accountId, accountId));
  return row?.count ?? 0;
}
