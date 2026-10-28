export type CivicCategory =
  | 'Pothole'
  | 'Garbage'
  | 'Broken Streetlight'
  | 'Open Manhole'
  | 'Damaged Footpath'
  | 'Exposed Electrical Wire'
  | 'Water Leakage'
  | 'Illegal Dumping'
  | 'Damaged Traffic Sign'
  | 'Fallen Tree'
  | 'Road Damage'
  | 'Other'
  | 'None detected';

export type CivicSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CivicUrgency = 'ROUTINE' | 'SOON' | 'URGENT' | 'IMMEDIATE';
export type CaseStatus = 'SUBMITTED' | 'UNDER_INSPECTION' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED';

export interface DetectedObject {
  label: string;
  confidence: number;
  box_2d?: number[];
}

export interface PrecedentMatch {
  category: string;
  dataset_source: string;
  similarity: number;
  exemplar_note: string;
}

export interface DatasetSample {
  id: string;
  category: string;
  title: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'NONE';
  dataset_source: string;
  image_rel_path: string;
  image_url: string;
  has_ground_truth: boolean;
  ground_truth_hazard: string;
  ground_truth_dept: string;
  description: string;
}

export interface AnalysisOutput {
  category: CivicCategory;
  severity: CivicSeverity;
  confidence: number;
  description: string;
  hazard?: string;
  department: string;
  urgency: CivicUrgency;
  recommended_action: string;
  severity_reasons: string[];
  contains_people_or_plates: boolean;
  box_2d?: number[];
  road_type?: string;
  detected_objects?: DetectedObject[];
  is_valid_issue?: boolean;
  negative_control_reason?: string;
  precedent_match?: PrecedentMatch;
}

export interface ComplaintData {
  title: string;
  complaint: string;
  recommended_action: string;
  prompt_version?: string;
  responsible_department?: string;
  target_sla?: string;
  required_materials?: string[];
  draft_letter?: string;
}

export interface EvidenceRecord {
  id: string;
  complaint_id: string;
  case_id: string;
  image_url: string;
  kind: 'ORIGINAL' | 'ADDITIONAL' | 'AFTER';
  note?: string;
  created_at: string;
}

export interface CaseEventRecord {
  id: string;
  complaint_id: string;
  case_id: string;
  event_type: string;
  title: string;
  note?: string;
  author: string;
  created_at: string;
}

export interface ResolutionCheckRecord {
  id: string;
  complaint_id: string;
  case_id: string;
  after_image_url: string;
  resolution_status: 'LIKELY_RESOLVED' | 'PARTIALLY_RESOLVED' | 'NOT_RESOLVED' | 'CANNOT_DETERMINE';
  confidence: number;
  before_summary: string;
  after_summary: string;
  same_location_likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
  remaining_issues: string[];
  admin_confirmed: boolean;
  created_at: string;
}

export interface ComplaintRecord {
  id: string;
  case_id: string;
  image_url: string;
  category: CivicCategory;
  severity: CivicSeverity;
  confidence: number;
  description: string;
  hazard: string;
  department: string;
  urgency: CivicUrgency;
  recommended_action: string;
  severity_reasons: string[];
  contains_people_or_plates: boolean;
  box_2d?: number[] | null;
  road_type?: string;
  complaint_title: string;
  complaint_text_ai: string;
  complaint_text_final: string;
  latitude: number;
  longitude: number;
  address: string;
  status: CaseStatus;
  report_count: number;
  created_at: string;
  updated_at: string;
}

export interface DuplicateCandidate {
  case_id: string;
  category: string;
  severity: string;
  status: string;
  distance_m: number;
  score: number;
  created_at: string;
  report_count: number;
  image_url: string;
  address: string;
  description: string;
  complaint_title: string;
}

export interface DuplicateCheckResponse {
  is_duplicate: boolean;
  candidates: DuplicateCandidate[];
}

export interface CivicStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  high_priority: number;
  resolution_rate: number;
  avg_resolution_hours: number;
  severity_breakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  category_distribution: Record<string, number>;
  today: {
    reported: number;
    resolved: number;
  };
}
