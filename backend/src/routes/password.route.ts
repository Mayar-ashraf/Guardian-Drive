import express from "express";
import { forgetPass, resetPass } from "../controllers/password.controller";

const router = express.Router();

router.post("/forget-password", forgetPass);
router.post("/reset-password", resetPass);

export default router;