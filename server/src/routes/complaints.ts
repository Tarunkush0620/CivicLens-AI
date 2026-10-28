import { Router, Request, Response } from 'express';
import { GenerateComplaintRequestSchema } from '../schemas/complaint.schema.js';
import { ComplaintService } from '../services/complaint.service.js';

export const complaintsRouter = Router();

complaintsRouter.post('/generate-complaint', async (req: Request, res: Response, next) => {
  try {
    const parsed = GenerateComplaintRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid analysis or location payload.',
          details: parsed.error.format(),
          requestId: req.requestId,
        },
      });
    }

    const { complaint, promptVersion } = await ComplaintService.generateComplaint(
      parsed.data.analysis,
      parsed.data.location
    );

    res.status(200).json({
      title: complaint.title,
      complaint: complaint.complaint,
      recommended_action: complaint.recommended_action,
      prompt_version: promptVersion,
      requestId: req.requestId,
    });
  } catch (err) {
    next(err);
  }
});
