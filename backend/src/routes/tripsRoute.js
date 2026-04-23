import express from "express"
import { createTrip, readTrips, getTripById, updateTrip, deleteTrip } from "../controllers/tripsController"
import { authorize } from './../middlware/AuthMiddleware';
const router = express.Router()
/*
POST /api/trips
GET /api/trips
GET /api/trips/:tripId
PATCH /api/trips/:tripId
DELETE /api/trips/:tripId
*/
router.post("/", authorize("FLEET_MANAGER"), createTrip)
router.get("/", readTrips)
router.get("/:tripId", getTripById)
router.patch("/:tripId", authorize(["FLEET_MANAGER", "DRIVER"]), updateTrip)
router.delete("/:tripId", authorize("FLEET_MANAGER"), deleteTrip)

/*
POST /api/trips/:tripId/gps
GET /api/trips/:tripId/gps
GET /api/trips/:tripId/heatmap
*/

router.get("/:tripId/gps", getTripLocation);
//router.post("/trips/:tripId/gps", postTripLocation);




export default router