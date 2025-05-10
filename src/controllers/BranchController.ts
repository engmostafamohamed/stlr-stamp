import { Request, Response } from 'express';
import {
  getBranchesService,
  getBranchService,
  createBranchService,
  updateBranchService,
  deleteBranchService,
} from '../services/BranchService';

export const getBranchesController = async (req: Request, res: Response) => {
  const response = await getBranchesService(req.query, req.t);
  res.status(response.statusCode).json(response);
};

export const getBranchController = async (req: Request, res: Response) => {
  const response = await getBranchService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};

export const createBranchController = async (req: Request, res: Response) => {
  // const { branch_name, branch_email,branch_phone, lat ,long,branch_manager_id,branch_owner_id,branch_employees_id } = req.body;
  const t = req.t;
  const response = await createBranchService(req.body, req.t);
  res.status(response.statusCode).json(response);
};

export const updateBranchController = async (req: Request, res: Response) => {
  const response = await updateBranchService(Number(req.params.id), req.body, req.t);
  res.status(response.statusCode).json(response);
};

export const deleteBranchController = async (req: Request, res: Response) => {
  const response = await deleteBranchService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};
