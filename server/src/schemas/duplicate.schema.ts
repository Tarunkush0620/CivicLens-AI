import { z } from 'zod';
import { CATEGORIES } from './analysis.schema.js';

export const DuplicateCheckRequestSchema = z.object({
  category: z.enum(CATEGORIES),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().default(''),
});

export type DuplicateCheckRequest = z.infer<typeof DuplicateCheckRequestSchema>;

export const DuplicateDecisionRequestSchema = z.object({
  candidate_case_id: z.string(),
  score: z.number(),
  user_decision: z.enum(['ADDED_TO_EXISTING', 'DIFFERENT_ISSUE']),
});

export type DuplicateDecisionRequest = z.infer<typeof DuplicateDecisionRequestSchema>;
