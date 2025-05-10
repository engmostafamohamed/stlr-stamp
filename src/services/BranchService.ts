import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utilts/auth';
import { IApiResponse } from '../interfaces/ApiResponse';
import { successResponse, errorResponse } from '../utilts/responseHandler';
import { IUser } from '../interfaces/User'

const prisma = new PrismaClient();

export const getBranchesService = async (query: any, t: any): Promise<IApiResponse<any>> => {
  try {
    const { branch_email, branch_name, branch_phone, createdAt , page = 1, limit = 10 } = query;
    const filters: any = {
      deletedAt: null, 
    };

    if (branch_email) filters.branch_email = { contains: branch_email };
    if (branch_name) filters.branch_name = { contains: branch_name };
    if (branch_phone) filters.branch_phone = { contains: branch_phone };
    if (createdAt) filters.createdAt = { gte: new Date(createdAt) };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const branchs = await prisma.branch.findMany({
      where: filters,
      skip,
      take,
      include: { employees: true },
    });

    const totalBranchs = await prisma.branch.count({ where: filters });

    return successResponse(t("users_fetched_successfully"), {
      branchs,
      meta: {
        totalBranchs,
        totalPages: Math.ceil(totalBranchs / Number(limit)),
        currentPage: Number(page),
        perPage: Number(limit),
      },
    });
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};

export const getBranchService = async (id: number, t: any): Promise<IApiResponse<any>> => {
  try {
    const branch  = await prisma.branch.findUnique({
      where: { branch_id: id,deletedAt: null },
      include: { employees: true },
    });
 if (!branch) return errorResponse(t("branchValidation.branch_not_exist"), 404);
    // const { password , deletedAt , ...data } = user;
    return successResponse(t("data_obtained"), branch );
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};

export const createBranchService = async (query: any ,t: (key: string) => string): Promise<IApiResponse<{ userData: IUser, role: string } | null>> => {
  try {
    const lowerEmail = query.branch_email.toLowerCase();

    // Check if the email already exists
    const existingBranch = await prisma.branch.findUnique({
      where: { branch_email: lowerEmail }
    });
    if (existingBranch) {
      return errorResponse("Email already exists", 400);
    }

    // Safely parse branch_employees_id
    let parsedEmployeeIds: number[] = [];

    if (typeof query.branch_employees_id === "string") {
      try {
        const parsed = JSON.parse(query.branch_employees_id);
        if (Array.isArray(parsed)) {
          parsedEmployeeIds = parsed.map(id => Number(id)).filter(id => !isNaN(id));
        }
      } catch {
        parsedEmployeeIds = [];
      }
    } else if (Array.isArray(query.branch_employees_id)) {
      parsedEmployeeIds = query.branch_employees_id.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
    }

    // Make sure it's always an array before using .map
    if (!Array.isArray(parsedEmployeeIds)) {
      parsedEmployeeIds = [];
    }

    // Combine manager and employees
    const allEmployeeIds = [
      Number(query.branch_manager_id),
      ...parsedEmployeeIds
    ];
    const employeeConnectData = allEmployeeIds.length > 0
      ? { connect: allEmployeeIds.map(id => ({ user_id: id })) }
      : undefined;

    // Create the branch
    const newBranch = await prisma.branch.create({
      data: {
        branch_name:query.branch_name,
        branch_email: lowerEmail,
        branch_phone:query.branch_phone,
        lng:query.lng,
        lat:query.lat,
        profileId: Number(query.branch_owner_id),
        ...(employeeConnectData && { employees: employeeConnectData }),
      },
    });
    
    return successResponse(t("branch_created"), null, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};


export const updateBranchService = async (
  id: number,
  data: any,
  t: (key: string) => string
): Promise<IApiResponse<any>> => {
  try {
    const normalizedEmail = data.branch_email?.toLowerCase();

    const existingBranch = await prisma.branch.findUnique({
      where: {
        branch_id: id,
      },
    });

    if (!existingBranch) {
      return errorResponse(t("branchValidation.branch_not_exist"), 404);
    }

    // Check if email or phone already exists for another branch
    const existingEmailOrPhone = await prisma.branch.findFirst({
      where: {
        branch_id: { not: id },
        OR: [
          { branch_email: normalizedEmail },
          { branch_phone: data.branch_phone }
        ],
      },
    });

    if (existingEmailOrPhone) {
      return errorResponse(t("branchValidation.email_or_phone_taken"), 400);
    }

    // Safely parse branch_employees_id
    let parsedEmployeeIds: number[] = [];

    if (typeof data.branch_employees_id === "string") {
      try {
        const parsed = JSON.parse(data.branch_employees_id);
        if (Array.isArray(parsed)) {
          parsedEmployeeIds = parsed.map(id => Number(id)).filter(id => !isNaN(id));
        }
      } catch {
        parsedEmployeeIds = [];
      }
    } else if (Array.isArray(data.branch_employees_id)) {
      parsedEmployeeIds = data.branch_employees_id.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
    }

    const allEmployeeIds = [
      Number(data.branch_manager_id),
      ...parsedEmployeeIds
    ];
    const employeeConnectData = allEmployeeIds.length > 0
      ? { connect: allEmployeeIds.map(id => ({ user_id: id })) }
      : undefined;

    // Prepare update data
    const updateData: any = {
      branch_name: data.branch_name,
      branch_email: normalizedEmail,
      branch_phone: data.branch_phone,
      lng: data.lng,
      lat: data.lat,
      profileId: Number(data.branch_owner_id),
      ...(employeeConnectData && { employees: employeeConnectData }),
    };

    // Update branch
    await prisma.branch.update({
      where: { branch_id: id },
      data: updateData
    });

    return successResponse(t("branch_updated"), null, 201);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') {
      return errorResponse(t("branch_not_found"), 404);
    }
    return errorResponse(t("server_error"), 500);
  }
};


export const deleteBranchService = async (id: number, t: any): Promise<IApiResponse<null>> => {
  try {
    const existingBranch = await prisma.branch.findUnique({
      where: {
        branch_id: id,
      },
    });

    if (!existingBranch) {
      return errorResponse(t("branchValidation.branch_not_exist"), 404);
    }
    
    await prisma.branch.update({
      where: { branch_id: id,deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return successResponse(t("branch_deleted"), null);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') return errorResponse(t("branch_not_found"), 404);
    return errorResponse(t("server_error"), 500);
  }
};
