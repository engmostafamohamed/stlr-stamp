import express from "express";
import authRoutes from "./authRoutes";
import adminRoutes from "./adminRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);

export default router;
