import express from "express"
import { validate } from "../validators/validate"
import { getDriverReportSchema } from "../schema/reports/getDriverReport.schema"
import { getDriverReport } from "../controllers/reports.controller"
import { getAlertsByArea } from "../controllers/reports.controller"
import { getAlertsByAreaSchema } from "../schema/reports/getAlertsByArea.schema"
const router = express.Router()
router.get('/drivers/:driverId', validate(getDriverReportSchema), getDriverReport)
router.get('/alerts/per-area', validate(getAlertsByAreaSchema), getAlertsByArea)
export default router