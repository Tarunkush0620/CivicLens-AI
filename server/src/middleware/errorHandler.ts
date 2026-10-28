import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  logger.error('Unhandled server error', {
    error: err.message || String(err),
    stack: err.stack,
    requestId: req.requestId,
    path: req.path,
  });

  if (err.message === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      error: {
        code: 'UNSUPPORTED_MEDIA',
        message: "That file isn't a photo we can read. Use a JPG, PNG, or WEBP under 8 MB.",
        requestId: req.requestId,
      },
    });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds 8 MB limit. Please compress the image or choose another photo.',
        requestId: req.requestId,
      },
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'Something went wrong on our side. Try again in a moment.',
      requestId: req.requestId,
    },
  });
}
