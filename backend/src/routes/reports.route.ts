import express from "express"

import { emergencyPerformanceReport } from "../controllers/reports.controller";
import{alertsPerDriverReport}from "../controllers/reports.controller";
import { alertsPerConditionReport }  from "../controllers/reports.controller";
import { authorize } from "../middleware/AuthMiddleware";
import { emergencyPerformanceSchema } from "../schema/reports/emergencyPerformance.schema";
import { validate } from "../validators/validate";
import { alertsPerDriverSchema } from "../schema/reports/alertsPerDriver.schema";
import { alertsPerConditionSchema } from "../schema/reports/alertsPerCondition.schema";



const router = express.Router();
/*
GET /api/reports/emergency-performance
GET /api/reports/alerts/yearly
*/
router.get('/emergency-performance', authorize("ADMIN"), validate(emergencyPerformanceSchema), emergencyPerformanceReport);
router.get("/alerts-per-driver/:driverId",authorize("ADMIN"),validate(alertsPerDriverSchema),alertsPerDriverReport);

router.get("/alerts-per-condition",authorize("ADMIN"),validate(alertsPerConditionSchema),alertsPerConditionReport);
//console.log("REPORTS ROUTE FILE LOADED");

export default router;


