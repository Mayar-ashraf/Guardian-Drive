import express from "express"
import { Role } from "../../generated/prisma/client";
import { getAlerts, createAlert, getAlertById, updateAlertById } from "../controllers/alert.controller"
import { CreateAlertSchema, FilterAlertSchema, getAlertByIdSchema, UpdateAlertSchema } from "../schema/alert"
import { authenticate, authorize } from "../middleware/AuthMiddleware";
import { validate } from "../middleware/validators/validate";

const router = express.Router()

router.get('/', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN, Role.DRIVER), validate(FilterAlertSchema), getAlerts)
router.post('/', authenticate, authorize(Role.DRIVER), validate(CreateAlertSchema), createAlert)
router.get('/:alertId', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN, Role.DRIVER), validate(getAlertByIdSchema), getAlertById)
router.patch('/:alertId', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN), validate(UpdateAlertSchema), updateAlertById)

// added get driver alerts, But is it really needed?-> Driver limited read already handled in getAlerts with the filtering and all
// uncomment if needed by fleet Manager or Admin with already implemented controller method
// router.get('/:driverId', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN, Role.DRIVER), getAlertsByDriverId)


export default router 