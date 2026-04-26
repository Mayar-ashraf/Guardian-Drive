import express from "express"
import { createTrip, readTrips, getTripById, updateTrip, deleteTrip, getTripLocation, sendTripLocation, getTripHeatMap } from "../controllers/tripsController"
import { authorize } from './../middleware/AuthMiddleware';
import { validate } from "../validators/validate"
import { validateRoleBased } from "../validators/roleBasedValidate"
import { createTripSchema } from "../schema/trips/createTrip.schema"
import { getTripByIdSchema } from "../schema/trips/getTripById.schema"
import { readTripsSchema } from "../schema/trips/readTrips.schema"
import { deleteTripSchema } from "../schema/trips/deleteTrip.schema"
import { driverUpdateTripSchema, fleetManagerUpdateTripSchema } from "../schema/trips/updateTrip.schema"
import { tripIdParamSchema } from "../schema/trips/tripIdParam.schema";
import { sendTripLocationSchema } from "../schema/location/sendTripLocation.schema";

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

router.get("/:tripId/gps", validate(tripIdParamSchema), getTripLocation);
router.get("/:tripId/heatmap", validate(tripIdParamSchema), getTripHeatMap);
router.post("/:tripId/gps", authorize("DRIVER"), validate(sendTripLocationSchema), sendTripLocation);



export default router