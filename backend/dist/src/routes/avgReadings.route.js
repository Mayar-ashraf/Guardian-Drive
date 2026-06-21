"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/avgHealthReadings.routes.ts
const express_1 = require("express");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const avgReadings_controller_1 = require("../controllers/avgReadings.controller");
const validate_1 = require("../validators/validate");
const avgReadings_1 = require("../schema/avgReadings");
const AuthSystem_1 = require("../middleware/AuthSystem");
const router = (0, express_1.Router)();
// POST /drivers/:driverId/avg-readings 
// trip - scoped token, no user JWT
router.post("/", AuthSystem_1.authorizeSystem, (0, validate_1.validate)(avgReadings_1.createAvgReadingsSchema), avgReadings_controller_1.createDriverAvgReadings);
// GET /drivers/:driverId/avg-readings  - full history, admin/FM only
router.get("/", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)("ADMIN", "FLEET_MANAGER"), (0, validate_1.validate)(avgReadings_1.getDriverAvgReadingsSchema), avgReadings_controller_1.getDriverAvgReadings);
exports.default = router;
/*



*/ 
