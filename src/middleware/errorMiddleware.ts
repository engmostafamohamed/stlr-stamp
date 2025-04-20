import { Request, Response, NextFunction } from 'express'
import AppError from '../utilts/AppError'
import { errorResponse } from '../utilts/responseHandler'

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let statusCode = 500
  let message = 'Internal Server Error'

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  }

  res.status(statusCode).json(errorResponse(message, statusCode))
}

export default errorMiddleware
