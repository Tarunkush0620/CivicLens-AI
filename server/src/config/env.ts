import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../server/.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(8080),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),

  // Gemini
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('gemini-embedding-001'),
  AI_ENABLED: z.coerce.boolean().default(true),
  AI_MAX_CONCURRENCY: z.coerce.number().default(5),

  // Supabase (Optional, fallback to high-speed local store if not configured)
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_KEY: z.string().optional().default(''),

  // Admin Passcode
  ADMIN_PASSCODE: z.string().default('civiclens2026'),

  // Duplicate detection config
  DUP_RADIUS_M: z.coerce.number().default(100),
  DUP_SCORE_THRESHOLD: z.coerce.number().default(0.65),

  // Rate limits
  RATE_LIMIT_ANALYZE_PER_MIN: z.coerce.number().default(15),
  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
