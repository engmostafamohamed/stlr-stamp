import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utilts/auth';
import { IApiResponse } from '../interfaces/ApiResponse';
import { successResponse, errorResponse } from '../utilts/responseHandler';
import { IUser } from '../interfaces/User'

const prisma = new PrismaClient();

export const getUsersService = async (query: any, t: any): Promise<IApiResponse<any>> => {
  try {
    const { email, username, phone, createdAt, page = 1, limit = 10 } = query;
    const filters: any = {
      deletedAt: null, 
    };

    if (email) filters.email = { contains: email };
    if (username) filters.username = { contains: username };
    if (phone) filters.phone = { contains: phone };
    if (createdAt) filters.createdAt = { gte: new Date(createdAt) };

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const users = await prisma.user.findMany({
      where: filters,
      skip,
      take,
      include: { roles: true, permissions: true },
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

export const getUserService = async (id: number, t: any): Promise<IApiResponse<any>> => {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: id,deletedAt: null },
      include: { roles: true, permissions: true },
    });
    if (!user) return errorResponse(t("user_not_found"), 404);
    const { password , deletedAt , ...data } = user;
    return successResponse(t("data_obtained"), data);
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};

export const createUserService = async (
  email: string,
  password: string,
  userName: string,
  phone: string,
  role:string,
  t: (key: string) => string
): Promise<IApiResponse<{ userData: IUser, role: string } | null>> => {
  try {
    const lowerEmail = email.toLowerCase();
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where:{email:lowerEmail} });
    if (existingUser) {
      return errorResponse("Email already exists", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // find role
    const roleData= await prisma.role.findUnique({
      where: {
        name: role
      }
    })
    if (!roleData) {
      return errorResponse("Default role not found", 500);
    }
    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username: userName ,
        email,
        password: hashedPassword,
        phone,
        roles: {
          connect: { id: roleData.id }, 
        },
      },
    });

    return successResponse(t("user_created"), null, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};

export const updateUserService = async (
  id: number,
  data: any,
  t: any
): Promise<IApiResponse<any>> => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { user_id: id },
    });

    if (!existingUser || existingUser.deletedAt !== null) {
      return errorResponse(t("user_not_found"), 404);
    }

    const updateData: any = {};

    // Handle email update
    if (data.email) {
      const normalizedEmail = data.email.toLowerCase();

      const existingEmail = await prisma.user.findFirst({
        where: {
          user_id: { not: id },
          email: normalizedEmail,
        },
      });

      if (existingEmail) {
        return errorResponse(t("validation.email_or_phone_taken"), 400);
      }

      updateData.email = normalizedEmail;
    }

    // Handle phone update
    if (data.phone) {
      const existingPhone = await prisma.user.findFirst({
        where: {
          user_id: { not: id },
          phone: data.phone,
        },
      });

      if (existingPhone) {
        return errorResponse(t("validation.email_or_phone_taken"), 400);
      }

      updateData.phone = data.phone;
    }

    // Update verified if provided
    if (typeof data.verified !== "undefined") {
      updateData.verified = data.verified;
    }

    // Update status if provided
    if (typeof data.status !== "undefined") {
      updateData.status = data.status;
    }

    // Update roles if provided
    if (data.roles) {
      const roleData = await prisma.role.findUnique({
        where: { name: data.roles },
      });

      if (!roleData) {
        return errorResponse(t("role_not_found"), 400);
      }

      updateData.roles = {
        set: [{ id: roleData.id }],
      };
    }

    // Only update if there’s something to change
    if (Object.keys(updateData).length === 0) {
      return errorResponse(t("no_fields_to_update"), 400);
    }

    await prisma.user.update({
      where: { user_id: id },
      data: updateData,
      include: {
        roles: true,
      },
    });

    return successResponse(t("user_updated"), null, 201);
  } catch (error: any) {
    console.error(error);
    if (error.code === "P2025") {
      return errorResponse(t("user_not_found"), 404);
    }
    return errorResponse(t("server_error"), 500);
  }
};


export const deleteUserService = async (id: number, t: any): Promise<IApiResponse<null>> => {
  try {
    await prisma.user.update({
      where: { user_id: id,deletedAt: null },
      data: { deletedAt: new Date() },
    });
    return successResponse(t("user_deleted"), null);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') return errorResponse(t("user_not_found"), 404);
    return errorResponse(t("server_error"), 500);
  }
};
