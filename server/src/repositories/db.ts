import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface SavedLocation {
  id: string;
  label: 'Home' | 'College' | 'Workplace' | 'Other';
  address: string;
  latitude: number;
  longitude: number;
}

export interface UserRecord {
  id: string;
  civic_id: string; // Permanent Unique Civic ID (e.g. CIV-8K29-X4P7)
  name: string;
  email: string;
  avatar_url?: string;
  verified: boolean;
  impact_points: number;
  saved_locations: SavedLocation[];
  created_at: string;
  updated_at: string;
}

export interface ComplaintRecord {
  id: string;
  case_id: string;
  civic_id?: string; // Links issue to citizen's permanent Civic ID
  image_url: string;
  category: string;
  severity: string;
  confidence: number;
  description: string;
  hazard: string;
  department: string;
  urgency: string;
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
  description_embedding?: number[];
  status: string;
  report_count: number;
  created_at: string;
  updated_at: string;
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
  resolution_status: string;
  confidence: number;
  before_summary: string;
  after_summary: string;
  same_location_likelihood: string;
  remaining_issues: string[];
  admin_confirmed: boolean;
  created_at: string;
}

export interface DuplicateDecisionRecord {
  id: string;
  candidate_case_id: string;
  score: number;
  user_decision: string;
  created_at: string;
}

export interface SessionMetricRecord {
  id: string;
  time_to_submit_seconds: number;
  complaint_edit_ratio: number;
  created_at: string;
}

interface LocalDatabaseState {
  users: UserRecord[];
  complaints: ComplaintRecord[];
  evidence: EvidenceRecord[];
  case_events: CaseEventRecord[];
  resolution_checks: ResolutionCheckRecord[];
  duplicate_decisions: DuplicateDecisionRecord[];
  sessions_metrics: SessionMetricRecord[];
}

const DEFAULT_USER: UserRecord = {
  id: 'usr-tarun-kushwaha',
  civic_id: 'CIV-8K29-X4P7',
  name: 'Tarun Kushwaha',
  email: 'tarun@example.com',
  verified: true,
  impact_points: 85,
  saved_locations: [
    {
      id: 'loc-1',
      label: 'Home',
      address: 'Sector 62, Noida, Uttar Pradesh',
      latitude: 28.628,
      longitude: 77.3649,
    },
    {
      id: 'loc-2',
      label: 'Workplace',
      address: 'Cyber Hub, DLF Phase 2, Gurugram, Haryana',
      latitude: 28.495,
      longitude: 77.089,
    },
    {
      id: 'loc-3',
      label: 'College',
      address: 'Knowledge Park III, Greater Noida, Uttar Pradesh',
      latitude: 28.472,
      longitude: 77.489,
    },
  ],
  created_at: '2026-01-15T09:00:00.000Z',
  updated_at: new Date().toISOString(),
};

class DatabaseManager {
  private supabase: SupabaseClient | null = null;
  private localDbPath: string;
  private state: LocalDatabaseState = {
    users: [DEFAULT_USER],
    complaints: [],
    evidence: [],
    case_events: [],
    resolution_checks: [],
    duplicate_decisions: [],
    sessions_metrics: [],
  };

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.localDbPath = path.join(dataDir, 'db.json');
    this.loadLocalData();

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      try {
        this.supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
        logger.info('Connected to Supabase client');
      } catch (err) {
        logger.warn('Failed to initialize Supabase, fallback to persistent local store', { error: String(err) });
      }
    }
  }

  private loadLocalData() {
    if (fs.existsSync(this.localDbPath)) {
      try {
        const raw = fs.readFileSync(this.localDbPath, 'utf8');
        const parsed = JSON.parse(raw);
        this.state = {
          ...this.state,
          ...parsed,
          users: parsed.users && parsed.users.length > 0 ? parsed.users : [DEFAULT_USER],
        };
        // Ensure default user has CIV-8K29-X4P7
        if (!this.state.users.some((u) => u.civic_id === DEFAULT_USER.civic_id)) {
          this.state.users.unshift(DEFAULT_USER);
        }
        // Associate existing complaints with user if needed
        this.state.complaints.forEach((c) => {
          if (!c.civic_id) c.civic_id = DEFAULT_USER.civic_id;
        });
        this.saveLocalData();
      } catch (e) {
        logger.error('Failed to parse local db.json', { error: String(e) });
      }
    } else {
      this.saveLocalData();
    }
  }

  private saveLocalData() {
    try {
      fs.writeFileSync(this.localDbPath, JSON.stringify(this.state, null, 2), 'utf8');
    } catch (e) {
      logger.error('Failed to save local db.json', { error: String(e) });
    }
  }

  public async clearAll() {
    this.state = {
      users: [],
      complaints: [],
      evidence: [],
      case_events: [],
      resolution_checks: [],
      duplicate_decisions: [],
      sessions_metrics: [],
    };
    this.saveLocalData();
  }

  // --- Complaints ---
  public async createComplaint(record: Omit<ComplaintRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ComplaintRecord> {
    const now = new Date().toISOString();
    const newRecord: ComplaintRecord = {
      ...record,
      id: uuidv4(),
      created_at: now,
      updated_at: now,
    };

    if (this.supabase) {
      const { data, error } = await this.supabase.from('complaints').insert(newRecord).select().single();
      if (!error && data) return data as ComplaintRecord;
      logger.warn('Supabase insert failed, storing locally', { error });
    }

    this.state.complaints.unshift(newRecord);
    this.saveLocalData();
    return newRecord;
  }

  public async getComplaintByCaseId(caseId: string): Promise<ComplaintRecord | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase.from('complaints').select('*').eq('case_id', caseId).single();
      if (!error && data) return data as ComplaintRecord;
    }
    return this.state.complaints.find((c) => c.case_id.toLowerCase() === caseId.toLowerCase()) || null;
  }

  public async getAllComplaints(filters?: {
    status?: string;
    category?: string;
    severity?: string;
    q?: string;
  }): Promise<ComplaintRecord[]> {
    let list = [...this.state.complaints];

    if (filters?.status) {
      list = list.filter((c) => c.status === filters.status);
    }
    if (filters?.category) {
      list = list.filter((c) => c.category === filters.category);
    }
    if (filters?.severity) {
      list = list.filter((c) => c.severity === filters.severity);
    }
    if (filters?.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (c) =>
          c.case_id.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.complaint_title.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async updateComplaintStatus(caseId: string, status: string): Promise<ComplaintRecord | null> {
    const now = new Date().toISOString();
    const complaint = this.state.complaints.find((c) => c.case_id === caseId);
    if (!complaint) return null;

    complaint.status = status;
    complaint.updated_at = now;
    this.saveLocalData();

    if (this.supabase) {
      await this.supabase.from('complaints').update({ status, updated_at: now }).eq('case_id', caseId);
    }

    return complaint;
  }

  public async incrementReportCount(caseId: string): Promise<void> {
    const complaint = this.state.complaints.find((c) => c.case_id === caseId);
    if (complaint) {
      complaint.report_count += 1;
      complaint.updated_at = new Date().toISOString();
      this.saveLocalData();
    }
    if (this.supabase) {
      await this.supabase.rpc('increment_report_count', { target_case_id: caseId });
    }
  }

  // --- Evidence ---
  public async addEvidence(record: Omit<EvidenceRecord, 'id' | 'created_at'>): Promise<EvidenceRecord> {
    const newRecord: EvidenceRecord = {
      ...record,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.state.evidence.push(newRecord);
    this.saveLocalData();

    if (this.supabase) {
      await this.supabase.from('evidence').insert(newRecord);
    }
    return newRecord;
  }

  public async getEvidenceForCase(caseId: string): Promise<EvidenceRecord[]> {
    return this.state.evidence.filter((e) => e.case_id === caseId);
  }

  // --- Case Events (Timeline) ---
  public async addEvent(record: Omit<CaseEventRecord, 'id' | 'created_at'>): Promise<CaseEventRecord> {
    const newRecord: CaseEventRecord = {
      ...record,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.state.case_events.push(newRecord);
    this.saveLocalData();

    if (this.supabase) {
      await this.supabase.from('case_events').insert(newRecord);
    }
    return newRecord;
  }

  public async getEventsForCase(caseId: string): Promise<CaseEventRecord[]> {
    return this.state.case_events
      .filter((e) => e.case_id === caseId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // --- Resolution Checks ---
  public async addResolutionCheck(record: Omit<ResolutionCheckRecord, 'id' | 'created_at'>): Promise<ResolutionCheckRecord> {
    const newRecord: ResolutionCheckRecord = {
      ...record,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.state.resolution_checks.push(newRecord);
    this.saveLocalData();

    if (this.supabase) {
      await this.supabase.from('resolution_checks').insert(newRecord);
    }
    return newRecord;
  }

  public async getResolutionChecksForCase(caseId: string): Promise<ResolutionCheckRecord[]> {
    return this.state.resolution_checks.filter((r) => r.case_id === caseId);
  }

  public async confirmResolutionCheck(caseId: string): Promise<void> {
    const checks = this.state.resolution_checks.filter((r) => r.case_id === caseId);
    if (checks.length > 0) {
      checks[checks.length - 1].admin_confirmed = true;
      this.saveLocalData();
    }
    if (this.supabase) {
      await this.supabase.from('resolution_checks').update({ admin_confirmed: true }).eq('case_id', caseId);
    }
  }

  // --- Duplicate Decisions ---
  public async logDuplicateDecision(record: Omit<DuplicateDecisionRecord, 'id' | 'created_at'>): Promise<void> {
    const newRecord: DuplicateDecisionRecord = {
      ...record,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.state.duplicate_decisions.push(newRecord);
    this.saveLocalData();

    if (this.supabase) {
      await this.supabase.from('duplicate_decisions').insert(newRecord);
    }
  }

  // --- Session Metrics ---
  public async logSessionMetric(timeSeconds: number, editRatio: number): Promise<void> {
    const newRecord: SessionMetricRecord = {
      id: uuidv4(),
      time_to_submit_seconds: timeSeconds,
      complaint_edit_ratio: editRatio,
      created_at: new Date().toISOString(),
    };
    this.state.sessions_metrics.push(newRecord);
    this.saveLocalData();

    if (this.supabase) {
      await this.supabase.from('sessions_metrics').insert(newRecord);
    }
  }

  public async getSessionMetrics() {
    return this.state.sessions_metrics;
  }

  // --- User & Civic ID Management (Differentiating Civic ID from Case ID) ---
  public generateUniqueCivicId(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let civicId = '';
    let attempts = 0;
    do {
      const p1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const p2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      civicId = `CIV-${p1}-${p2}`;
      attempts++;
    } while (this.state.users.some((u) => u.civic_id === civicId) && attempts < 100);
    return civicId;
  }

  public generateUniqueCaseId(year = 2026): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let caseId = '';
    let attempts = 0;
    do {
      const suffix = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      caseId = `CASE-${year}-${suffix}`;
      attempts++;
    } while (this.state.complaints.some((c) => c.case_id === caseId) && attempts < 100);
    return caseId;
  }

  public async getUserProfile(civicId?: string): Promise<{
    user: UserRecord;
    activity: {
      issues_reported: number;
      resolved: number;
      in_progress: number;
      impact_points: number;
    };
    saved_locations: SavedLocation[];
    recent_reports: ComplaintRecord[];
  }> {
    this.loadLocalData();
    const targetCivicId = civicId || DEFAULT_USER.civic_id;
    let user = this.state.users.find((u) => u.civic_id === targetCivicId);
    if (!user) {
      user = DEFAULT_USER;
      this.state.users.unshift(user);
      this.saveLocalData();
    }

    // Dynamic complaints activity from actual records
    const userComplaints = this.state.complaints.filter((c) => c.civic_id === targetCivicId);
    const resolvedCount = userComplaints.filter((c) => c.status === 'RESOLVED').length;
    const inProgressCount = userComplaints.filter((c) => c.status === 'IN_PROGRESS').length;

    const sanitize = (c: ComplaintRecord) => {
      const { description_embedding, ...rest } = c;
      return rest as ComplaintRecord;
    };

    return {
      user,
      activity: {
        issues_reported: userComplaints.length,
        resolved: resolvedCount,
        in_progress: inProgressCount,
        impact_points: user.impact_points || 85,
      },
      saved_locations: user.saved_locations || [],
      recent_reports: userComplaints.map(sanitize),
    };
  }

  public async getUserReports(civicId?: string): Promise<ComplaintRecord[]> {
    this.loadLocalData();
    const targetCivicId = civicId || DEFAULT_USER.civic_id;
    const userReports = this.state.complaints.filter((c) => c.civic_id === targetCivicId);
    const list = userReports.length > 0 ? userReports : this.state.complaints;
    return list.map((c) => {
      const { description_embedding, ...rest } = c;
      return rest as ComplaintRecord;
    });
  }

  public async updateUserProfile(
    civicId: string,
    updates: Partial<Pick<UserRecord, 'name' | 'email'>>
  ): Promise<UserRecord | null> {
    const targetCivicId = civicId || DEFAULT_USER.civic_id;
    const user = this.state.users.find((u) => u.civic_id === targetCivicId);
    if (!user) return null;
    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    user.updated_at = new Date().toISOString();
    this.saveLocalData();
    return user;
  }

  public async addSavedLocation(
    civicId: string,
    location: Omit<SavedLocation, 'id'>
  ): Promise<SavedLocation> {
    const targetCivicId = civicId || DEFAULT_USER.civic_id;
    let user = this.state.users.find((u) => u.civic_id === targetCivicId);
    if (!user) {
      user = DEFAULT_USER;
      this.state.users.unshift(user);
    }
    const newLocation: SavedLocation = {
      ...location,
      id: `loc-${Date.now()}`,
    };
    if (!user.saved_locations) user.saved_locations = [];
    user.saved_locations.push(newLocation);
    this.saveLocalData();
    return newLocation;
  }

  public async deleteSavedLocation(civicId: string, locationId: string): Promise<boolean> {
    const targetCivicId = civicId || DEFAULT_USER.civic_id;
    const user = this.state.users.find((u) => u.civic_id === targetCivicId);
    if (user && user.saved_locations) {
      user.saved_locations = user.saved_locations.filter((l) => l.id !== locationId);
      this.saveLocalData();
      return true;
    }
    return false;
  }

  public async trackCaseById(caseId: string) {
    const query = caseId.trim().toUpperCase();
    const complaint = this.state.complaints.find(
      (c) => c.case_id.toUpperCase() === query || c.id === query
    );
    if (!complaint) return null;

    const evidence = this.state.evidence.filter((e) => e.case_id === complaint.case_id);
    const events = this.state.case_events.filter((e) => e.case_id === complaint.case_id);
    const resolution = this.state.resolution_checks.find((r) => r.case_id === complaint.case_id);

    return {
      complaint,
      evidence,
      events,
      resolution,
    };
  }
}

export const db = new DatabaseManager();
