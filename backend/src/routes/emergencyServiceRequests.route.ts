import express from "express"
import { authorize } from "../middleware/AuthMiddleware"
import { validate } from "../validators/validate"
import { createEmergencyServiceRequestSchema } from "../schema/emergencyServiceRequests/createEmergencyServiceRequest.schema"
import { readEmerencyServiceRequestsSchema } from "../schema/emergencyServiceRequests/readEmerencyServiceRequests.schema"
import { getEmergencyServiceRequestByIdSchema } from "../schema/emergencyServiceRequests/getEmergencyServiceRequestById.schema"
import { updateEmergencyServiceRequestSchema } from "../schema/emergencyServiceRequests/updateEmergencyServiceRequest.schema"
import { deleteEmergencyServiceRequestSchema } from "../schema/emergencyServiceRequests/deleteEmergencyServiceRequest.schems"
import { createEmergencyServiceRequest, readEmerencyServiceRequests, getEmergencyServiceRequestById, updateEmergenceServiceRequest, deleteEmergencyServiceRequest } from "../controllers/emergencyServiceRequestsController"
/*
POST /api/emergency-service-requests 
GET /api/emergency-services-requests
GET  /api/emergency-services-requests/:emergencyRequestId
PATCH  /api/emergency_service_requests/:emergencyRequestId
DELETE  /api/emergency-services-requests/:emergencyRequestId
*/
const router = express.Router()
router.post("/", authorize("FLEET_MANAGER"), validate(createEmergencyServiceRequestSchema), createEmergencyServiceRequest)
router.get("/", authorize("ADMIN", "FLEET_MANAGER"), validate(readEmerencyServiceRequestsSchema), readEmerencyServiceRequests)
router.get("/:requestId", authorize("ADMIN", "FLEET_MANAGER"), validate(getEmergencyServiceRequestByIdSchema), getEmergencyServiceRequestById)
router.patch("/:requestId", authorize("FLEET_MANAGER"), validate(updateEmergencyServiceRequestSchema), updateEmergenceServiceRequest)
router.delete("/:requestId", authorize("FLEET_MANAGER"), validate(deleteEmergencyServiceRequestSchema), deleteEmergencyServiceRequest)
export default router