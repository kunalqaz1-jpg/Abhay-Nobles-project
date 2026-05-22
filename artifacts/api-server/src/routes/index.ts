import { Router } from "express";
import healthRouter from "./health.js";
import schoolRouter from "./school.js";

const router = Router();

router.use(healthRouter);
router.use(schoolRouter);

export default router;
