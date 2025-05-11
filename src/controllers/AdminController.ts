import { Request, Response } from 'express';
import {
  getUsersService,
  getUserService,
  createUserService,
  updateUserService,
  deleteUserService,
} from '../services/AdminService';

export const getUsersController = async (req: Request, res: Response) => {
  const response = await getUsersService(req.query, req.t);
  res.status(response.statusCode).json(response);
};

export const getUserController = async (req: Request, res: Response) => {
  const response = await getUserService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};

export const createUserController = async (req: Request, res: Response) => {
  const { email, password,phone, user_name ,role } = req.body;
  const t = req.t;
  const response = await createUserService(email, password, user_name, phone ,role, req.t);
  res.status(response.statusCode).json(response);
};

export const updateUserController = async (req: Request, res: Response) => {
  // const { email, password, phoneNumber, user_name , role, status , verified } = req.body;
  const response = await updateUserService(Number(req.params.id), req.body, req.t);
  res.status(response.statusCode).json(response);
};

export const deleteUserController = async (req: Request, res: Response) => {
  const response = await deleteUserService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};
