import { Router, type IRouter } from "express";
import healthRouter from "./health";
import calculateRouter from "./calculate";
import accountRouter from "./account";
import scenariosRouter from "./scenarios";
import adminRouter from "./admin";
import authRouter from "./auth";
import costItemsRouter from "./costItems";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(calculateRouter);
router.use(accountRouter);
router.use(scenariosRouter);
router.use(adminRouter);
router.use(costItemsRouter);

export default router;
