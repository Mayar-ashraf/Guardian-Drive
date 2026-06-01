import express from "express"
import { authenticate, authorize } from "../middleware/AuthMiddleware"
import { Role } from "../../generated/prisma/enums"
import { getAllGuidances, createGuidance, updateGuidance, deleteGuidance } from "../controllers/firstAidGuidance.controller"
import { validate } from "../validators/validate"
import { CreateGuidanceSchema } from "../schema/firstAidGuidance/createGuidanceSchema"
import { UpdateGuidanceSchema } from "../schema/firstAidGuidance/updateGuidance.schema"
import { DeleteGuidanceSchema } from "../schema/firstAidGuidance/deleteGuidance.schema"

const router = express.Router()

// 1. GET /first-aid-guidance - to get all guidances in the system
router.get("/", authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN), getAllGuidances)

// 3. GET /api/alerts/:alertId/first-aid-guidance — get guidance for a specific alert
// present in alerts.route.ts


// 4. POST /first-aid-guidance      -- to post a new guidance based on the combination (vital [condition + severity] )
router.post("/", authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN), validate(CreateGuidanceSchema), createGuidance)

// 5. PATCH /first-aid-guidance/:guidanceId  -- patches only description , specific action of any guidance
router.patch("/:guidanceId", authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN), validate(UpdateGuidanceSchema), updateGuidance)

// 6. DELETE /first-aid-guidance/:guidanceId        delete by guidance id
router.delete('/:guidanceId', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN), validate(DeleteGuidanceSchema), deleteGuidance)

export default router;