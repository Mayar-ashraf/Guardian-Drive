import express from "express"
import { emergencyPerformanceReport } from "../controllers/reports.controller";
import { authorize } from "../middleware/AuthMiddleware";
import { emergencyPerformanceSchema } from "../schema/reports/emergencyPerformance.schema";
import { validate } from "../validators/validate";

const router = express.Router();
/*
GET /api/reports/emergency-performance
GET /api/reports/alerts/yearly
*/
router.get('/emergency-performance', authorize("ADMIN"), validate(emergencyPerformanceSchema), emergencyPerformanceReport);

export default router;


