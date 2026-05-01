import express from "express"
import { validate } from "../validators/validate";
import { addWearableBandSchema, deleteBandSchema, deviceIdSchema, getAllWearableBandsSchema, getWearableBandSchema, updateBandSchema, wearableBandSchema } from "../schema/wearableBands/wearableBand.schema";
import { addWearableBand, deleteWearableBand, getAllWearableBands, getWearableBandById, updateWearableBand } from "../controllers/wearableBands.controller";
import { authorize } from "../middleware/AuthMiddleware";


const router = express.Router();
/*
GET /api/wearablebands  ---
GET /api/wearablebands/:deviceId  ---
POST /api/wearable-bands ---
DELETE /api/wearable-bands/:deviceID
PATCH /api/wearable-bands/:deviceID
*/
router.get('/', authorize("ADMIN"), validate(getAllWearableBandsSchema), getAllWearableBands);
router.get('/:deviceId', authorize("ADMIN", "DRIVER"), validate(getWearableBandSchema), getWearableBandById);
router.post('', authorize('ADMIN'), validate(wearableBandSchema), addWearableBand);
router.delete('/:deviceId', authorize('ADMIN'), validate(deleteBandSchema), deleteWearableBand);
router.patch('/:deviceId', authorize('ADMIN'), validate(updateBandSchema), updateWearableBand);
export default router