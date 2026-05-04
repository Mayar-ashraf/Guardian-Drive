import express from "express";
import { getMedicalRecords, getMedicalRecordById, updateMedicalRecord, createMedicalRecord, getCustomThresholds } from "../controllers/medicalInfo.contoller";
import { authenticate, authorize } from "../middleware/AuthMiddleware";
import { Role } from "../../generated/prisma/client";
import { validate } from "../validators/validate";
import { createMedicalInfoSchema, getMedicalRecordByIdSchema, UpdateMedicalRecordSchema } from "../schema/medicalInfo";

const router = express.Router();


router.get("/", authenticate, authorize(Role.DRIVER, Role.ADMIN), getMedicalRecords);
router.get("/:driverId", authenticate, authorize(Role.DRIVER, Role.ADMIN), validate(getMedicalRecordByIdSchema), getMedicalRecordById);
router.post("/:driverId", authenticate, authorize(Role.ADMIN), validate(createMedicalInfoSchema), createMedicalRecord);
router.patch("/:driverId", authenticate, authorize(Role.ADMIN), validate(UpdateMedicalRecordSchema), updateMedicalRecord);


// getting custom thresholds  -- no validations as there is no params , driverId out of user token
router.get("/custom-threshold", authenticate, authorize(Role.DRIVER), getCustomThresholds)

export default router;