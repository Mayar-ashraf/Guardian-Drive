import express from "express";
import { authenticate, authorize } from "../middleware/AuthMiddleware";
import { Role } from "../../generated/prisma/client";
import { getAdminStats } from "../controllers/stats.controller";

const router = express.Router();

// the route is /api/admin/stats for now
router.get("/stats", authenticate, authorize(Role.ADMIN), getAdminStats);

export default router;