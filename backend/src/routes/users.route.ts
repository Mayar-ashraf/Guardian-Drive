import express from "express";
import { deleteuserbyID, edituserbyID, getAllUsers, getuserbyID } from "../controllers/users.controller";
import { authorize, authenticate } from '../middleware/AuthMiddleware';
import { Role } from "../../generated/prisma/enums";
import { validate } from "../validators/validate";
import { getAllUsersSchema } from "../schema/user/getAllUsers.schema";
import { getUserbyIDschema } from "../schema/user/getUserbyID.schema";
import { deleteUserbyIDschema} from "../schema/user/deleteUserbyID.schema";
import { edituserbyIDschema} from "../schema/user/editUserbyID.schema";



const router = express.Router();

router.get(  "/", authenticate, authorize(Role.ADMIN, Role.FLEET_MANAGER),validate(getAllUsersSchema), getAllUsers);

router.get( "/:id", authenticate,authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER),validate(getUserbyIDschema),getuserbyID);

router.put( "/:id", authenticate, authorize(Role.ADMIN, Role.FLEET_MANAGER),  validate(edituserbyIDschema), edituserbyID);
router.delete( "/:id", authenticate, authorize(Role.ADMIN),  validate(deleteUserbyIDschema), deleteuserbyID);

export default router;