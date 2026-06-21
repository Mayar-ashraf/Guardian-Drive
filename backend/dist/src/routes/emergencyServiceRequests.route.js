"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const validate_1 = require("../validators/validate");
const createEmergencyServiceRequest_schema_1 = require("../schema/emergencyServiceRequests/createEmergencyServiceRequest.schema");
const readEmerencyServiceRequests_schema_1 = require("../schema/emergencyServiceRequests/readEmerencyServiceRequests.schema");
const getEmergencyServiceRequestById_schema_1 = require("../schema/emergencyServiceRequests/getEmergencyServiceRequestById.schema");
const updateEmergencyServiceRequest_schema_1 = require("../schema/emergencyServiceRequests/updateEmergencyServiceRequest.schema");
const deleteEmergencyServiceRequest_schems_1 = require("../schema/emergencyServiceRequests/deleteEmergencyServiceRequest.schems");
const emergencyServiceRequestsController_1 = require("../controllers/emergencyServiceRequestsController");
/*
POST /api/emergency-service-requests
GET /api/emergency-services-requests
GET  /api/emergency-services-requests/:emergencyRequestId
PATCH  /api/emergency_service_requests/:emergencyRequestId
DELETE  /api/emergency-services-requests/:emergencyRequestId
*/
const router = express_1.default.Router();
router.post("/", (0, AuthMiddleware_1.authorize)("FLEET_MANAGER"), (0, validate_1.validate)(createEmergencyServiceRequest_schema_1.createEmergencyServiceRequestSchema), emergencyServiceRequestsController_1.createEmergencyServiceRequest);
router.get("/", (0, AuthMiddleware_1.authorize)("ADMIN", "FLEET_MANAGER"), (0, validate_1.validate)(readEmerencyServiceRequests_schema_1.readEmerencyServiceRequestsSchema), emergencyServiceRequestsController_1.readEmerencyServiceRequests);
router.get("/:requestId", (0, AuthMiddleware_1.authorize)("ADMIN", "FLEET_MANAGER"), (0, validate_1.validate)(getEmergencyServiceRequestById_schema_1.getEmergencyServiceRequestByIdSchema), emergencyServiceRequestsController_1.getEmergencyServiceRequestById);
router.patch("/:requestId", (0, AuthMiddleware_1.authorize)("FLEET_MANAGER"), (0, validate_1.validate)(updateEmergencyServiceRequest_schema_1.updateEmergencyServiceRequestSchema), emergencyServiceRequestsController_1.updateEmergenceServiceRequest);
router.delete("/:requestId", (0, AuthMiddleware_1.authorize)("FLEET_MANAGER"), (0, validate_1.validate)(deleteEmergencyServiceRequest_schems_1.deleteEmergencyServiceRequestSchema), emergencyServiceRequestsController_1.deleteEmergencyServiceRequest);
exports.default = router;
