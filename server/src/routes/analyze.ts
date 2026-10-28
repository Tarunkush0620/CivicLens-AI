import { Router, Request, Response } from 'express';
import { upload } from '../middleware/upload.js';
import { analyzeRateLimiter } from '../middleware/rateLimit.js';
import { ImageService } from '../services/image.service.js';
import { AnalysisService } from '../services/analysis.service.js';
import { AnalyzeRequestSchema } from '../schemas/analysis.schema.js';

export const analyzeRouter = Router();

analyzeRouter.post(
  '/analyze',
  analyzeRateLimiter,
  upload.single('image'),
  async (req: Request, res: Response, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: {
            code: 'MISSING_FILE',
            message: 'Please provide an image file of the civic issue.',
            requestId: req.requestId,
          },
        });
      }

      const bodyParsed = AnalyzeRequestSchema.safeParse(req.body);
      const location = bodyParsed.success
        ? bodyParsed.data
        : {
            latitude: 28.4744,
            longitude: 77.504,
            address: 'Greater Noida, Uttar Pradesh',
          };

      // 1. Process and sanitize image with Sharp (strip EXIF, resize, compute hash)
      const processedImage = await ImageService.processAndSanitize(
        req.file.buffer,
        req.file.originalname
      );

      // 2. Run multimodal vision analysis with Gemini
      const { analysis, cacheHit, promptVersion } = await AnalysisService.analyzeImage(
        processedImage,
        location
      );

      res.status(200).json({
        analysis,
        image_url: processedImage.url,
        cache_hit: cacheHit,
        prompt_version: promptVersion,
        requestId: req.requestId,
      });
    } catch (err) {
      next(err);
    }
  }
);
