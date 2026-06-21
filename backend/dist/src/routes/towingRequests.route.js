"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const validate_1 = require("../validators/validate");
const towingRequests_controller_1 = require("../controllers/towingRequests.controller");
const towingRequests_schema_1 = require("../schema/towingRequests/towingRequests.schema");
const router = express_1.default.Router();
router.post("/", (0, AuthMiddleware_1.authorize)("FLEET_MANAGER"), (0, validate_1.validate)(towingRequests_schema_1.createTowingRequestSchema), towingRequests_controller_1.createTowingRequest);
router.get("/", (0, AuthMiddleware_1.authorize)("ADMIN", "FLEET_MANAGER"), (0, validate_1.validate)(towingRequests_schema_1.getTowingRequestsSchema), towingRequests_controller_1.getTowingRequests);
router.get("/:towingRequestId", (0, AuthMiddleware_1.authorize)("ADMIN", "FLEET_MANAGER"), (0, validate_1.validate)(towingRequests_schema_1.getTowingRequestByIdSchema), towingRequests_controller_1.getTowingRequestById);
router.patch("/:towingRequestId", (0, AuthMiddleware_1.authorize)("FLEET_MANAGER"), (0, validate_1.validate)(towingRequests_schema_1.updateTowingRequestSchema), towingRequests_controller_1.updateTowingRequest);
router.delete("/:towingRequestId", (0, AuthMiddleware_1.authorize)("FLEET_MANAGER"), (0, validate_1.validate)(towingRequests_schema_1.deleteTowingRequestSchema), towingRequests_controller_1.deleteTowingRequest);
exports.default = router;
