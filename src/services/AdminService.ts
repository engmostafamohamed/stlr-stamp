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
        name: 'customer'
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

export const updateUserService = async (id: number, data: any, t: any): Promise<IApiResponse<any>> => {
  try {
    const normalizedEmail = data.email.toLowerCase();

    // Check if the user exists and is not soft-deleted
    const existingUser = await prisma.user.findUnique({
      where: { user_id: id },
    });
    
    if (!existingUser || existingUser.deletedAt !== null) {
      return errorResponse(t("user_not_found"), 404);
    }
    
    // Check if email or phone is already used by another user
    const existingEmailOrPhone = await prisma.user.findFirst({
      where: {
        // deletedAt: null,
        user_id: { not: id }, // exclude current user during update
        OR: [
          { email: normalizedEmail },
          { phone: data.phone }
        ],
      },
    });
    
    if (existingEmailOrPhone) {
      return errorResponse(t("validation.email_or_phone_taken"), 400);
    }


    const updateData: any = { ...data };

    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    if (updateData.roles) {
      // Find the role by name first
      const roleData = await prisma.role.findUnique({
        where: { name: updateData.roles },
      });

      if (!roleData) {
        return errorResponse(t("role_not_found"), 400);
      }

      // Now connect using ID
      updateData.roles = {
        set: [{ id: roleData.id }],
      };
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
    if (error.code === 'P2025') return errorResponse(t("user_not_found"), 404);
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
