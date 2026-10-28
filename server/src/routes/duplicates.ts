import { Router, Request, Response } from 'express';
import {
  DuplicateCheckRequestSchema,
  DuplicateDecisionRequestSchema,
} from '../schemas/duplicate.schema.js';
import { DuplicateService } from '../services/duplicate.service.js';
import { db } from '../repositories/db.js';

export const duplicatesRouter = Router();

duplicatesRouter.post('/duplicates/check', async (req: Request, res: Response, next) => {
  try {
    const parsed = DuplicateCheckRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid duplicate check payload.',
          details: parsed.error.format(),
          requestId: req.requestId,
        },
      });
    }

    const result = await DuplicateService.checkDuplicates(
      parsed.data.category,
      parsed.data.latitude,
      parsed.data.longitude,
      parsed.data.description
    );

    res.status(200).json({
      ...result,
      requestId: req.requestId,
    });
  } catch (err) {
    next(err);
  }
});

duplicatesRouter.post('/duplicates/decision', async (req: Request, res: Response, next) => {
  try {
    const parsed = DuplicateDecisionRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid decision payload.',
          requestId: req.requestId,
        },
      });
    }

    await db.logDuplicateDecision(parsed.data);

    res.status(200).json({ success: true, requestId: req.requestId });
  } catch (err) {
    next(err);
  }
});
