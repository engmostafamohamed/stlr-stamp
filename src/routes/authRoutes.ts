import express from "express";
import { validateRegister , handleValidationErrors} from "../middleware/validateRegister";
import { validateSendOtp, validateVerifyOtp,validateResetPassword ,validateSocialLogin} from "../middleware/authMiddleware";
import { register, login,sendOtpController,verifyOtpController,resetPasswordController,requestResetPasswordController ,socialLoginController} from "../controllers/AuthController";
const router = express.Router();
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: This API registers a new user in the system.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *       400:
 *         description: Validation error
 */
router.post("/register", validateRegister, handleValidationErrors, register);
router.post("/login", login);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     summary: Send OTP for verification
 *     description: Sends a one-time password (OTP) to the user's email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post("/send-otp", validateSendOtp, handleValidationErrors, sendOtpController);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verifies the OTP provided by the user.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
router.post("/verify-otp", validateVerifyOtp, handleValidationErrors, verifyOtpController);

/**
 * @swagger
 * /auth/request-reset-password:
 *   post:
 *     summary: Request Reset Password
 *     description: Request for Reset Password using email. 
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post("/request-reset-password", validateSendOtp, handleValidationErrors, requestResetPasswordController);

/**
 * @swagger
 * /auth/verify-reset-Otp:
 *   post:
 *     summary: Verify Reset OTP
 *     description: Verify Reset OTP for reest password.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 */
// router.post("/verify-reset-Otp", validateVerifyOtp, handleValidationErrors, verifyResetOtpController);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Allows users to reset their password after OTP verification.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               newPassword:
 *                 type: string
 *                 example: "NewPassword123!"
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post("/reset-password", validateResetPassword, handleValidationErrors, resetPasswordController);
router.post("/social-login",validateSocialLogin,handleValidationErrors,socialLoginController);


export default router;
