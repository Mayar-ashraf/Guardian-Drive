import express from "express";
import { getAllMedicalRecords, getMedicalRecordById, updateMedicalRecord, createMedicalRecord, getCustomThresholds } from "../controllers/medicalInfo.contoller";
import { authenticate, authorize } from "../middleware/AuthMiddleware";
import { Role } from "../../generated/prisma/client";
import { validate } from "../validators/validate";
import { getMedicalRecordByIdSchema } from "../schema/medicalInfo/getMedicalRecordById.schema";
import { createMedicalInfoSchema } from "../schema/medicalInfo/createMedicalInfo.schema";
import { UpdateMedicalRecordSchema } from "../schema/medicalInfo/updateMedicalInfo.schema";

const router = express.Router();

// ---------------------
// getting custom thresholds  
// ----------------------
// -- no validations as there is no params, driverId out of user token --
router.get("/custom-thresholds", authenticate, authorize(Role.DRIVER), getCustomThresholds)


router.get("/", authenticate, authorize(Role.ADMIN), getAllMedicalRecords);
router.get("/:driverId", authenticate, authorize(Role.DRIVER, Role.ADMIN), validate(getMedicalRecordByIdSchema), getMedicalRecordById);
router.post("/:driverId", authenticate, authorize(Role.ADMIN), validate(createMedicalInfoSchema), createMedicalRecord);
router.patch("/:driverId", authenticate, authorize(Role.ADMIN), validate(UpdateMedicalRecordSchema), updateMedicalRecord);


export default router;