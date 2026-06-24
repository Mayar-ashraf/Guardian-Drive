
import express from "express"
import { authenticate, authorize } from "../middleware/AuthMiddleware"
import { Role } from "../../generated/prisma/enums"
import { getHealthEventsByDriverId } from "../controllers/healthEvents.controller"
import { validate } from "../validators/validate"
import { getHealthEventByDriverIdSchema } from "../schema/healthEvents/getHealthEventByDriverIdSchema"

const router = express.Router()


export default router;
router.get(
  "/driver/:driverId",
  authenticate,
  authorize("ADMIN", "FLEET_MANAGER"),
  validate(getHealthEventByDriverIdSchema),
  getHealthEventsByDriverId
);