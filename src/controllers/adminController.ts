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
  const response = await createUserService(req.body, req.t);
  res.status(response.statusCode).json(response);
};

export const updateUserController = async (req: Request, res: Response) => {
  const response = await updateUserService(Number(req.params.id), req.body, req.t);
  res.status(response.statusCode).json(response);
};

export const deleteUserController = async (req: Request, res: Response) => {
  const response = await deleteUserService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};
