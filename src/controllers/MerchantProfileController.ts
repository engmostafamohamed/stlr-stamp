import { Request, Response } from 'express';
import {
  getMerchantProfilesService,
  getMerchantProfileService,
  createMerchantProfileService,
  updateMerchantProfileService,
  deleteMerchantProfileService,
} from '../services/MerchantProfileService';
import { PrismaClient } from "@prisma/client";
import { uploadFileToS3 } from "../utilts/s3Uploader"; // your utility for uploading

const prisma = new PrismaClient();

export const getMerchantProfilesController = async (req: Request, res: Response) => {
  const response = await getMerchantProfilesService(req.query, req.t);
  res.status(response.statusCode).json(response);
};

export const getMerchantProfileController = async (req: Request, res: Response) => {
  const response = await getMerchantProfileService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};

export const createMerchantProfileController = async (req: Request, res: Response)=> {
  try {
    const response = await createMerchantProfileService(req, req.t);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateMerchantProfileController = async (req: Request, res: Response) => {
  try {
    const response = await updateMerchantProfileService(req, req.t);
    res.status(response.statusCode).json(response);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


export const deleteMerchantProfileController = async (req: Request, res: Response) => {
  const response = await deleteMerchantProfileService(Number(req.params.id), req.t);
  res.status(response.statusCode).json(response);
};
