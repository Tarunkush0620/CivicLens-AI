import {
  AnalysisOutput,
  ComplaintData,
  ComplaintRecord,
  DuplicateCheckResponse,
  CivicStats,
  CaseStatus,
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let errorData: any = {};
    try {
      errorData = await res.json();
    } catch {
      // fallback
    }
    const message = errorData.error?.message || `HTTP ${res.status}: ${res.statusText}`;
    const err = new Error(message);
    (err as any).code = errorData.error?.code || 'FETCH_ERROR';
    (err as any).status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  // Analyze image with Gemini
  analyzeImage: async (
    file: File,
    location: { latitude: number; longitude: number; address: string }
  ): Promise<{
    analysis: AnalysisOutput;
    image_url: string;
    cache_hit: boolean;
    prompt_version: string;
  }> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('latitude', location.latitude.toString());
    formData.append('longitude', location.longitude.toString());
    formData.append('address', location.address);

    return fetchJson(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });
  },

  // Generate formal complaint text
  generateComplaint: async (
    analysis: AnalysisOutput,
    location: { latitude: number; longitude: number; address: string }
  ): Promise<ComplaintData> => {
    return fetchJson(`${API_BASE}/generate-complaint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis, location }),
    });
  },

  // Duplicate detection check
  checkDuplicates: async (
    category: string,
    latitude: number,
    longitude: number,
    description: string
  ): Promise<DuplicateCheckResponse> => {
    return fetchJson(`${API_BASE}/duplicates/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, latitude, longitude, description }),
    });
  },

  // Log duplicate override/decision
  logDuplicateDecision: async (
    candidate_case_id: string,
    score: number,
    user_decision: 'ADDED_TO_EXISTING' | 'DIFFERENT_ISSUE'
  ): Promise<{ success: boolean }> => {
    return fetchJson(`${API_BASE}/duplicates/decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidate_case_id, score, user_decision }),
    });
  },

  // Create new case
  createCase: async (payload: {
    image_url?: string;
    analysis: AnalysisOutput;
    complaint_title: string;
    complaint_text_ai: string;
    complaint_text_final: string;
    latitude: number;
    longitude: number;
    address: string;
  }): Promise<{ case_id: string; id: string; complaint: ComplaintRecord }> => {
    return fetchJson(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Attach evidence to existing case
  addEvidenceToCase: async (
    caseId: string,
    file?: File,
    imageUrl?: string,
    note?: string
  ): Promise<{ success: boolean; case_id: string; report_count: number }> => {
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      if (note) formData.append('note', note);
      return fetchJson(`${API_BASE}/cases/${caseId}/evidence`, {
        method: 'POST',
        body: formData,
      });
    }

    return fetchJson(`${API_BASE}/cases/${caseId}/evidence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, note }),
    });
  },

  // Get cases list
  getCases: async (filters?: {
    status?: string;
    category?: string;
    severity?: string;
    q?: string;
    fields?: string;
  }): Promise<{ items: ComplaintRecord[]; total: number }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.q) params.append('q', filters.q);
    if (filters?.fields) params.append('fields', filters.fields);

    return fetchJson(`${API_BASE}/cases?${params.toString()}`);
  },

  // Get single case details
  getCase: async (caseId: string): Promise<{
    complaint: ComplaintRecord;
    evidence: any[];
    events: any[];
    resolutionChecks: any[];
  }> => {
    return fetchJson(`${API_BASE}/cases/${caseId}`);
  },

  // Dashboard Stats
  getStats: async (): Promise<CivicStats> => {
    return fetchJson(`${API_BASE}/stats`);
  },

  // Admin update status
  updateStatus: async (
    caseId: string,
    status: CaseStatus,
    adminPasscode: string,
    note?: string
  ): Promise<{ success: boolean; case_id: string; status: string }> => {
    return fetchJson(`${API_BASE}/cases/${caseId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminPasscode,
      },
      body: JSON.stringify({ status, note }),
    });
  },

  // Admin verify resolution
  verifyResolution: async (
    caseId: string,
    afterFile: File,
    adminPasscode: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append('after_image', afterFile);

    return fetchJson(`${API_BASE}/cases/${caseId}/verify-resolution`, {
      method: 'POST',
      headers: {
        'x-admin-key': adminPasscode,
      },
      body: formData,
    });
  },

  // Admin confirm resolution
  confirmResolution: async (
    caseId: string,
    adminPasscode: string,
    note?: string
  ): Promise<any> => {
    return fetchJson(`${API_BASE}/cases/${caseId}/confirm-resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminPasscode,
      },
      body: JSON.stringify({ note }),
    });
  },

  // Admin metrics
  getMetrics: async (adminPasscode: string): Promise<any> => {
    return fetchJson(`${API_BASE}/metrics`, {
      headers: {
        'x-admin-key': adminPasscode,
      },
    });
  },

  // Session metrics logging
  logSessionMetrics: async (timeSec: number, editRatio: number): Promise<void> => {
    try {
      await fetch(`${API_BASE}/metrics/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_to_submit_seconds: timeSec,
          complaint_edit_ratio: editRatio,
        }),
      });
    } catch {
      // quiet fail
    }
  },

  // Get curated municipal dataset samples
  getDatasetSamples: async (): Promise<{ status: string; total: number; samples: any[] }> => {
    return fetchJson(`${API_BASE}/datasets/samples`);
  },

  // User Profile & Civic ID API
  getUserProfile: async (civicId?: string): Promise<{
    user: {
      id: string;
      civic_id: string;
      name: string;
      email: string;
      verified: boolean;
      impact_points: number;
      created_at: string;
    };
    activity: {
      issues_reported: number;
      resolved: number;
      in_progress: number;
      impact_points: number;
    };
    saved_locations: Array<{
      id: string;
      label: 'Home' | 'College' | 'Workplace' | 'Other';
      address: string;
      latitude: number;
      longitude: number;
    }>;
    recent_reports: ComplaintRecord[];
  }> => {
    const url = civicId ? `${API_BASE}/user/profile?civic_id=${encodeURIComponent(civicId)}` : `${API_BASE}/user/profile`;
    return fetchJson(url);
  },

  // Get user reports
  getUserReports: async (civicId?: string): Promise<ComplaintRecord[]> => {
    const url = civicId ? `${API_BASE}/user/reports?civic_id=${encodeURIComponent(civicId)}` : `${API_BASE}/user/reports`;
    return fetchJson(url);
  },

  // Save location
  addSavedLocation: async (data: {
    civic_id?: string;
    label: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }): Promise<{
    id: string;
    label: 'Home' | 'College' | 'Workplace' | 'Other';
    address: string;
    latitude: number;
    longitude: number;
  }> => {
    return fetchJson(`${API_BASE}/user/saved-locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Track case by Case ID (differentiating Case ID from Civic ID)
  trackCase: async (caseId: string): Promise<{
    found: boolean;
    message?: string;
    data?: any;
  }> => {
    return fetchJson(`${API_BASE}/user/track/${encodeURIComponent(caseId)}`);
  },

  // Delete saved location
  deleteSavedLocation: async (locationId: string, civicId?: string): Promise<{ success: boolean }> => {
    const url = civicId
      ? `${API_BASE}/user/saved-locations/${encodeURIComponent(locationId)}?civic_id=${encodeURIComponent(civicId)}`
      : `${API_BASE}/user/saved-locations/${encodeURIComponent(locationId)}`;
    return fetchJson(url, { method: 'DELETE' });
  },

  // Update user profile
  updateUserProfile: async (data: {
    civic_id?: string;
    name?: string;
    email?: string;
  }): Promise<{ success: boolean; user: any }> => {
    return fetchJson(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Submit feedback
  submitFeedback: async (data: {
    civic_id?: string;
    rating: number;
    category: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> => {
    return fetchJson(`${API_BASE}/user/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },
};
