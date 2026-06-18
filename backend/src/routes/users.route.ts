import express from "express";
import { deleteuserbyID, edituserbyID, getAllUsers, getuserbyID } from "../controllers/users.controller";
import { authorize, authenticate } from '../middleware/AuthMiddleware';
import { Role } from "../../generated/prisma/enums";
import { validate } from "../validators/validate";
import { getAllUsersSchema } from "../schema/user/getAllUsers.schema";
import { getUserbyIDschema } from "../schema/user/getUserbyID.schema";
import { deleteUserbyIDschema } from "../schema/user/deleteUserbyID.schema";
import { edituserbyIDschema } from "../schema/user/editUserbyID.schema";
import { SignupSchema } from "../schema/users"
import { createUser } from "../controllers/users.controller";
import { authorizeSystem } from "../middleware/AuthSystem";
import { createAvgReadingsSchema, getDriverAvgReadingsSchema } from "../schema/avgReadings";
import { createDriverAvgReadings, getDriverAvgReadings } from "../controllers/avgReadings.controller";


const router = express.Router();

router.post("/", authenticate, authorize(Role.ADMIN), validate(SignupSchema), createUser)
//router.post("/", authenticate, validate(SignupSchema), createUser)

router.get("/", authenticate, authorize(Role.ADMIN, Role.FLEET_MANAGER), validate(getAllUsersSchema), getAllUsers);

router.get("/:id", authenticate, authorize(Role.ADMIN, Role.FLEET_MANAGER, Role.DRIVER), validate(getUserbyIDschema), getuserbyID);

//router.get("/:id", validate(getUserbyIDschema), getuserbyID);

router.put("/:id", authenticate, authorize(Role.ADMIN, Role.FLEET_MANAGER), validate(edituserbyIDschema), edituserbyID);
router.delete("/:id", authenticate, authorize(Role.ADMIN), validate(deleteUserbyIDschema), deleteuserbyID);



// -------------------------
// AVG_READINGS ENDPOINTS
// -------------------------


// /users/userId/avg-health-readings
// system scoped token, no user JWT
router.post("/:userId/avg-health-readings",
    authorizeSystem,
    validate(createAvgReadingsSchema),
    createDriverAvgReadings
);

// GET /users/:userId/avg-health-readings  - full history, admin/FM only
router.get(
    "/:userId/avg-health-readings",
    authenticate,
    authorize("ADMIN", "FLEET_MANAGER"),
    validate(getDriverAvgReadingsSchema),
    getDriverAvgReadings
);

export default router;