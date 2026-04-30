import express from "express";
import { authorize, authenticate } from "../middleware/AuthMiddleware";
import { validate } from "../validators/validate";

import {
  createTowingRequest, getTowingRequests, getTowingRequestById, updateTowingRequest, deleteTowingRequest,} from "../controllers/towingRequests.controller";

import { createTowingRequestSchema,getTowingRequestsSchema,getTowingRequestByIdSchema,updateTowingRequestSchema,deleteTowingRequestSchema,} from "../schema/towingRequests/towingRequests.schema";

const router = express.Router();

router.post( "/", authorize("FLEET_MANAGER"), validate(createTowingRequestSchema), createTowingRequest);

router.get("/",authorize("ADMIN", "FLEET_MANAGER"),validate(getTowingRequestsSchema),getTowingRequests);

router.get("/:towingRequestId",authorize("ADMIN", "FLEET_MANAGER"),validate(getTowingRequestByIdSchema),getTowingRequestById);
router.patch("/:towingRequestId",authorize("FLEET_MANAGER"),validate(updateTowingRequestSchema),updateTowingRequest);

router.delete("/:towingRequestId",authorize("FLEET_MANAGER"), validate(deleteTowingRequestSchema), deleteTowingRequest);
export default router;