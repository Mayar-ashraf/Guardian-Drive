"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trips_controller_1 = require("../controllers/trips.controller");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const validate_1 = require("../validators/validate");
const roleBasedValidate_1 = require("../validators/roleBasedValidate");
const createTrip_schema_1 = require("../schema/trips/createTrip.schema");
const getTripById_schema_1 = require("../schema/trips/getTripById.schema");
const readTrips_schema_1 = require("../schema/trips/readTrips.schema");
const deleteTrip_schema_1 = require("../schema/trips/deleteTrip.schema");
const updateTrip_schema_1 = require("../schema/trips/updateTrip.schema");
const sendTripLocation_schema_1 = require("../schema/location/sendTripLocation.schema");
const getTripLocation_schema_1 = require("../schema/location/getTripLocation.schema");
const router = express_1.default.Router();
router.post("/", (0, AuthMiddleware_1.authorize)("FLEET_MANAGER"), (0, validate_1.validate)(createTrip_schema_1.createTripSchema), trips_controller_1.createTrip);
router.get("/", (0, validate_1.validate)(readTrips_schema_1.readTripsSchema), trips_controller_1.readTrips);
router.get("/:tripId", (0, validate_1.validate)(getTripById_schema_1.getTripByIdSchema), trips_controller_1.getTripById);
router.patch("/:tripId", (0, AuthMiddleware_1.authorize)("FLEET_MANAGER", "DRIVER"), (0, roleBasedValidate_1.validateRoleBased)({ FLEET_MANAGER: updateTrip_schema_1.fleetManagerUpdateTripSchema, DRIVER: updateTrip_schema_1.driverUpdateTripSchema }), trips_controller_1.updateTrip);
router.delete("/:tripId", (0, validate_1.validate)(deleteTrip_schema_1.deleteTripSchema), (0, AuthMiddleware_1.authorize)("FLEET_MANAGER"), trips_controller_1.deleteTrip);
/*
POST /api/trips/:tripId/gps
GET /api/trips/:tripId/gps
GET /api/trips/:tripId/heatmap
*/
router.get("/:tripId/gps", (0, validate_1.validate)(getTripLocation_schema_1.getTripLocationSchema), trips_controller_1.getTripLocation);
router.get("/:tripId/heatmap", (0, validate_1.validate)(getTripLocation_schema_1.getTripLocationSchema), trips_controller_1.getTripHeatMap);
router.post("/:tripId/gps", (0, AuthMiddleware_1.authorize)("DRIVER"), (0, validate_1.validate)(sendTripLocation_schema_1.sendTripLocationSchema), trips_controller_1.sendTripLocation);
exports.default = router;
