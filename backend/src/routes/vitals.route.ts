import express from "express"
import { createVitals, getAllOnGoingTripVitals } from "../controllers/vitals.controller";

import { authorize, authenticate } from "../middleware/AuthMiddleware";
const router = express.Router();
router.get('/get-OnGoingTrips-vitals', authenticate, authorize("FLEET_MANAGER"), getAllOnGoingTripVitals);
router.post('/post-OnGoingTrips-vitals', authenticate, authorize("DRIVER"), createVitals);
export default router;