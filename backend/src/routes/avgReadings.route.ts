
/// FOUND IN USER ROUTER



// import express from "express";
// // removed unused imports
// import { validate } from "../validators/validate"
// import { getDriverAvgReadingsSchema } from "../schema/avgReadings/getDriverAvgReadings.schema"

// import {
//   createDriverAvgReadings,
//   getDriverAvgReadings,
// } from "../controllers/avgReadings.controller";
// import { authenticate, authorize } from "../middleware/AuthMiddleware";

// const router = express.Router();


// router.post("/avg-readings", createDriverAvgReadings);


// router.get(
//   "/:userId",
//   authenticate,
//   authorize("ADMIN", "FLEET_MANAGER"),
//   validate(getDriverAvgReadingsSchema),
//   getDriverAvgReadings
// );

// export default router;
import express from "express"
import { authorize } from '../middleware/AuthMiddleware';
import { validate } from "../validators/validate"
import { Role } from "../../generated/prisma/enums";
import { getAvgReadingsPerTripSchema } from "../schema/avgReadings/getAvgReadingPerTrip";
import { getAvgReadingPerTrip } from "../controllers/avgReadings.controller";

const router = express.Router()

router.get("/trips/:tripId", authorize(Role.ADMIN, Role.FLEET_MANAGER), validate(getAvgReadingsPerTripSchema), getAvgReadingPerTrip)


export default router