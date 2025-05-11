import { Request, Response } from 'express';
import {
  getTiersService,
  getTierService,
  createTierService,
  updateTierService,
  deleteTierService,
} from '../services/TierService';

export const getTiersController = async (req: Request, res: Response) => {
  const response = await getTiersService(req.query, req.t);
  res.status(response.statusCode).json(response);
};

export const getTierController = async (req: Request, res: Response) => {
  const response = await getTierService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};

export const createTierController = async (req: Request, res: Response) => {
  const t = req.t;
  const response = await createTierService(req.body, req.t);
  res.status(response.statusCode).json(response);
};

export const updateTierController = async (req: Request, res: Response) => {
  const response = await updateTierService(Number(req.params.id), req.body, req.t);
  res.status(response.statusCode).json(response);
};

export const deleteTierController = async (req: Request, res: Response) => {
  const response = await deleteTierService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};
