
import express from "express"
import { authenticate, authorize } from "../middleware/AuthMiddleware"
import { Role } from "../../generated/prisma/enums"
import { getHealthEventsByDriverId } from "../controllers/healthEvents.controller"
import {getHealthEvents} from   "../controllers/healthEvents.controller"
import { validate } from "../validators/validate"
import { getHealthEventByDriverIdSchema } from "../schema/healthEvents/getHealthEventByDriverIdSchema"

const router = express.Router()


router.get(
  "/driver/:driverId",
  authenticate,
  authorize("ADMIN", "FLEET_MANAGER"),
  validate(getHealthEventByDriverIdSchema),
  getHealthEventsByDriverId
);
router.get("/",  authenticate,
  authorize("ADMIN", "FLEET_MANAGER"),getHealthEvents);
  
export default router;
