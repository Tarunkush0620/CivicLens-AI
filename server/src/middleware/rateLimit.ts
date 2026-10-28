import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const analyzeRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: env.RATE_LIMIT_ANALYZE_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many analysis requests from this IP. Please wait a moment.',
    },
  },
});

export const adminRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
