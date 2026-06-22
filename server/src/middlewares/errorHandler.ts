import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorCode = err instanceof AppError ? err.code : 'INTERNAL_SERVER_ERROR';
  const details = err instanceof AppError ? err.details : null;

  // Log server errors (500) with full stack trace, client errors with code/message only
  if (statusCode === 500) {
    console.error(`[SYSTEM_ERROR] ${err.name}: ${err.message}\n`, err.stack);
  } else {
    console.warn(`[API_WARNING] ${errorCode} (${statusCode}): ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && statusCode === 500 && { stack: err.stack }),
    },
  });
};
