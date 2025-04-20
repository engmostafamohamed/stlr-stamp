import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AuthRequest } from "../interfaces/AuthRequest";

const allowedRoles = ["customer"];

export const validateRegister = [
  body("user_name")
    .notEmpty()
    .bail()
    .withMessage((value, { req }) => req.t("validation.userName_required")),

  body("email")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.email_required"))
    .bail()
    .isEmail()
    .withMessage((value, { req }) => req.t("validation.email_invalid")),

  body("password")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.password_required"))
    .bail()
    .isLength({ min: 6 })
    .withMessage((value, { req }) => req.t("validation.password_length")),

  body("role")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.role_required"))
    .bail()
    .isIn(allowedRoles)
    .withMessage((value, { req }) => req.t("validation.role_invalid")),
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

export const handleValidationErrors = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: (err as any).path || (err as any).param || "unknown",
      message: req.t(err.msg) || err.msg,
    }));

    res.status(400).json({
      success: false,
      statusCode: 400,
      errors: errorMessages,
    });

    return;
  }

  next();
};
