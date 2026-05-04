// src/routes/avgHealthReadings.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "../middleware/AuthMiddleware";
import { createDriverAvgReadings, getDriverAvgReadings } from "../controllers/avgReadings.controller"
import { validate } from "../validators/validate";
import { createAvgReadingsSchema, getDriverAvgReadingsSchema } from "../schema/avgReadings";
import { authorizeSystem } from "../middleware/AuthSystem";

const router = Router();

// POST /drivers/:driverId/avg-readings 
// trip - scoped token, no user JWT
router.post(
    "/",
    authorizeSystem,
    validate(createAvgReadingsSchema),
    createDriverAvgReadings
);

// GET /drivers/:driverId/avg-readings  - full history, admin/FM only
router.get(
    "/",
    authenticate,
    authorize("ADMIN", "FLEET_MANAGER"),
    validate(getDriverAvgReadingsSchema),
    getDriverAvgReadings
);

export default router;