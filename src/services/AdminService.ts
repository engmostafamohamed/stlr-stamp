import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utilts/auth';
import { IApiResponse } from '../interfaces/ApiResponse';
import { successResponse, errorResponse } from '../utilts/responseHandler';

const prisma = new PrismaClient();

export const getUsersService = async (query: any, t: any): Promise<IApiResponse<any>> => {
  try {
    const { email, username, phone, createdAt, page = 1, limit = 10 } = query;
    const filters: any = {};

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
      where: { user_id: id },
      include: { roles: true, permissions: true },
    });

    if (!user) return errorResponse(t("user_not_found"), 404);
    return successResponse(t("user_fetched_successfully"), user);
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};

export const createUserService = async (data: any, t: any): Promise<IApiResponse<any>> => {
  try {
    const { email, username, phone, password } = data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return errorResponse(t("email_exists"), 409);

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        phone,
        password: hashedPassword,
      },
    });

    return successResponse(t("user_created"), user, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(t("server_error"), 500);
  }
};

export const updateUserService = async (id: number, data: any, t: any): Promise<IApiResponse<any>> => {
  try {
    const updateData: any = { ...data };

    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { user_id: id },
      data: updateData,
    });

    return successResponse(t("user_updated"), user);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') return errorResponse(t("user_not_found"), 404);
    return errorResponse(t("server_error"), 500);
  }
};

export const deleteUserService = async (id: number, t: any): Promise<IApiResponse<null>> => {
  try {
    await prisma.user.update({
      where: { user_id: id },
      data: { deletedAt: new Date() },
    });
    return successResponse(t("user_deleted"), null);
  } catch (error: any) {
    console.error(error);
    if (error.code === 'P2025') return errorResponse(t("user_not_found"), 404);
    return errorResponse(t("server_error"), 500);
  }
};
