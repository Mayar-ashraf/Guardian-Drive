import express from "express";
import { get } from "node:http";
import { createCar, getAllcars, getCarbyID, updateCar, deleteCar } from "../controllers/cars.controller";
import { authorize, authenticate } from './../middleware/AuthMiddleware';
import { validate } from "../validators/validate"
import { updateCarSchema } from "../schema/cars/updateCar.schema"
import { deleteCarSchema } from "../schema/cars/deleteCar.schema"
//import { updateCar, deleteCar } from "../controllers/carsController"
import { Role } from "../../generated/prisma/enums";

const router = express.Router();

router.get("/getAllcars", authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER), getAllcars);
router.post("/createCar", authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER), createCar);
router.get("/getCarbyID", authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER), getCarbyID);
router.patch("/:engineId", authorize("ADMIN"), validate(updateCarSchema), updateCar)
router.delete("/:engineId", authorize("ADMIN"), validate(deleteCarSchema), deleteCar)
export default router;
