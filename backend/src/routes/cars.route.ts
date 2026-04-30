import express from "express";
import { get } from "node:http";
import { getAllCars,getCarById,createCar,updateCar,deleteCar} from "../controllers/cars.controller";
import { authorize, authenticate } from './../middleware/AuthMiddleware';
import { validate } from "../validators/validate"
import { updateCarSchema } from "../schema/cars/updateCar.schema"
import { createCarSchema } from "../schema/cars/createCar.schema"
import { getAllCarsSchema } from "../schema/cars/getAllCars.schema"
import { getCarByIdSchema  } from "../schema/cars/getCarbyID.schema"
import { deleteCarSchema } from "../schema/cars/deleteCar.schema"
//import { updateCar, deleteCar } from "../controllers/carsController"
import { Role } from "../../generated/prisma/enums";
import { Router } from "express";

const router = Router();

router.get("/",validate(getAllCarsSchema),getAllCars);
router.get("/:engineId",validate(getCarByIdSchema),getCarById);
router.post( "/", authorize("ADMIN"),validate(createCarSchema), createCar);
router.patch("/:engineId", authorize("ADMIN"), validate(updateCarSchema), updateCar)
router.delete("/:engineId", authorize("ADMIN"), validate(deleteCarSchema), deleteCar)
export default router;
