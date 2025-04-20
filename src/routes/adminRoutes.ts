import express from "express";
import { authenticate, isAdmin } from "../middleware/authMiddleware";
import { getUsersController, getUserController, updateUserController, createUserController, deleteUserController } from "../controllers/adminController";

const router = express.Router();

// Protect all admin routes with JWT

router.use(authenticate);
router.use(isAdmin);

router.get("/users", getUsersController);
router.get("/users/:id", getUserController);
router.put("/users/:id", updateUserController);
router.post("/users", createUserController);
router.delete("/users/:id", deleteUserController);

export default router;
