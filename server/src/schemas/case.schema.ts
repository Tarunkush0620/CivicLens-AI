import { z } from 'zod';
import { AnalysisOutputSchema } from './analysis.schema.js';

export const CASE_STATUSES = [
  'SUBMITTED',
  'UNDER_INSPECTION',
  'IN_PROGRESS',
  'RESOLVED',
  'REOPENED',
] as const;

export type CaseStatus = typeof CASE_STATUSES[number];

export const CreateCaseRequestSchema = z.object({
  upload_token: z.string().optional(),
  image_url: z.string().optional(),
  analysis: AnalysisOutputSchema,
  complaint_title: z.string().min(3),
  complaint_text_ai: z.string().min(10),
  complaint_text_final: z.string().min(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().default('Greater Noida, Uttar Pradesh'),
});

export type CreateCaseRequest = z.infer<typeof CreateCaseRequestSchema>;

export const UpdateStatusRequestSchema = z.object({
  status: z.enum(CASE_STATUSES),
  note: z.string().optional().default('Status updated by municipal administrator'),
});

export type UpdateStatusRequest = z.infer<typeof UpdateStatusRequestSchema>;
