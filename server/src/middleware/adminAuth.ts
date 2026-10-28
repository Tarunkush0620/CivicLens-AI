import { Request, Response, NextFunction } from 'express';

/**
 * Resolution & Verification Access Middleware
 * Open access for citizens, municipal field workers, and contractors
 * to verify case resolutions and upload post-repair evidence.
 */
export function adminAuth(req: Request, res: Response, next: NextFunction) {
  // Open access enabled for community & municipal field resolution verification
  next();
}
