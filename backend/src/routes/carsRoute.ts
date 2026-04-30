import express from "express"
import { authorize } from "../middleware/AuthMiddleware"
import { validate } from "../validators/validate"
import { updateCarSchema } from "../schema/cars/updateCar.schema"
import { deleteCarSchema } from "../schema/cars/deleteCar.schema"
import { updateCar, deleteCar } from "../controllers/carsController"
const router = express.Router()
router.patch("/:engineId", authorize("ADMIN"), validate(updateCarSchema), updateCar)
router.delete("/:engineId", authorize("ADMIN"), validate(deleteCarSchema), deleteCar)
export default router