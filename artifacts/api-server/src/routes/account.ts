import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { GetMyAccountResponse } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { getOrCreateAccount, getScenarioCount } from "../lib/accountAccess";

const router: IRouter = Router();

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  const account = await getOrCreateAccount(userId!);
  const scenarioCount = await getScenarioCount(account.id);

  res.json(
    GetMyAccountResponse.parse({
      id: account.id,
      email: account.email,
      businessName: account.businessName,
      tier: account.tier,
      scenarioLimit: account.scenarioLimit,
      scenarioCount,
      exportEnabled: account.exportEnabled,
      benchmarkAccess: account.benchmarkAccess,
      packageStartedAt: account.packageStartedAt,
      packageExpiresAt: account.packageExpiresAt,
    }),
  );
});

export default router;
