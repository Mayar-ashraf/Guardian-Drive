import express from "express"
import { createTrip, readTrips, getTripById, updateTrip, deleteTrip, getTripLocation, sendTripLocation } from "../controllers/tripsController"
import { authorize } from './../middleware/AuthMiddleware';
import { gpsSchema, sendTripLocationSchema, tripIdParamSchema, validate } from "../validators/validate";
const router = express.Router()
router.post("/", authorize("FLEET_MANAGER"), createTrip)
router.get("/", readTrips)
router.get("/:tripId", getTripById)
router.patch("/:tripId", authorize("FLEET_MANAGER", "DRIVER"), updateTrip)
router.delete("/:tripId", authorize("FLEET_MANAGER"), deleteTrip)

/*
POST /api/trips/:tripId/gps
GET /api/trips/:tripId/gps
GET /api/trips/:tripId/heatmap
*/

router.get("/:tripId/gps", validate(tripIdParamSchema), getTripLocation);
router.post("/:tripId/gps", authorize("DRIVER"), validate(tripIdParamSchema), validate(gpsSchema), sendTripLocation);
router.post("/trips/:tripId/gps", validate(sendTripLocationSchema), sendTripLocation);




export default router