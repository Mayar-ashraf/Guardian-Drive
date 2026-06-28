import express from "express"
import { getAllOnGoingTripVitals } from "../controllers/vitals.controller";

import { authorize, authenticate } from "../middleware/AuthMiddleware";
const router = express.Router();
router.get('/get-OnGoingTrips-vitals', authenticate,authorize("FLEET_MANAGER"),  getAllOnGoingTripVitals);
export default router;