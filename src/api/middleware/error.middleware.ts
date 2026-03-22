import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/errors';
import { logger } from '../../utils';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError && err.isOperational) {
    logger.warn(`Operational error: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
    });

    res.status(err.statusCode).json({
      status: 'error',
      code: err.code,
      message: err.message,
    });
    return;
  }

  logger.error('Unexpected error', {
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
  });
}
