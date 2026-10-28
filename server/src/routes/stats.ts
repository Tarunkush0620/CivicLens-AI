import { Router, Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service.js';
import { db } from '../repositories/db.js';
import { env } from '../config/env.js';

export const statsRouter = Router();

statsRouter.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await StatsService.getStats();
    res.status(200).json({
      ...stats,
      requestId: req.requestId,
    });
  } catch (err) {
    next(err);
  }
});

statsRouter.get('/health', async (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    ai_enabled: env.AI_ENABLED,
    gemini_model: env.GEMINI_MODEL,
    has_api_key: Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== ''),
    supabase_configured: Boolean(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY),
    requestId: req.requestId,
  });
});

statsRouter.post('/metrics/session', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { time_to_submit_seconds, complaint_edit_ratio } = req.body;
    if (typeof time_to_submit_seconds === 'number') {
      await db.logSessionMetric(
        time_to_submit_seconds,
        typeof complaint_edit_ratio === 'number' ? complaint_edit_ratio : 0
      );
    }
    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
});
