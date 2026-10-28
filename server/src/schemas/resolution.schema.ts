import { z } from 'zod';

export const RESOLUTION_STATUSES = [
  'LIKELY_RESOLVED',
  'PARTIALLY_RESOLVED',
  'NOT_RESOLVED',
  'CANNOT_DETERMINE',
] as const;

export type ResolutionStatus = typeof RESOLUTION_STATUSES[number];

export const ResolutionOutputSchema = z.object({
  resolution_status: z.enum(RESOLUTION_STATUSES),
  confidence: z.number().min(0).max(1),
  before_summary: z.string().min(3),
  after_summary: z.string().min(3),
  same_location_likelihood: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  remaining_issues: z.array(z.string()).default([]),
});

export type ResolutionOutput = z.infer<typeof ResolutionOutputSchema>;

export const ConfirmResolutionRequestSchema = z.object({
  resolution_check_id: z.string().optional(),
  note: z.string().optional().default('Verified and confirmed by administrator'),
});
