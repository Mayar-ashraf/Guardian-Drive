import express from "express"
import { validate } from "../validators/validate"
import { getDriverReportSchema } from "../schema/reports/getDriverReport.schema"
import { getDriverReport } from "../controllers/reports.controller"
import { getAlertsByArea } from "../controllers/reports.controller"
import { getAlertsByAreaSchema } from "../schema/reports/getAlertsByArea.schema"
import { emergencyPerformanceReport, fleetManagersTripsReport, yearlyAlertsReport } from "../controllers/reports.controller";
import { alertsPerDriverReport } from "../controllers/reports.controller";
import { alertsPerConditionReport } from "../controllers/reports.controller";
import { authorize } from "../middleware/AuthMiddleware";
import { fromToDateSchema } from "../schema/reports/fromToDate.schema";
import { alertsPerDriverSchema } from "../schema/reports/alertsPerDriver.schema";
import { alertsPerConditionSchema } from "../schema/reports/alertsPerCondition.schema";
import { yearlyAlertsSchema } from "../schema/reports/yearlyAlerts.schema";


const router = express.Router();
/*
GET /api/reports/emergency-performance
GET /api/reports/alerts/yearly
*/
router.get('/emergency-performance', validate(fromToDateSchema), emergencyPerformanceReport);
router.get("/alerts-per-driver/:driverId", validate(alertsPerDriverSchema), alertsPerDriverReport);

router.get("/alerts-per-condition", validate(alertsPerConditionSchema), alertsPerConditionReport);
//console.log("REPORTS ROUTE FILE LOADED");
router.get("/alerts/yearly", validate(yearlyAlertsSchema), yearlyAlertsReport);
router.get("/fleet-managers/trips", validate(fromToDateSchema), fleetManagersTripsReport);

router.get('/drivers/:driverId', validate(getDriverReportSchema), getDriverReport)
router.get('/alerts/per-area', validate(getAlertsByAreaSchema), getAlertsByArea)

export default router;


