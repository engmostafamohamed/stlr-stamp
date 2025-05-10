import { Request, Response, NextFunction } from "express";
import { body, CustomValidator, ValidationChain,validationResult, ValidationError } from "express-validator";
import { AuthRequest } from "../interfaces/AuthRequest";
import { PrismaClient, Prisma } from '@prisma/client';
import path from "path";
import multer from "multer";

const prisma = new PrismaClient();
const allowedRoles = [
  'customer',
  'employee',
  'merchant',
  'branch_manager'
];
const allowedImageExtensions = [".jpg", ".jpeg", ".png"];
const allowedDocExtension = [".pdf",".jpg", ".jpeg", ".png"];

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


export const validateCreateMerchantProfile = [
  body("user_id")
    .notEmpty().withMessage("createMerchantProfileValidation.user_id_required")
    .bail()
    .isInt().withMessage("createMerchantProfileValidation.user_id_invalid")
    .bail()
    .custom(async (value, { req }) => {
      const user = await prisma.user.findUnique({ where: { user_id: parseInt(value) } });
      if (!user) return Promise.reject("createMerchantProfileValidation.user_not_found");

      const existingProfile = await prisma.merchantProfile.findFirst({ where: { userId: parseInt(value) } });
      if (existingProfile) return Promise.reject("createMerchantProfileValidation.user_already_has_profile");
      return true;
    }),

  body("branches_id")
    .optional()
    .isInt().withMessage("createMerchantProfileValidation.branch_id_invalid")
    .bail()
    .custom(async (value, { req }) => {
      if (value) {
        const branch = await prisma.branch.findUnique({ where: { branch_id: parseInt(value) } });
        if (!branch) return Promise.reject("createMerchantProfileValidation.branch_not_found");
      }
      return true;
    }),

  // body("document_type")
  //   .notEmpty().withMessage("createMerchantProfileValidation.document_type_required")
  //   .bail()
  //   .isString().withMessage("createMerchantProfileValidation.document_type_invalid")  // Ensuring it's a string
  //   .bail()
  //   .custom((value) => {
  //     const allowedDocumentTypes = ["pdf", "passport", "id_card", "driver_license"]; // Example allowed types

  //     // Check if value is in the allowed types
  //     if (!allowedDocumentTypes.includes(value)) {
  //       return Promise.reject("createMerchantProfileValidation.document_type_invalid");
  //     }

  //     return true;
  //   }),


];

export const validateUpdateMerchantProfile = [
  body("branches_id")
    .optional()
    .isInt().withMessage("createMerchantProfileValidation.branch_id_invalid")
    .bail()
    .custom(async (value, { req }) => {
      if (value) {
        const branch = await prisma.branch.findUnique({ where: { branch_id: parseInt(value) } });
        if (!branch) return Promise.reject("createMerchantProfileValidation.branch_not_found");
      }
      return true;
    }),

  // body("document_type")
  //   .notEmpty().withMessage("createMerchantProfileValidation.document_type_required")
  //   .bail()
  //   .isString().withMessage("createMerchantProfileValidation.document_type_invalid")  // Ensuring it's a string
  //   .bail()
  //   .custom((value) => {
  //     const allowedDocumentTypes = ["pdf", "passport", "id_card", "driver_license"]; // Example allowed types

  //     // Check if value is in the allowed types
  //     if (!allowedDocumentTypes.includes(value)) {
  //       return Promise.reject("createMerchantProfileValidation.document_type_invalid");
  //     }

  //     return true;
  //   }),
];

export const validateUploadedFiles = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] } || {};

  const profile_image = files["profile_image"] || [];
  const documents = files["documents"] || [];

  req.validationErrors = [];

  if (profile_image.length > 0) {
    for (const file of profile_image) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedImageExtensions.includes(ext)) {
        req.validationErrors.push({
          field: "profile_image",
          message: "createMerchantProfileValidation.invalid_image_extension",
        });
        break;
      }
    }
  }
  if (documents.length > 0) {
    for (const file of documents) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!allowedDocExtension.includes(ext) ) {
        req.validationErrors.push({
          field: "documents",
          message: "createMerchantProfileValidation.invalid_document_extension",
        });
        break;
      }
    }
  }
  // if (documents.length === 0) {
  //   req.validationErrors.push({
  //     field: "documents",
  //     message: "createMerchantProfileValidation.documents_required",
  //   });
  // } else {
  //   for (const file of documents) {
  //     const ext = path.extname(file.originalname).toLowerCase();
  //     if (ext !== allowedDocExtension) {
  //       req.validationErrors.push({
  //         field: "documents",
  //         message: "createMerchantProfileValidation.invalid_document_extension",
  //       });
  //       break;
  //     }
  //   }
  // }

  if (req.validationErrors.length > 0) {
    res.status(400).json({ errors: req.validationErrors });
    return;
  }

  next();
};

const upload = multer({ storage: multer.memoryStorage() });
export const uploadMerchantProfileFiles = upload.fields([
  { name: "profile_image", maxCount: 1 },
  { name: "documents", maxCount: 4 },
]);
