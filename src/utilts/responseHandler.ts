import { SuccessResponse, ErrorResponse } from '../interfaces/ApiResponse';

export const successResponse = <T>(message: string, data: T, statusCode: number = 200): SuccessResponse<T> => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

export const errorResponse = (
  message: string,
  statusCode: number = 500,
  validationErrors: { field: any; message: any }[] = []
): ErrorResponse => {
  return {
    success: false,
    statusCode,
    message,
    errors: validationErrors,
  };
};