import { eq, sql } from "drizzle-orm";
import { clerkClient } from "@clerk/express";
import { db, accountsTable, scenariosTable, type Account } from "@workspace/db";
import { logger } from "./logger";

const DEFAULT_FREE_SCENARIO_LIMIT = 2;

/**
 * Loads the account for a Clerk user, creating one on first sight (JIT
 * provisioning). New accounts start on the free tier.
 *
 * If the admin has pre-created an account with the same email (with a
 * placeholder clerkUserId that starts with "admin_provisioned_"), we link it
 * to the real Clerk user on first login so the tier/limits the admin set are
 * preserved.
 *
 * Email comparison is always case-insensitive: both the stored value and the
 * Clerk-supplied value are normalised to lowercase before any lookup or insert.
 */
export async function getOrCreateAccount(clerkUserId: string): Promise<Account> {
  // 1. Fast path: existing account keyed by Clerk user ID.
  const [existing] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.clerkUserId, clerkUserId));

  if (existing) {
    return existing;
  }

  // 2. Fetch Clerk user details to get the primary email (normalised).
  const user = await clerkClient.users.getUser(clerkUserId);
  const primaryEmail = user.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId,
  );
  const rawEmail =
    primaryEmail?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? "";
  const email = rawEmail.toLowerCase().trim();

  // 3. Admin may have pre-created a DB row by email (placeholder clerkUserId
  //    starts with "admin_provisioned_"). Link it to the real Clerk user.
  if (email) {
    const [preCreated] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.email, email)); // stored value already lowercased at insert

    if (preCreated && preCreated.clerkUserId.startsWith("admin_provisioned_")) {
      const [linked] = await db
        .update(accountsTable)
        .set({ clerkUserId })
        .where(eq(accountsTable.id, preCreated.id))
        .returning();
      if (linked) {
        logger.info({ accountId: linked.id }, "Linked pre-provisioned account to Clerk user");
        return linked;
      }
    }
  }

  // 4. No match — create a fresh free-tier account.
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
