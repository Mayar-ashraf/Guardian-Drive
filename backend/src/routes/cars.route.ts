import express from "express";
import { get } from "node:http";
import { createCar, getAllcars,getCarbyID } from "../controllers/carsController";
import { authorize, authenticate } from './../middleware/AuthMiddleware';
import { Role } from "../../generated/prisma/enums";

const router = express.Router();

router.get("/getAllcars",authenticate,authorize(Role.ADMIN,Role.FLEET_MANAGER,Role.DRIVER), getAllcars );
router.post ("/createCar",authenticate,authorize(Role.ADMIN,Role.FLEET_MANAGER,Role.DRIVER),createCar);
router.get("/getCarbyID",authenticate,authorize(Role.ADMIN,Role.FLEET_MANAGER,Role.DRIVER),getCarbyID);

export default router;
