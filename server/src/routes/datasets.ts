import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { ExemplarService } from '../services/exemplar.service.js';
import { logger } from '../utils/logger.js';

export const datasetsRouter = Router();

/**
 * GET /api/datasets/samples
 * Returns list of curated municipal dataset samples for testing
 */
datasetsRouter.get('/datasets/samples', (_req: Request, res: Response) => {
  try {
    const samples = ExemplarService.getCuratedSamples();
    res.json({
      status: 'ok',
      total: samples.length,
      samples,
    });
  } catch (err: any) {
    logger.error('Error fetching dataset samples', { error: err.message });
    res.status(500).json({ error: 'Failed to fetch dataset samples' });
  }
});

/**
 * GET /api/datasets/raw/*
 * Safely streams raw sample images from the Datasets directory
 */
datasetsRouter.get('/datasets/raw/*', (req: Request, res: Response) => {
  try {
    const relPath = req.params[0];
    if (!relPath || relPath.includes('..')) {
      return res.status(400).json({ error: 'Invalid path' });
    }

    const datasetsDir = ExemplarService.getDatasetsDir();
    const resolvedPath = path.resolve(datasetsDir, relPath);

    // Prevent directory traversal outside Datasets
    if (!resolvedPath.startsWith(datasetsDir)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ error: 'Sample image not found' });
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 24h
    fs.createReadStream(resolvedPath).pipe(res);
  } catch (err: any) {
    logger.error('Error serving raw dataset image', { error: err.message });
    res.status(500).json({ error: 'Failed to stream dataset image' });
  }
});
