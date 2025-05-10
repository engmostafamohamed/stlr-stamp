// import { Request } from "express";
// export interface AuthRequest extends Request{
//     user?: any;
    
// }

import { Request } from "express";
// import { TFunction } from "i18next";

export interface AuthRequest extends Request {
  user?: any;
//   t: TFunction;
  validationErrors?: {
    field: string;
    message: string;
  }[];
}
