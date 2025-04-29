import { Request, Response, NextFunction, RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { AuthRequest } from '../interfaces/AuthRequest'
import { body} from "express-validator";


export const authenticate: RequestHandler = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  if (!token) {
    res.status(401).json({ message: req.t('auth.unauthorized') });
    return; // avoid returning res directly
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      issuer: 'stlr',
      audience: 'stlr-client'
    });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: req.t('auth.invalid_token') });
  }
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || !req.user.role || !req.user.role.includes("admin")) {
    res.status(403).json({ message: req.t("auth.admin_only") });
    return
  }
  next();
};

// Validation for Login
export const validateLogin = [
  body("email").isEmail().withMessage((value,{req})=>req.t("validation.Invalid_email")),
  body("password").notEmpty().withMessage((value,{req})=>req.t("validation.password_required")),
];

// Validation for Send OTP
export const validateSendOtp = [
  body("email").isEmail().withMessage((value,{req})=>req.t("validation.Invalid_email")),
];
// Validation for Verify OTP
export const validateVerifyOtp = [
  body("email").isEmail().withMessage((value,{req})=>req.t("validation.Invalid_email")),
  body("otp_code").isLength({ min: 4, max: 6 }).withMessage((value, { req })=> req.t("validation.OTP_must_be_digits")),
];
// Validation for Reset Password
export const validateResetPassword = [
  body("email").isEmail().withMessage((value,{req})=>req.t("validation.Invalid_email")),
  body("new_password")
  .notEmpty()
  .withMessage((value, { req }) => req.t("validation.password_required"))
  .isLength({ min: 6 })
  .withMessage((value, { req }) => req.t("validation.password_length")),

body("password_confirmation")
  .notEmpty()
  .withMessage((value, { req }) => req.t("validation.password_confirmation_required"))
  .custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error(req.t("validation.passwords_do_not_match"));
    }
    return true;
  }),
];

// Validation for /social-login route
export const validateSocialLogin = [
  body("provider")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.provider_required"))
    .bail()
    .isIn(["google", "apple"])
    .withMessage((value, { req }) => req.t("validation.provider_invalid")),

  body("idToken")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.idToken_required")),
];
