"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../validators/validate");
const wearableBand_schema_1 = require("../schema/wearableBands/wearableBand.schema");
const wearableBands_controller_1 = require("../controllers/wearableBands.controller");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const router = express_1.default.Router();
/*
GET /api/wearablebands  ---
GET /api/wearablebands/:deviceId  ---
POST /api/wearable-bands ---
DELETE /api/wearable-bands/:deviceID
PATCH /api/wearable-bands/:deviceID
*/
router.get('/', (0, AuthMiddleware_1.authorize)("ADMIN"), (0, validate_1.validate)(wearableBand_schema_1.getAllWearableBandsSchema), wearableBands_controller_1.getAllWearableBands);
router.get('/:deviceId', (0, AuthMiddleware_1.authorize)("ADMIN", "DRIVER"), (0, validate_1.validate)(wearableBand_schema_1.getWearableBandSchema), wearableBands_controller_1.getWearableBandById);
router.post('', (0, AuthMiddleware_1.authorize)('ADMIN'), (0, validate_1.validate)(wearableBand_schema_1.addWearableBandSchema), wearableBands_controller_1.addWearableBand);
router.delete('/:deviceId', (0, AuthMiddleware_1.authorize)('ADMIN'), (0, validate_1.validate)(wearableBand_schema_1.deleteBandSchema), wearableBands_controller_1.deleteWearableBand);
router.patch('/:deviceId', (0, AuthMiddleware_1.authorize)('ADMIN'), (0, validate_1.validate)(wearableBand_schema_1.updateBandSchema), wearableBands_controller_1.updateWearableBand);
exports.default = router;
