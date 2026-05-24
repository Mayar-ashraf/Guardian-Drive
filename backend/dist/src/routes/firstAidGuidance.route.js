"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const enums_1 = require("../../generated/prisma/enums");
const firstAidGuidance_controller_1 = require("../controllers/firstAidGuidance.controller");
const validate_1 = require("../validators/validate");
const createGuidanceSchema_1 = require("../schema/firstAidGuidance/createGuidanceSchema");
const updateGuidance_schema_1 = require("../schema/firstAidGuidance/updateGuidance.schema");
const deleteGuidance_schema_1 = require("../schema/firstAidGuidance/deleteGuidance.schema");
const router = express_1.default.Router();
// 1. GET /first-aid-guidance
router.get("/", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.FLEET_MANAGER, enums_1.Role.ADMIN), firstAidGuidance_controller_1.getAllGuidances);
// 3. GET /api/alerts/:alertId/first-aid-guidance — get guidance for a specific alert
// present in alerts.route.ts
// 4. POST /first-aid-guidance
router.post("/", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.FLEET_MANAGER, enums_1.Role.ADMIN), (0, validate_1.validate)(createGuidanceSchema_1.CreateGuidanceSchema), firstAidGuidance_controller_1.createGuidance);
// 5. PATCH /first-aid-guidance/:guidanceId
router.patch("/:guidanceId", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.FLEET_MANAGER, enums_1.Role.ADMIN), (0, validate_1.validate)(updateGuidance_schema_1.UpdateGuidanceSchema), firstAidGuidance_controller_1.updateGuidance);
// 6. DELETE /first-aid-guidance/:guidanceId
router.delete('/:guidanceId', AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.FLEET_MANAGER, enums_1.Role.ADMIN), (0, validate_1.validate)(deleteGuidance_schema_1.DeleteGuidanceSchema), firstAidGuidance_controller_1.deleteGuidance);
exports.default = router;
