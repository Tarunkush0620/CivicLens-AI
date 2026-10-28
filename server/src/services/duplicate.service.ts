import { db, ComplaintRecord } from '../repositories/db.js';
import { distanceMeters } from '../utils/geo.js';
import { cosineSimilarity } from '../utils/cosine.js';
import { gemini } from '../integrations/gemini.js';
import { env } from '../config/env.js';

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

export interface DuplicateCheckResult {
  is_duplicate: boolean;
  candidates: DuplicateCandidate[];
}

export class DuplicateService {
  public static async checkDuplicates(
    category: string,
    latitude: number,
    longitude: number,
    description: string
  ): Promise<DuplicateCheckResult> {
    const allCases = await db.getAllComplaints();

    // Seven days ago cutoff for recently resolved issues
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Filter candidates
    const eligibleCases = allCases.filter((c) => {
      if (c.category !== category) return false;
      if (c.status === 'RESOLVED' && c.updated_at < sevenDaysAgo) return false;
      return true;
    });

    if (eligibleCases.length === 0) {
      return { is_duplicate: false, candidates: [] };
    }

    // 2. Generate embedding for current report description
    const newEmbedding = await gemini.embed(description || category);

    const radiusMeters = env.DUP_RADIUS_M;
    const threshold = env.DUP_SCORE_THRESHOLD;

    const scoredCandidates: DuplicateCandidate[] = [];

    for (const c of eligibleCases) {
      const dist = distanceMeters(latitude, longitude, c.latitude, c.longitude);
      if (dist <= radiusMeters) {
        const proximity = Math.max(0, 1 - dist / radiusMeters);
        const categoryMatch = 1.0;

        let similarity = 0.5;
        if (c.description_embedding && c.description_embedding.length > 0) {
          similarity = cosineSimilarity(newEmbedding, c.description_embedding);
        }

        // Multi-factor hybrid score
        const score = 0.5 * proximity + 0.2 * categoryMatch + 0.3 * similarity;

        if (score >= threshold) {
          scoredCandidates.push({
            case_id: c.case_id,
            category: c.category,
            severity: c.severity,
            status: c.status,
            distance_m: Math.round(dist),
            score: Number(score.toFixed(3)),
            created_at: c.created_at,
            report_count: c.report_count,
            image_url: c.image_url,
            address: c.address,
            description: c.description,
            complaint_title: c.complaint_title,
          });
        }
      }
    }

    // Sort descending by match score
    scoredCandidates.sort((a, b) => b.score - a.score);
    const topCandidates = scoredCandidates.slice(0, 3);

    return {
      is_duplicate: topCandidates.length > 0,
      candidates: topCandidates,
    };
  }
}
