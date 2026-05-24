"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controller_1 = require("../controllers/users.controller");
const AuthMiddleware_1 = require("../middleware/AuthMiddleware");
const enums_1 = require("../../generated/prisma/enums");
const validate_1 = require("../validators/validate");
const getAllUsers_schema_1 = require("../schema/user/getAllUsers.schema");
const getUserbyID_schema_1 = require("../schema/user/getUserbyID.schema");
const deleteUserbyID_schema_1 = require("../schema/user/deleteUserbyID.schema");
const editUserbyID_schema_1 = require("../schema/user/editUserbyID.schema");
const users_1 = require("../schema/users");
const users_controller_2 = require("../controllers/users.controller");
const router = express_1.default.Router();
router.post("/", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.ADMIN), (0, validate_1.validate)(users_1.SignupSchema), users_controller_2.createUser);
//router.post("/", authenticate, validate(SignupSchema), createUser)
router.get("/", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.ADMIN, enums_1.Role.FLEET_MANAGER), (0, validate_1.validate)(getAllUsers_schema_1.getAllUsersSchema), users_controller_1.getAllUsers);
router.get("/:id", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.ADMIN, enums_1.Role.FLEET_MANAGER, enums_1.Role.DRIVER), (0, validate_1.validate)(getUserbyID_schema_1.getUserbyIDschema), users_controller_1.getuserbyID);
//router.get("/:id", validate(getUserbyIDschema), getuserbyID);
router.put("/:id", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.ADMIN, enums_1.Role.FLEET_MANAGER), (0, validate_1.validate)(editUserbyID_schema_1.edituserbyIDschema), users_controller_1.edituserbyID);
router.delete("/:id", AuthMiddleware_1.authenticate, (0, AuthMiddleware_1.authorize)(enums_1.Role.ADMIN), (0, validate_1.validate)(deleteUserbyID_schema_1.deleteUserbyIDschema), users_controller_1.deleteuserbyID);
exports.default = router;
