import express from "express"
import { createTrip, readTrips, getTripById, updateTrip, deleteTrip, getTripLocation } from "../controllers/tripsController"
import { authorize } from './../middleware/AuthMiddleware';
import { validate } from "../validators/validate.ts"
import { createTripSchema } from "../schema/trips/createTrip.schema"
const router = express.Router()
router.post("/", authorize("FLEET_MANAGER"), validate(createTripSchema), createTrip)
router.get("/", readTrips)
router.get("/:tripId", getTripById)
router.patch("/:tripId", authorize("FLEET_MANAGER", "DRIVER"), updateTrip)
router.delete("/:tripId", authorize("FLEET_MANAGER"), deleteTrip)

/*
POST /api/trips/:tripId/gps
GET /api/trips/:tripId/gps
GET /api/trips/:tripId/heatmap
*/

router.get("/:tripId/gps", getTripLocation);
//router.post("/trips/:tripId/gps", postTripLocation);




export default router