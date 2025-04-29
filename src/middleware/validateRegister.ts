import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationError } from "express-validator";
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

  body("phoneNumber")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.phone_required"))
    .bail()
    .isEmail()
    .withMessage((value, { req }) => req.t("validation.phone_required")),

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
    .withMessage((value, { req }) => req.t("validation.role_invalid")), // Custom error for invalid role
];



