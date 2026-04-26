import express from "express";
import { get } from "node:http";
import { getAllusers } from "../controllers/users.controller";

const router = express.Router();

router.get("/getAllusers", getAllusers);

export default router;