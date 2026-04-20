import express from "express"
import { createTrip, readTrips } from "../controllers/tripsController"
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



export default router