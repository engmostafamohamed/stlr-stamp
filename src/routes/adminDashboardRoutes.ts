import express from "express";
import { register, login } from "../controllers/AuthController";
import { validateRegister } from "../middleware/validateRegister";
const router = express.Router();
router.post("/register", validateRegister ,register);
router.post("/login", login);

export default router;
