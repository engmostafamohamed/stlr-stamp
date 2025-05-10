import { Request } from 'express';
import { PrismaClient } from "@prisma/client";
import { uploadFileToS3 } from "../utilts/s3Uploader"; // your utility for uploading
import { successResponse, errorResponse } from '../utilts/responseHandler';
const prisma = new PrismaClient();
export const getMerchantProfilesService = async (query: any,  t: (key: string) => string) => {
  try {
    const { createdAt, page = 1, limit = 10 } = query;
    const filters: any = {
      deletedAt: null, 
    };

    // if (email) filters.email = { contains: email };
    // if (username) filters.username = { contains: username };
    // if (phone) filters.phone = { contains: phone };
    if (createdAt) filters.createdAt = { gte: new Date(createdAt) };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const users = await prisma.merchantProfile.findMany({
      where: filters,
      skip,
      take,
      include: { branches: true},
    });

    const totalUsers = await prisma.user.count({ where: filters });

    return successResponse(t("users_fetched_successfully"), {
      data: users,
      meta: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / Number(limit)),
        currentPage: Number(page),
        perPage: Number(limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};
export const getMerchantProfileService = async (id: number,  t: (key: string) => string) => {
  try {
    const merchantProfile = await prisma.merchantProfile.findUnique({
      where: { id: id,deletedAt: null },
      include: { branches: true, },
    });
    if (!merchantProfile) return errorResponse(t("merchant_Profile_deleted_or_not_found"), 404);
    const { updatedAt , deletedAt , ...data } = merchantProfile;
    return successResponse(t("data_obtained"), data);
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};
export const createMerchantProfileService = async (req: Request, t: (key: string) => string) => {
  const { user_id, branches } = req.body;
  const parsedBranches_id = branches ? JSON.parse(branches) : [];

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  try {
    
    const profile_imageUploadResults = files?.profile_image?.length
    ? await Promise.all(files.profile_image.map(file => uploadFileToS3(file, "merchant/profile_image")))
    : [];
  
    const documentsUploadResults = files?.documents?.length
      ? await Promise.all(files.documents.map(file => uploadFileToS3(file, "merchant/documents")))
      : [];

    const newProfile = await prisma.merchantProfile.create({
      data: {
        userId: parseInt(user_id),
        documents: documentsUploadResults,
        profile_image: profile_imageUploadResults,
        branches: {
          connect: parsedBranches_id.map((branchId: number) => ({ branch_id: branchId })),
        },
      }
    });
    return successResponse(t("profile_created"), null, 200);
    // return { statusCode: 201, success: true, profile: newProfile };
  } catch (error) {
    console.error("Error creating profile:", error);
    // return { statusCode: 500, success: false, message: "Server error" };
    return errorResponse(t("server_error"), 500);
  }
};

export const updateMerchantProfileService = async (req: Request, t: (key: string) => string) => {
  const profileId = Number(req.params.id);
  const { branches_id } = req.body;
  const parsedBranches_id = branches_id ? JSON.parse(branches_id) : [];

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  try {
    const isAnyDataProvided = parsedBranches_id.length > 0 || files?.profile_image?.length > 0 || files?.documents?.length > 0;

    if (!isAnyDataProvided) {
      return { statusCode: 400, success: false, message: "No data to update." };
    }

    const profileImageUrls = files?.profile_image?.length
      ? await Promise.all(files.profile_image.map(file => uploadFileToS3(file, "merchant/profile_image")))
      : undefined;

    const documentUrls = files?.documents?.length
      ? await Promise.all(files.documents.map(file => uploadFileToS3(file, "merchant/documents")))
      : undefined;

    const updateData: any = {};
    const existingProfile = await prisma.merchantProfile.findFirst({
      where: {
        id: profileId,
        deletedAt: null,
      },
    });

    if (!existingProfile) {
      return errorResponse(t("profile_not_found_or_deleted"), 404);
    }

    if (profileImageUrls) {
      updateData.profile_image = profileImageUrls;
    }
    if (documentUrls) {
      updateData.documents = documentUrls;
    }
    if (parsedBranches_id.length > 0) {
      updateData.branches = {
        set: parsedBranches_id,  // Remove old branches and add the new ones
      };
    }

    const updatedProfile = await prisma.merchantProfile.update({
      where: { id: profileId },
      data: updateData,
    });

    // return { statusCode: 200, success: true, profile: updatedProfile };
    return successResponse(t("profile_updated"), updatedProfile, 200);
  } catch (error) {
    // console.error("Error updating profile:", error);
    // return { statusCode: 500, success: false, message: "Server error" };
    // console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};


export const deleteMerchantProfileService = async (id: number, t: (key: string) => string) => {
  try {
    await prisma.merchantProfile.update({
      where: { id: id,deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return successResponse(t("merchant_profile_deleted"), null);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') return errorResponse(t("merchant_profile_not_found"), 404);
    return errorResponse(t("server_error"), 500);
  }
};
