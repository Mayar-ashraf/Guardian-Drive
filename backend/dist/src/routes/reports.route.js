"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../validators/validate");
const getDriverReport_schema_1 = require("../schema/reports/getDriverReport.schema");
const reports_controller_1 = require("../controllers/reports.controller");
const reports_controller_2 = require("../controllers/reports.controller");
const getAlertsByArea_schema_1 = require("../schema/reports/getAlertsByArea.schema");
const reports_controller_3 = require("../controllers/reports.controller");
const reports_controller_4 = require("../controllers/reports.controller");
const reports_controller_5 = require("../controllers/reports.controller");
const fromToDate_schema_1 = require("../schema/reports/fromToDate.schema");
const alertsPerDriver_schema_1 = require("../schema/reports/alertsPerDriver.schema");
const alertsPerCondition_schema_1 = require("../schema/reports/alertsPerCondition.schema");
const yearlyAlerts_schema_1 = require("../schema/reports/yearlyAlerts.schema");
const router = express_1.default.Router();
/*
GET /api/reports/emergency-performance
GET /api/reports/alerts/yearly
*/
router.get('/emergency-performance', (0, validate_1.validate)(fromToDate_schema_1.fromToDateSchema), reports_controller_3.emergencyPerformanceReport);
router.get("/alerts-per-driver/:driverId", (0, validate_1.validate)(alertsPerDriver_schema_1.alertsPerDriverSchema), reports_controller_4.alertsPerDriverReport);
router.get("/alerts-per-condition", (0, validate_1.validate)(alertsPerCondition_schema_1.alertsPerConditionSchema), reports_controller_5.alertsPerConditionReport);
//console.log("REPORTS ROUTE FILE LOADED");
router.get("/alerts/yearly", (0, validate_1.validate)(yearlyAlerts_schema_1.yearlyAlertsSchema), reports_controller_3.yearlyAlertsReport);
router.get("/fleet-managers/trips", (0, validate_1.validate)(fromToDate_schema_1.fromToDateSchema), reports_controller_3.fleetManagersTripsReport);
router.get('/drivers/:driverId', (0, validate_1.validate)(getDriverReport_schema_1.getDriverReportSchema), reports_controller_1.getDriverReport);
router.get('/alerts/per-area', (0, validate_1.validate)(getAlertsByArea_schema_1.getAlertsByAreaSchema), reports_controller_2.getAlertsByArea);
exports.default = router;
