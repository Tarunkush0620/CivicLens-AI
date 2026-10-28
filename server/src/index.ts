import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';

import { analyzeRouter } from './routes/analyze.js';
import { complaintsRouter } from './routes/complaints.js';
import { duplicatesRouter } from './routes/duplicates.js';
import { casesRouter } from './routes/cases.js';
import { adminRouter } from './routes/admin.js';
import { statsRouter } from './routes/stats.js';
import { datasetsRouter } from './routes/datasets.js';
import { userRouter } from './routes/user.js';

const app = express();

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or dev)
      if (!origin) return callback(null, true);
      return callback(null, true); // Dev flexible origin
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving for evidence images
app.use('/uploads', express.static(uploadDir));

// Request tracking ID
app.use(requestIdMiddleware);

// API Routes
app.use('/api', statsRouter);
app.use('/api', analyzeRouter);
app.use('/api', complaintsRouter);
app.use('/api', duplicatesRouter);
app.use('/api', casesRouter);
app.use('/api', adminRouter);
app.use('/api', datasetsRouter);
app.use('/api/user', userRouter);

// Centralized error handling
app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`CivicLens AI API Server running on port ${PORT}`, {
    env: env.NODE_ENV,
    port: PORT,
    clientOrigin: env.CLIENT_ORIGIN,
    aiModel: env.GEMINI_MODEL,
  });
});

export default app;