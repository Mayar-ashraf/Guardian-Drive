import express from "express"

import { emergencyPerformanceReport, fleetManagersTripsReport, yearlyAlertsReport } from "../controllers/reports.controller";
import { alertsPerDriverReport } from "../controllers/reports.controller";
import { alertsPerConditionReport } from "../controllers/reports.controller";
import { authorize } from "../middleware/AuthMiddleware";
import { fromToDateSchema } from "../schema/reports/fromToDate.schema";
import { validate } from "../validators/validate";
import { alertsPerDriverSchema } from "../schema/reports/alertsPerDriver.schema";
import { alertsPerConditionSchema } from "../schema/reports/alertsPerCondition.schema";
import { yearlyAlertsSchema } from "../schema/reports/yearlyAlerts.schema";



const router = express.Router();
/*
GET /api/reports/emergency-performance
GET /api/reports/alerts/yearly
*/
router.get('/emergency-performance', authorize("ADMIN"), validate(fromToDateSchema), emergencyPerformanceReport);
router.get("/alerts-per-driver/:driverId", authorize("ADMIN"), validate(alertsPerDriverSchema), alertsPerDriverReport);

router.get("/alerts-per-condition", authorize("ADMIN"), validate(alertsPerConditionSchema), alertsPerConditionReport);
//console.log("REPORTS ROUTE FILE LOADED");
router.get("/alerts/yearly", authorize("ADMIN"), validate(yearlyAlertsSchema), yearlyAlertsReport);
router.get("/fleet-managers/trips", authorize("ADMIN"), validate(fromToDateSchema), fleetManagersTripsReport);
export default router;


