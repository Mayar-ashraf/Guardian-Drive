"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("../../generated/prisma/client");
const alerts_controller_1 = require("../controllers/alerts.controller");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const validate_1 = require("../validators/validate");
const AuthSystem_1 = require("../middleware/AuthSystem");
const firstAidGuidance_controller_1 = require("../controllers/firstAidGuidance.controller");
const getAlertGuidance_schema_1 = require("../schema/firstAidGuidance/getAlertGuidance.schema");
const createAlert_schema_1 = require("../schema/alerts/createAlert.schema");
const FilterAlert_schema_1 = require("../schema/alerts/FilterAlert.schema");
const getAlertById_schema_1 = require("../schema/alerts/getAlertById.schema");
const updateAlert_schema_1 = require("../schema/alerts/updateAlert.schema");
const router = express_1.default.Router();
router.get('/', AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.FLEET_MANAGER, client_1.Role.ADMIN, client_1.Role.DRIVER), (0, validate_1.validate)(FilterAlert_schema_1.FilterAlertSchema), alerts_controller_1.getAlerts);
// Alert Created Returns (Alert - HealthEvent - Response : guidance)
// creating SOS Alert -- Driver
router.post('/', AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.DRIVER), (0, validate_1.validate)(createAlert_schema_1.CreateAlertSchema), alerts_controller_1.createAlert);
// creating Health_Abnormal Alert -- System
router.post('/:driverId/system', AuthSystem_1.authorizeSystem, (0, validate_1.validate)(createAlert_schema_1.CreateAlertSystemSchema), alerts_controller_1.createAlert);
router.get('/:alertId', AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.FLEET_MANAGER, client_1.Role.ADMIN, client_1.Role.DRIVER), (0, validate_1.validate)(getAlertById_schema_1.getAlertByIdSchema), alerts_controller_1.getAlertById);
router.patch('/:alertId', AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.FLEET_MANAGER, client_1.Role.ADMIN), (0, validate_1.validate)(updateAlert_schema_1.UpdateAlertSchema), alerts_controller_1.updateAlertById);
// note for driver the guidance is returned with the alert created variable
router.get('/:alertId/first-aid-guidance', AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.ADMIN, client_1.Role.FLEET_MANAGER), (0, validate_1.validate)(getAlertGuidance_schema_1.GetAlertGuidanceSchema), firstAidGuidance_controller_1.getGuidanceByAlertId);
// added get driver alerts, But is it really needed?-> Driver limited read already handled in getAlerts with the filtering and all
// uncomment if needed by fleet Manager or Admin with already implemented controller method
// router.get('/:driverId', authenticate, authorize(Role.FLEET_MANAGER, Role.ADMIN, Role.DRIVER), getAlertsByDriverId)
exports.default = router;
