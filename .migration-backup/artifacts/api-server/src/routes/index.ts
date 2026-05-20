import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import teachersRouter from "./teachers";
import attendanceRouter from "./attendance";
import contentRouter from "./content";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(teachersRouter);
router.use(attendanceRouter);
router.use(contentRouter);

export default router;
