import express from "express";
import { get } from "node:http";
import { getMedicalRecords, getMedicalRecordById, updateMedicalRecord, createMedicalRecord } from "../controllers/medicalInfo.contoller";
import { authenticate, authorize } from "../middleware/AuthMiddleware";
import { Role } from "../../generated/prisma/client";
import { validate } from "../validators/validate";
import { createMedicalInfoSchema, getMedicalRecordByIdSchema, UpdateMedicalRecordSchema } from "../schema/medicalInfo";

const router = express.Router();


router.get("/", authenticate, authorize(Role.DRIVER, Role.ADMIN), getMedicalRecords);
router.get("/:driverId", authenticate, authorize(Role.DRIVER, Role.ADMIN), validate(getMedicalRecordByIdSchema), getMedicalRecordById);
router.post("/:driverId", authenticate, authorize(Role.ADMIN), validate(createMedicalInfoSchema), createMedicalRecord);
router.patch("/:driverId", authenticate, authorize(Role.ADMIN), validate(UpdateMedicalRecordSchema), updateMedicalRecord);
// may add validator here too but update not create validator - check MedicalInfoSchema

export default router;