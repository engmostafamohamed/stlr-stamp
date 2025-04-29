import { Request, Response, NextFunction } from "express";
import { body, validationResult, ValidationError } from "express-validator";
import { AuthRequest } from "../interfaces/AuthRequest";
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const allowedRoles = [
  'customer',
  'employee',
  'merchant',
  'branch_manager'
];

// Admin registration validation
export const validateRegisterForAdmin = [
  body("user_name")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.userName_required")),

  body("email")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.email_required"))
    .bail()
    .isEmail()
    .withMessage((value, { req }) => req.t("validation.email_invalid")),

  body("phone")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.phone_required"))
    .bail()
    .matches(/^(010|011|012|015)\d{8}$/)
    .withMessage((value, { req }) => req.t("validation.phone_invalid")),

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

// Admin update validation
export const validateUpdateForAdmin = [
  body("user_name")
    .optional()
    .isString()
    .withMessage((value, { req }) => req.t("validation.userName_required")),


    body("email")
    .optional()
    .isEmail()
    .withMessage((value, { req }) => req.t("validation.email_invalid"))
    .bail(),
    // .custom(async (value, { req }) => {
    //   if (value) {
    //     const userId = req?.params?.id ?? undefined;
        
    //     // Check if email already exists for another user (excluding the current user's email)
    //     const existingUser = await prisma.user.findFirst({
    //       where: {
    //         email: value,
    //         // deletedAt: null,
    //         NOT: { user_id: userId },
    //       },
    //     });

    //     if (existingUser) {
    //       req.validationErrors = req.validationErrors || [];
    //       req.validationErrors.push({
    //         field: "email",
    //         message: req.t("validation.email_exists"),
    //       });
    //     }
    //   }
    //   return true;
    // }),

  body("phone")
    .optional()
    .matches(/^(010|011|012|015)\d{8}$/)
    .withMessage((value, { req }) => req.t("validation.phone_invalid"))
    .bail(),
    // .custom(async (value, { req }) => {
    //   if (value) {
    //     const userId = req?.params?.id ?? undefined;
    //     const existingUser = await prisma.user.findFirst({
    //       where: {
    //         phone: value,
    //         // deletedAt: null,
    //         NOT: { user_id: userId },
    //       },
    //     });

    //     if (existingUser) {
    //       req.validationErrors = req.validationErrors || [];
    //       req.validationErrors.push({
    //         field: "phoneNumber",
    //         message: req.t("validation.phone_exists"),
    //       });
    //     }
    //   }
    //   return true;
    // }),

  body("status")
    .optional()
    .isIn(["active", "pending", "suspended"])
    .withMessage((value, { req }) => req.t("validation.status_invalid")),

  body("verified")
    .optional()
    .isBoolean()
    .withMessage((value, { req }) => req.t("validation.verified_invalid")),

  body("roles")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.role_required"))
    .bail()
    .isIn(allowedRoles)
    .withMessage((value, { req }) => req.t("validation.role_invalid")),
];
