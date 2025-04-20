export type SuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
};

export type ErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  errors?: { field: any; message: any }[];
};


// Unified Response Type (Can be either Success or Error)
export type IApiResponse<T> = SuccessResponse<T> | ErrorResponse;
