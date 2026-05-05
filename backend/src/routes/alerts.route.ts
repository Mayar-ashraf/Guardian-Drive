import express from "express"
import { Role } from "../../generated/prisma/client";
import { getAlerts, createAlert, getAlertById, updateAlertById } from "../controllers/alerts.controller"
import { authenticate, authorize } from "../middleware/AuthMiddleware";
import { validate } from "../validators/validate";
import { authorizeSystem } from "../middleware/AuthSystem";
import { getAlertGuidance } from "../controllers/firstAidGuidance.controller";
import { GetAlertGuidanceSchema } from "../schema/firstAidGuidance/getAlertGuidance.schema";
import { CreateAlertSchema, CreateAlertSystemSchema } from "../schema/alerts/createAlert.schema";
import { FilterAlertSchema } from "../schema/alerts/FilterAlert.schema";
import { getAlertByIdSchema } from "../schema/alerts/getAlertById.schema";
import { UpdateAlertSchema } from "../schema/alerts/updateAlert.schema";

const router = express.Router()

router.get('/', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN, Role.DRIVER), validate(FilterAlertSchema), getAlerts)


// Alert Created Returns (Alert - HealthEvent - Response : guidance)

// creating SOS Alert -- Driver
router.post('/', authenticate, authorize(Role.DRIVER), validate(CreateAlertSchema), createAlert)

// creating Health_Abnormal Alert -- System
router.post('/:driverId/system', authorizeSystem, validate(CreateAlertSystemSchema), createAlert)


router.get('/:alertId', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN, Role.DRIVER), validate(getAlertByIdSchema), getAlertById)
router.patch('/:alertId', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN), validate(UpdateAlertSchema), updateAlertById)


// note for driver the guidance is returned with the alert created variable
router.get('/:alertId/first-aid-guidance', authenticate, authorize(Role.ADMIN, Role.FLEET_MANAGER), validate(GetAlertGuidanceSchema), getAlertGuidance);

// added get driver alerts, But is it really needed?-> Driver limited read already handled in getAlerts with the filtering and all
// uncomment if needed by fleet Manager or Admin with already implemented controller method
// router.get('/:driverId', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN, Role.DRIVER), getAlertsByDriverId)


export default router 