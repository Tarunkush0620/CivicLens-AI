import { z } from 'zod';

export const CATEGORIES = [
  'Pothole',
  'Garbage',
  'Broken Streetlight',
  'Open Manhole',
  'Damaged Footpath',
  'Exposed Electrical Wire',
  'Water Leakage',
  'Illegal Dumping',
  'Damaged Traffic Sign',
  'Fallen Tree',
  'Road Damage',
  'Other',
  'None detected',
] as const;

export type CivicCategory = typeof CATEGORIES[number];

export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type CivicSeverity = typeof SEVERITIES[number];

export const URGENCIES = ['ROUTINE', 'SOON', 'URGENT', 'IMMEDIATE'] as const;
export type CivicUrgency = typeof URGENCIES[number];

export const DEPARTMENTS = [
  'Municipal Roads Department',
  'Sanitation / Solid Waste Management',
  'Electricity / Street Lighting Department',
  'Water Supply & Sewerage Department',
  'Traffic Police / Traffic Engineering',
  'Horticulture / Parks Department',
  'General Civic Grievance Cell',
] as const;

export type CivicDepartment = typeof DEPARTMENTS[number];

export const DetectedObjectSchema = z.object({
  label: z.string(),
  confidence: z.number().min(0).max(1),
  box_2d: z.array(z.number().int().min(0).max(1000)).length(4).optional(),
});

export type DetectedObject = z.infer<typeof DetectedObjectSchema>;

export const PrecedentMatchSchema = z.object({
  category: z.string(),
  dataset_source: z.string(),
  similarity: z.number().min(0).max(1),
  exemplar_note: z.string(),
});

export type PrecedentMatch = z.infer<typeof PrecedentMatchSchema>;

export const AnalysisOutputSchema = z.object({
  category: z.enum(CATEGORIES),
  severity: z.enum(SEVERITIES),
  confidence: z.number().min(0).max(1),
  description: z.string().min(5),
  hazard: z.string().optional().default('None identified'),
  department: z.string(),
  urgency: z.enum(URGENCIES),
  recommended_action: z.string().min(5),
  severity_reasons: z.array(z.string()).min(1).max(7),
  contains_people_or_plates: z.boolean().default(false),
  box_2d: z.array(z.number().int().min(0).max(1000)).length(4).optional(),
  road_type: z.string().optional(),
  detected_objects: z.array(DetectedObjectSchema).optional(),
  is_valid_issue: z.boolean().default(true),
  negative_control_reason: z.string().optional(),
  precedent_match: PrecedentMatchSchema.optional(),
});

export type AnalysisOutput = z.infer<typeof AnalysisOutputSchema>;

export const AnalyzeRequestSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string().optional().default('Greater Noida, Uttar Pradesh'),
});
