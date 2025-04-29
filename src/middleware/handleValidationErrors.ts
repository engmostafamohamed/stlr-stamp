import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { AuthRequest } from "../interfaces/AuthRequest";
export const handleValidationErrors = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: (err as any).path || (err as any).param || "unknown", 
      message: req.t(err.msg) || err.msg,
    }));

    res.status(400).json({
      success: false,
      statusCode: 400,
      errors: errorMessages,
    });

    return; 
  }

  next();
};