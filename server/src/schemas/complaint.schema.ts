import { z } from 'zod';
import { AnalysisOutputSchema } from './analysis.schema.js';

export const ComplaintOutputSchema = z.object({
  title: z.string().min(5).max(150),
  complaint: z.string().min(30),
  recommended_action: z.string().min(5),
  responsible_department: z.string().optional(),
  target_sla: z.string().optional(),
  required_materials: z.array(z.string()).optional(),
  draft_letter: z.string().optional(),
});

export type ComplaintOutput = z.infer<typeof ComplaintOutputSchema>;

export const GenerateComplaintRequestSchema = z.object({
  analysis: AnalysisOutputSchema,
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().default('Greater Noida, Uttar Pradesh'),
  }),
});

export type GenerateComplaintRequest = z.infer<typeof GenerateComplaintRequestSchema>;
