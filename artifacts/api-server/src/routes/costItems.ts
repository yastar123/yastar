import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, costItemsTable } from "@workspace/db";
import {
  CreateCostItemBody,
  CreateCostItemResponse,
  ListCostItemsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { getAccountById } from "../lib/accountAccess";

const router: IRouter = Router();

router.use("/cost-items", requireAuth);

router.get("/cost-items", async (req, res): Promise<void> => {
  const account = await getAccountById(req.accountId!);

  const rows = await db
    .select()
    .from(costItemsTable)
    .where(eq(costItemsTable.accountId, account.id))
    .orderBy(desc(costItemsTable.updatedAt));

  res.json(ListCostItemsResponse.parse(rows));
});

router.post("/cost-items", async (req, res): Promise<void> => {
  const account = await getAccountById(req.accountId!);

  const parsed = CreateCostItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(costItemsTable)
    .values({
      accountId: account.id,
      nama: parsed.data.nama,
      mode: parsed.data.mode,
      hppInput: parsed.data.hppInput,
      hppResult: parsed.data.hppResult,
    })
    .returning();

  res.status(201).json(CreateCostItemResponse.parse(created));
});

export default router;
