import { PrismaClient } from "@prisma/client";
import { IUser } from '../interfaces/User'
import { IAuthResponse } from '../interfaces/AuthResponse'
import { generateOTP,generateToken, hashPassword, comparePassword } from '../utilts/auth';
import { sendOTPByEmail } from '../utilts/emailService';
import { IApiResponse } from "../interfaces/ApiResponse";
import { successResponse, errorResponse } from "../utilts/responseHandler";
import AppError from '../utilts/AppError'
const prisma = new PrismaClient();
export const registerUser = async (
  email: string,
  password: string,
  userName: string,
  phoneNumber: string,
  t: (key: string) => string
): Promise<IApiResponse<IUser | null>> => {
  try{
    const lowerEmail = email.toLowerCase();
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({ where:{email:lowerEmail} });
    if (existingUser) {
      return errorResponse("Email already exists", 400); // Using errorResponse instead of throwing an error
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // find role
    const role= await prisma.role.findUnique({
      where: {
        name: 'customer'
      }
    })
    if (!role) {
      return errorResponse("Default role not found", 500);
    }
    // Create a new user
    const newUser = await prisma.user.create({
      data: {
        username: userName ,
        email,
        password: hashedPassword,
        phone: phoneNumber,
        roles: {
          connect: { id: role.id }, 
        },
      },
    });
    const otpCode = generateOTP();

    // Store OTP in PasswordResetOTP table
    await prisma.passwordResetOTP.create({
      data: {
        email,
        otp: otpCode,
        type: "email_verification",
        expires_at: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
      },
    });
    // Sending OTP email
    try {
      await sendOTPByEmail(email, otpCode);
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return errorResponse(t("EMAIL_SENDING_FAILED"), 500);
    }

    return successResponse("Customer registered successfully", {
      id: newUser.user_id.toString(),
      name: newUser.username,
      email: newUser.email,
      phoneNumber:newUser.phone,
      role: "customer",
    }, 201);
  }
  catch(error: any){
    if (error.errors) {
      const validationErrors = Object.entries(error.errors).map(([field, err]: any) => ({
        field,
        message: err.message,
      }));

      return errorResponse(t("VALIDATION_FAILED"), 400, validationErrors);
    }

    if (error.code === 11000) {
      return errorResponse(t("email_exist"), 400);
    }

    return errorResponse(t("REGISTRATION_ERROR"), 500);
  }
};


export const loginUser = async (email: string, password: string ,t: (key: string) => string): Promise<IApiResponse<IAuthResponse>> => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        user_id: true,
        password: true,
        verified: true,
        status: true,
        roles: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      return errorResponse(t("validation.email_not_verified_or_deleted"), 401);
    }else if(user.status != "active"){
      return errorResponse(t("validation.email_not_verified_or_deleted"), 409);
    }else if(!user.verified){
      return errorResponse(t("validation.email_not_verified"), 409);
  } 

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return errorResponse(t("INVALID_CREDENTIALS"), 401);
    }

    const token = generateToken(user.user_id.toString(),user.roles?.[0]?.name || 'customer');

    return successResponse(t("LOGIN_SUCCESS"), { token }, 200);
  } catch (error) {
    return errorResponse(t("LOGIN_FAILED"), 500);
  }
};

// Send OTP
export const sendOtp = async (email: string, t: (key: string) => string): Promise<IApiResponse<null>> => { 
  const user = await prisma.user.findUnique({ where:{email}});
  if (!user) {
    return errorResponse(t("validation.email_not_found"), 404);
  } else if (user.verified) {
    return errorResponse(t("validation.email_already_verified"), 400);
  }
  // Decide OTP type based on email verification status
  const otpType = user.verified ? "reset_password" : "email_verification";
  const otpCode = generateOTP();

  // Store OTP in PasswordResetOTP table
  await prisma.passwordResetOTP.create({
    data: {
      email,
      otp: otpCode,
      type: otpType,
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
    },
  });
  // Sending OTP email
  try {
    await sendOTPByEmail(email, otpCode);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return errorResponse(t("EMAIL_SENDING_FAILED"), 500);
  }
  return successResponse(t("validation.send_otp"), null, 200);
};


export const verifyOtp = async (
  email: string,
  otp_code: string,
  t: (key: string) => string
): Promise<IApiResponse<null>> => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return errorResponse(t("validation.email_not_found"), 404);
  }

  const otpRecord = await prisma.passwordResetOTP.findFirst({
    where: { email },
    orderBy: { created_at: "desc" },
  });

  if (
    !otpRecord ||
    otpRecord.otp !== otp_code ||
    otpRecord.expires_at < new Date()
  ) {
    return errorResponse(t("validation.invalid_or_expired_otp"), 400);
  }

  let responseMessage = "";

  if (otpRecord.type === "email_verification") {
    await prisma.user.update({
      where: { email },
      data: {
        verified: true,
        status: "active",
      },
    });
    await prisma.passwordResetOTP.deleteMany({ where: { email } });
    responseMessage = t("validation.account_verified");
  } else if (otpRecord.type === "reset_password") {
    // no user update needed here
    await prisma.passwordResetOTP.update({
      where: { id: otpRecord.id },
      data: {
        verified: true,
      },
    });

    responseMessage = t("validation.verified_otp");
  }
  return successResponse(responseMessage, null, 200);
};


// requestResetPassword
export const requestResetPassword = async (
  email: string,
  t: (key: string) => string
): Promise<IApiResponse<null>> => {
  const user = await prisma.user.findUnique({ where:{email} });

  if (!user) {
    return errorResponse(t("validation.email_not_found"), 404);
  }else if(!user.verified){
    return errorResponse(t("validation.email_not_verified"), 409);
  }else if(user.status != "active"){
    return errorResponse(t("validation.email_deactivate"), 409);
  }
  const otpCode = generateOTP();

  // Store OTP in PasswordResetOTP table
  await prisma.passwordResetOTP.create({
    data: {
      email,
      otp: otpCode,
      type:"reset_password",
      expires_at: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
    },
  });

  // Sending OTP email
  try {
    await sendOTPByEmail(email, otpCode);
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return errorResponse(t("EMAIL_SENDING_FAILED"), 500);
  }
  return successResponse(t("validation.send_otp"), null, 200);
};

// resetPassword
export const resetPassword = async (
  email: string,
  newPassword: string,
  t: (key: string) => string
): Promise<IApiResponse<null>> => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return errorResponse(t("validation.email_not_found"), 404);
  }

  // Ensure a verified OTP exists
  const verifiedOtp = await prisma.passwordResetOTP.findFirst({
    where: {
      email,
      verified: true,
      // expires_at: { gte: new Date() },
    },
  });

  if (!verifiedOtp) {
    return errorResponse(t("validation.otp_not_verified"), 403);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { email },
    data: {
      password: hashedPassword,
    },
  });

  // Cleanup OTPs after successful reset
  await prisma.passwordResetOTP.deleteMany({
    where: { email },
  });

  return successResponse(t("validation.password_reset"), null, 200);
};


// social login service
export const socialLoginService = async (
  provider: string,
  profile: any,
  t: (key: string) => string
): Promise<IApiResponse<any>> => {
  const email = profile.emails?.[0]?.value;
  if (!email) {
    return errorResponse(t("validation.email_required"), 400);
  }
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      providerAccounts: true,
      roles: {
        select: {
          name: true,
        },
      },
    },
  });

  if (user) {
    const roleName = user.roles?.[0]?.name || "customer";
    const token = generateToken(user.user_id.toString(), roleName);
    return successResponse(t("auth.login_success"), { token, user }, 200);
  }

  const role = await prisma.role.findUnique({
    where: { name: "customer" },
  });

  if (!role) {
    return errorResponse("Default role not found", 500);
  }

  // Use provider name as password (e.g., "google" or "apple")
  const hashedPassword = await hashPassword(provider.toLowerCase());
  const newUser = await prisma.user.create({
    data: {
      email,
      username: profile.displayName || profile.name?.givenName || "New User",
      phone: "",
      password: hashedPassword,
      verified: true,
      status: "active",
      roles: {
        connect: { id: role.id },
      },
      providerAccounts: {
        create: {
          provider,
        },
      },
    },
    include: {
      roles: {
        select: {
          name: true,
        },
      },
    },
  });

  const roleName = newUser.roles?.[0]?.name || "customer";
  const token = generateToken(newUser.user_id.toString(), roleName);
  return successResponse(t("auth.register_success"), { token, user: newUser }, 201);
};
