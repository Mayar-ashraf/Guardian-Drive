import express from "express"
import { createTrip, readTrips, getTripLocation } from "../controllers/tripsController"
import { authorize } from "../middleware/AuthMiddleware"
const router = express.Router()
/*
POST /api/trips
GET /api/trips
GET /api/trips/:tripId
PATCH /api/trips/:tripId
DELETE /api/trips/:tripId
*/
router.post("/", createTrip)
router.get("/", readTrips)

/*
POST /api/trips/:tripId/gps
GET /api/trips/:tripId/gps
GET /api/trips/:tripId/heatmap
*/

router.get("/:tripId/gps", getTripLocation);
//router.post("/trips/:tripId/gps", postTripLocation);




export default router