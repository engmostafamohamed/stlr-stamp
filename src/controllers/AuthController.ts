import { Request, Response, NextFunction } from 'express'
import { successResponse, errorResponse } from '../utilts/responseHandler';
import AppError from '../utilts/AppError'
import { IUser } from '../interfaces/User'
import { IAuthResponse } from '../interfaces/AuthResponse'
import { AuthRequest } from '../interfaces/AuthRequest'
import { IApiResponse } from '../interfaces/ApiResponse'
import { registerUser, loginUser,sendOtp, verifyOtp, requestResetPassword  ,resetPassword,socialLoginService } from '../services/UserService';

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, user_name ,phoneNumber } = req.body;
  const t = req.t;

  if (!email || !password || !user_name || !phoneNumber) {
    res.status(400).json(errorResponse(t("missing_fields"), 400));
    return;
  }
  const response = await registerUser(email, password,user_name,phoneNumber,t);
  if (!response.success) {
    res.status(response.statusCode).json(errorResponse(t(response.message), response.statusCode));
    return;
  }
  res.status(response.statusCode).json(successResponse(t(response.message), response.data, response.statusCode));
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const response: IApiResponse<any> = await loginUser(req.body.email, req.body.password,req.t);
  res.status(response.statusCode).json(response);
};
// Send OTP
export const sendOtpController = async (req: Request, res: Response) => {
  const response: IApiResponse<null> = await sendOtp(req.body.email,req.t);
  res.status(response.statusCode).json(response);
};

// Verify OTP
export const verifyOtpController = async (req: Request, res: Response) => {
  const response: IApiResponse<null> = await verifyOtp(req.body.email, req.body.otp_code,req.t);
  res.status(response.statusCode).json(response);
};

// request Reset Password
export const requestResetPasswordController = async (req: Request, res: Response) => {
  const response: IApiResponse<null> = await requestResetPassword(req.body.email,req.t);
  res.status(response.statusCode).json(response);
};

// verify Reset Otp
// export const verifyResetOtpController = async (req: Request, res: Response) => {
//   const response: IApiResponse<null> = await verifyOtp(req.body.email, req.body.otp,req.t);
//   res.status(response.statusCode).json(response);
// };

// reset Password
export const resetPasswordController = async (req: Request, res: Response) => {
  const response: IApiResponse<null> = await resetPassword(req.body.email,req.body.new_password,req.t);
  res.status(response.statusCode).json(response);
};

// social login
export const socialLoginController = async (req: Request, res: Response) => {
  const { provider, profile } = req.body;
  const response = await socialLoginService(provider, profile, req.t);
  res.status(response.statusCode).json(response);
};