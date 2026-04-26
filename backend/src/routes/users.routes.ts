import express from "express";
import { get} from "node:http";
import { deleteuserbyID, edituserbyID, getAllusers, getuserbyID } from "../controllers/users.controller";
import { authorize ,authenticate} from './../middleware/AuthMiddleware';
import { Role } from "../../generated/prisma/enums";

const router = express.Router();

router.get("/getAllusers",authenticate,authorize(Role.ADMIN,Role.FLEET_MANAGER),getAllusers);
router.get("/getuserbyID/:id",authenticate,authorize(Role.ADMIN,Role.FLEET_MANAGER,Role.DRIVER),getuserbyID);
router.put("/edituserbyID/:id",authenticate,authorize(Role.ADMIN,Role.FLEET_MANAGER,Role.DRIVER),edituserbyID);
router.delete("/deleteuserbyID/:id",authenticate,authorize(Role.ADMIN,Role.FLEET_MANAGER,Role.DRIVER),deleteuserbyID);


export default router;