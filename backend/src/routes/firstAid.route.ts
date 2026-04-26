import express from "express";
import { getFirstAid } from "../controllers/firstAid.controller";
import { validate } from "../validators/validate";
import { alertIdSchema } from "../schema/alert";

const router = express.Router();

// GET /api/first-aid-guidance/:alertId
router.get("/:alertId", validate(alertIdSchema), getFirstAid);

export default router;