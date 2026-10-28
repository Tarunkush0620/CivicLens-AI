import { Router, Request, Response } from 'express';
import { CreateCaseRequestSchema } from '../schemas/case.schema.js';
import { CaseService } from '../services/case.service.js';
import { db } from '../repositories/db.js';
import { upload } from '../middleware/upload.js';
import { ImageService } from '../services/image.service.js';

export const casesRouter = Router();

casesRouter.post('/cases', async (req: Request, res: Response, next) => {
  try {
    const parsed = CreateCaseRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid case payload.',
          details: parsed.error.format(),
          requestId: req.requestId,
        },
      });
    }

    const complaint = await CaseService.createCase(parsed.data);

    res.status(201).json({
      case_id: complaint.case_id,
      id: complaint.id,
      complaint,
      requestId: req.requestId,
    });
  } catch (err) {
    next(err);
  }
});

casesRouter.get('/cases', async (req: Request, res: Response, next) => {
  try {
    const status = req.query.status as string;
    const category = req.query.category as string;
    const severity = req.query.severity as string;
    const q = req.query.q as string;
    const fields = req.query.fields as string;

    const list = await db.getAllComplaints({ status, category, severity, q });

    // Lightweight map projection
    if (fields === 'map') {
      const mapItems = list.map((c) => ({
        id: c.id,
        case_id: c.case_id,
        latitude: c.latitude,
        longitude: c.longitude,
        category: c.category,
        severity: c.severity,
        status: c.status,
        complaint_title: c.complaint_title,
        address: c.address,
        image_url: c.image_url,
        report_count: c.report_count,
        created_at: c.created_at,
      }));
      return res.status(200).json({ items: mapItems, total: mapItems.length });
    }

    res.status(200).json({
      items: list,
      total: list.length,
      requestId: req.requestId,
    });
  } catch (err) {
    next(err);
  }
});

casesRouter.get('/cases/:caseId', async (req: Request, res: Response, next) => {
  try {
    const caseId = req.params.caseId;
    const details = await CaseService.getCaseFullDetails(caseId);

    if (!details) {
      return res.status(404).json({
        error: {
          code: 'CASE_NOT_FOUND',
          message: `Civic case '${caseId}' was not found. Please check the Case ID.`,
          requestId: req.requestId,
        },
      });
    }

    res.status(200).json({
      ...details,
      requestId: req.requestId,
    });
  } catch (err) {
    next(err);
  }
});

casesRouter.post(
  '/cases/:caseId/evidence',
  upload.single('image'),
  async (req: Request, res: Response, next) => {
    try {
      const caseId = req.params.caseId;
      let imageUrl = req.body.image_url;

      if (req.file) {
        const processed = await ImageService.processAndSanitize(
          req.file.buffer,
          req.file.originalname
        );
        imageUrl = processed.url;
      }

      if (!imageUrl) {
        return res.status(400).json({
          error: {
            code: 'MISSING_IMAGE',
            message: 'Image or image_url required to attach evidence.',
            requestId: req.requestId,
          },
        });
      }

      const note = req.body.note || 'Additional corroborating photo from nearby citizen';
      const updated = await CaseService.addAdditionalEvidence(caseId, imageUrl, note);

      if (!updated) {
        return res.status(404).json({
          error: {
            code: 'CASE_NOT_FOUND',
            message: `Case ${caseId} does not exist.`,
            requestId: req.requestId,
          },
        });
      }

      res.status(200).json({
        success: true,
        case_id: caseId,
        report_count: updated.report_count,
        requestId: req.requestId,
      });
    } catch (err) {
      next(err);
    }
  }
);
