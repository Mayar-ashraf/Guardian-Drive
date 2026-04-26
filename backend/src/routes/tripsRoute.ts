import express from "express"
import { createTrip, readTrips, getTripById, updateTrip, deleteTrip, getTripLocation } from "../controllers/tripsController"
import { authorize } from './../middleware/AuthMiddleware';
import { validate } from "../validators/validate.ts"
import { validateRoleBased } from "../validators/roleBasedValidate.ts"
import { createTripSchema } from "../schema/trips/createTrip.schema"
import { getTripByIdSchema } from "../schema/trips/getTripById.schema.ts"
import { readTripsSchema } from "../schema/trips/readTrips.schema.ts"
import { deleteTripSchema } from "../schema/trips/deleteTrip.schema.ts"
import { driverUpdateTripSchema, fleetManagerUpdateTripSchema } from "../schema/trips/updateTrip.schema.ts"
const router = express.Router()
router.post("/", authorize("FLEET_MANAGER"), validate(createTripSchema), createTrip)
router.get("/", validate(readTripsSchema), readTrips)
router.get("/:tripId", validate(getTripByIdSchema), getTripById)
router.patch("/:tripId", authorize("FLEET_MANAGER", "DRIVER"), validateRoleBased({ FLEET_MANAGER: fleetManagerUpdateTripSchema, DRIVER: driverUpdateTripSchema }), updateTrip)
router.delete("/:tripId", validate(deleteTripSchema), authorize("FLEET_MANAGER"), deleteTrip)

/*
POST /api/trips/:tripId/gps
GET /api/trips/:tripId/gps
GET /api/trips/:tripId/heatmap
*/

router.get("/:tripId/gps", getTripLocation);
//router.post("/trips/:tripId/gps", postTripLocation);




export default router