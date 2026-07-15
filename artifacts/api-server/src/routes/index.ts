import { Router, type IRouter } from "express";
import healthRouter from "./health";
import calculateRouter from "./calculate";
import accountRouter from "./account";
import scenariosRouter from "./scenarios";
import adminRouter from "./admin";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(calculateRouter);
router.use(accountRouter);
router.use(scenariosRouter);
router.use(adminRouter);

export default router;
