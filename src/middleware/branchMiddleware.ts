import { Request, Response, NextFunction } from "express";
import { body, CustomValidator, ValidationChain,validationResult, ValidationError } from "express-validator";
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
export const validateCreatBranch = [
  body("branch_name")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.branch_name_required")),

  body("branch_email")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.email_required"))
    .bail()
    .isEmail()
    .withMessage((value, { req }) => req.t("validation.email_invalid"))
    .custom(async (value, { req }) => {
        if (value) {
          const branch = await prisma.branch.findUnique({ where: { branch_email: (value) } });
          if (branch) return Promise.reject("createMerchantProfileValidation.branch_Email_exist");
        }
        return true;
    }),

  body("branch_phone")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.phone_required"))
    .bail()
    .matches(/^(010|011|012|015)\d{8}$/)
    .withMessage((value, { req }) => req.t("validation.phone_invalid")),

  body("branch_owner_id")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.branch_owner_required"))
    .bail()  
    .custom(async (value, { req }) => {
        if (value) {
          const merchantProfile_id = await prisma.merchantProfile.findFirst({ where: { id: Number(value) } });
          if (!merchantProfile_id) return Promise.reject("createBranch.branch_owner_not_found");
        }
        return true;
    }),
    
  body("branch_manager_id")
    .notEmpty()
    .withMessage((value, { req }) => req.t("validation.branch_manager_required"))
    .bail() 
    .custom(async (value, { req }) => {
        if (value) {
          const merchantProfile_id = await prisma.user.findFirst({ where: { user_id: Number(value) } });
          if (!merchantProfile_id) return Promise.reject("createBranch.branch_manager_not_found");
        }
        return true;
    }),
  body("branch_employees_id")
    .optional({ nullable: true }) // Allows undefined or null
    .isArray()
    .withMessage((value, { req }) => req.t("validation.must_be_array"))
    .bail()
    .custom(async (value: number[], { req }) => {
      if (!value || value.length === 0) return true; // Allow empty array
  
      const users = await prisma.user.findMany({
        where: { user_id: { in: value } },
        select: { user_id: true },
      });
  
      const foundIds = users.map(u => u.user_id);
      const missingIds = value.filter(id => !foundIds.includes(id));
  
      if (missingIds.length > 0) {
        return Promise.reject(req.t("createBranch.employee_not_found"));
      }
      return true;
    }),
];

export const validateUpdateBranch = [
  body("branch_name")
    .optional({ nullable: true }),

  body("branch_email")
    .optional({ nullable: true })
    .bail()
    .isEmail()
    .withMessage((value, { req }) => req.t("validation.email_invalid"))
    .custom(async (value, { req }) => {
        if (value) {
          const branch = await prisma.branch.findUnique({ where: { branch_email: (value) } });
          if (branch) return Promise.reject("createMerchantProfileValidation.branch_Email_exist");
        }
        return true;
    }),

  body("branch_phone")
    .optional({ nullable: true })
    .bail()
    .matches(/^(010|011|012|015)\d{8}$/)
    .withMessage((value, { req }) => req.t("validation.phone_invalid")),

  body("branch_owner_id")
    .optional({ nullable: true })
    .bail()  
    .custom(async (value, { req }) => {
        if (value) {
          const merchantProfile_id = await prisma.merchantProfile.findFirst({ where: { id: Number(value) } });
          if (!merchantProfile_id) return Promise.reject("createBranch.branch_owner_not_found");
        }
        return true;
    }),
    
  body("branch_manager_id")
    .optional({ nullable: true })
    .bail() 
    .custom(async (value, { req }) => {
        if (value) {
          const merchantProfile_id = await prisma.user.findFirst({ where: { user_id: Number(value) } });
          if (!merchantProfile_id) return Promise.reject("createBranch.branch_manager_not_found");
        }
        return true;
    }),
  body("branch_employees_id")
    .optional({ nullable: true }) // Allows undefined or null
    .isArray()
    .withMessage((value, { req }) => req.t("validation.must_be_array"))
    .bail()
    .custom(async (value: number[], { req }) => {
      if (!value || value.length === 0) return true; // Allow empty array
  
      const users = await prisma.user.findMany({
        where: { user_id: { in: value } },
        select: { user_id: true },
      });
  
      const foundIds = users.map(u => u.user_id);
      const missingIds = value.filter(id => !foundIds.includes(id));
  
      if (missingIds.length > 0) {
        return Promise.reject(req.t("createBranch.employee_not_found"));
      }
      return true;
    }),
];