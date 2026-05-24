"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const medicalInfo_contoller_1 = require("../controllers/medicalInfo.contoller");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const client_1 = require("../../generated/prisma/client");
const validate_1 = require("../validators/validate");
const medicalInfo_1 = require("../schema/medicalInfo");
const router = express_1.default.Router();
router.get("/", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.DRIVER, client_1.Role.ADMIN), medicalInfo_contoller_1.getMedicalRecords);
router.get("/:driverId", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.DRIVER, client_1.Role.ADMIN), (0, validate_1.validate)(medicalInfo_1.getMedicalRecordByIdSchema), medicalInfo_contoller_1.getMedicalRecordById);
router.post("/:driverId", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.ADMIN), (0, validate_1.validate)(medicalInfo_1.createMedicalInfoSchema), medicalInfo_contoller_1.createMedicalRecord);
router.patch("/:driverId", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.ADMIN), (0, validate_1.validate)(medicalInfo_1.UpdateMedicalRecordSchema), medicalInfo_contoller_1.updateMedicalRecord);
// getting custom thresholds  -- no validations as there is no params , driverId out of user token
router.get("/custom-threshold", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(client_1.Role.DRIVER), medicalInfo_contoller_1.getCustomThresholds);
exports.default = router;
