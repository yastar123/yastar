import { Router, type IRouter } from "express";
import healthRouter from "./health";
import calculateRouter from "./calculate";
import accountRouter from "./account";
import scenariosRouter from "./scenarios";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(calculateRouter);
router.use(accountRouter);
router.use(scenariosRouter);
router.use(adminRouter);

export default router;
