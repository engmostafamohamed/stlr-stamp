import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utilts/auth';
import { IApiResponse } from '../interfaces/ApiResponse';
import { successResponse, errorResponse } from '../utilts/responseHandler';
import { IUser } from '../interfaces/User'

const prisma = new PrismaClient();

export const getTiersService = async (query: any, t: any): Promise<IApiResponse<any>> => {
  try {
    const { required_stamps, required_amount, tier_name, createdAt , page = 1, limit = 10 } = query;
    const filters: any = {
      deletedAt: null, 
    };

    if (required_stamps) filters.required_stamps = { contains: required_stamps };
    if (tier_name) filters.tier_name = { contains: tier_name };
    if (required_amount) filters.required_amount = { contains: required_amount };
    if (createdAt) filters.createdAt = { gte: new Date(createdAt) };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const Tiers = await prisma.tier.findMany({
      where: filters,
      skip,
      take,
      include: { stamps: true },
    });

    const totalTiers = await prisma.tier.count({ where: filters });

    return successResponse(t("users_fetched_successfully"), {
      Tiers,
      meta: {
        totalTiers,
        totalPages: Math.ceil(totalTiers / Number(limit)),
        currentPage: Number(page),
        perPage: Number(limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};

export const getTierService = async (id: number, t: any): Promise<IApiResponse<any>> => {
  try {
    const Tier  = await prisma.tier.findUnique({
      where: { id: id,deletedAt: null },
      include: { stamps: true },
    });
 if (!Tier) return errorResponse(t("TierValidation.Tier_not_exist"), 404);
    return successResponse(t("data_obtained"), Tier );
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};

export const createTierService = async (query: any ,t: (key: string) => string): Promise<IApiResponse<{ userData: IUser, role: string } | null>> => {
  try {
    // Create the Tier
    const tierData=await prisma.tier.create({
      data: {
        name: query.tier_name,
        merchant_id: Number(query.branch_owner_id),
        required_stamps: Number(query.required_stamps),
        required_amount: Number(query.required_amount),
        points_required: Number(query.points_required)
      },
    });
    
    await prisma.userTier.create({
      data: {
        user_id: Number(query.branch_manager_id),
        tier_id: tierData.id
      }
    })
    return successResponse(t("Tier_created"), null, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};


export const updateTierService = async (
  id: number,
  query: any,
  t: (key: string) => string
): Promise<IApiResponse<any>> => {
  try {
    const existingTier = await prisma.tier.findUnique({
      where: { id },
    });

    if (!existingTier) {
      return errorResponse(t("TierValidation.Tier_not_exist"), 404);
    }

    const updateData: any = {};

    // Handle tier_name
    if (query.tier_name) {
      updateData.name = query.tier_name;
    }

    // Handle branch_manager_id
    if (query.branch_manager_id) {
      const managerUser = await prisma.user.findFirst({
        where: {
          user_id: Number(query.branch_manager_id),
          roles: {
            some: { name: "branch_manager" },
          },
        },
      });

      if (!managerUser) {
        return errorResponse(t("branchValidation.branch_manager_not_found"), 404);
      }

      updateData.user_id = Number(query.branch_manager_id);
    }

    // Handle branch_owner_id
    if (query.branch_owner_id) {
      const merchant = await prisma.merchantProfile.findFirst({
        where: { id: Number(query.branch_owner_id) },
      });

      if (!merchant) {
        return errorResponse(t("branchValidation.branch_owner_id_not_found"), 404);
      }

      updateData.merchant_id = Number(query.branch_owner_id);
    }

    // Optional numeric fields
    if (query.required_stamps) {
      updateData.required_stamps = Number(query.required_stamps);
    }

    if (query.required_amount) {
      updateData.required_amount = Number(query.required_amount);
    }

    if (query.points_required) {
      updateData.points_required = Number(query.points_required);
    }

    // Validate if anything is changing
    if (Object.keys(updateData).length === 0) {
      return errorResponse(t("no_fields_to_update"), 400);
    }

    // Update tier
    await prisma.tier.update({
      where: { id },
      data: updateData,
    });

    // Update userTier only if user_id is being changed
    if (updateData.user_id) {
      await prisma.userTier.updateMany({
        where: { tier_id: id },
        data: { user_id: updateData.user_id },
      });
    }
    return successResponse(t("Tier_updated"), null, 201);
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025") {
      return errorResponse(t("Tier_not_found"), 404);
    }
    return errorResponse(t("server_error"), 500);
  }
};


export const deleteTierService = async (id: number, t: any): Promise<IApiResponse<null>> => {
  try {
    const existingTier = await prisma.tier.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingTier) {
      return errorResponse(t("TierValidation.Tier_not_exist"), 404);
    }
    
    await prisma.tier.update({
      where: { id: id,deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return successResponse(t("Tier_deleted"), null);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') return errorResponse(t("Tier_not_found"), 404);
    return errorResponse(t("server_error"), 500);
  }
};
