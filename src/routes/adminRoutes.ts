import express from "express";
import { authenticate, isAdmin } from "../middleware/authMiddleware";
import { getUsersController, getUserController, updateUserController, createUserController, deleteUserController } from "../controllers/adminController";
import { handleValidationErrors} from "../middleware/handleValidationErrors";
import { validateRegisterForAdmin,validateUpdateForAdmin } from "../middleware/adminDashboardValidation";
const router = express.Router();

// Protect all admin routes with JWT

router.use(authenticate);
router.use(isAdmin);

router.get("/users", getUsersController);
router.get("/user/:id", getUserController);
router.put("/update-user/:id", updateUserController,validateUpdateForAdmin, handleValidationErrors);
router.post("/user/create", createUserController,validateRegisterForAdmin, handleValidationErrors);
router.delete("/delete-user/:id", deleteUserController);

export default router;
