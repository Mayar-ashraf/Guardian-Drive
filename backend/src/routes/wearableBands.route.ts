import express from "express"
import { validate } from "../validators/validate";
import { getWearablebandSchema } from "../schema/wearableBands/wearableBand.schema";
import { getAllWearableBands, getWearableBandById } from "../controllers/wearableBands.controller";
import { authorize } from "../middleware/AuthMiddleware";


const router = express.Router();
/*
GET /api/wearablebands 
GET /api/wearablebands/:deviceId  ---
POST /api/wearable-bands
DELETE /api/wearable-bands/:deviceID
PATCH /api/wearable-bands/:deviceID
*/
router.get('/', authorize("ADMIN"), validate(), getAllWearableBands);
router.get('/:deviceId', authorize("ADMIN", "DRIVER"), validate(getWearablebandSchema), getWearableBandById);
export default router