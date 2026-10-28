import { db } from '../repositories/db.js';

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

export class StatsService {
  private static cachedStats: CivicStats | null = null;
  private static lastCacheTime = 0;
  private static TTL = 10000; // 10 seconds

  public static async getStats(): Promise<CivicStats> {
    if (this.cachedStats && Date.now() - this.lastCacheTime < this.TTL) {
      return this.cachedStats;
    }

    const cases = await db.getAllComplaints();
    const total = cases.length;

    let open = 0;
    let in_progress = 0;
    let resolved = 0;
    let high_priority = 0;

    const severity_breakdown = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    const category_distribution: Record<string, number> = {};

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    let todayReported = 0;
    let todayResolved = 0;
    let totalResolutionHours = 0;
    let resolvedCountWithTime = 0;

    for (const c of cases) {
      // Status
      if (c.status === 'SUBMITTED' || c.status === 'UNDER_INSPECTION') open++;
      else if (c.status === 'IN_PROGRESS') in_progress++;
      else if (c.status === 'RESOLVED') resolved++;

      // Priority
      if (c.severity === 'CRITICAL' || c.severity === 'HIGH') high_priority++;

      // Severity breakdown
      const sevKey = c.severity.toLowerCase() as keyof typeof severity_breakdown;
      if (severity_breakdown[sevKey] !== undefined) {
        severity_breakdown[sevKey]++;
      }

      // Category breakdown
      category_distribution[c.category] = (category_distribution[c.category] || 0) + 1;

      // Today counts
      const createdDate = new Date(c.created_at);
      if (createdDate >= startOfToday) {
        todayReported++;
      }
      if (c.status === 'RESOLVED') {
        const updatedDate = new Date(c.updated_at);
        if (updatedDate >= startOfToday) {
          todayResolved++;
        }
        const diffHours = (updatedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
        if (diffHours > 0) {
          totalResolutionHours += diffHours;
          resolvedCountWithTime++;
        }
      }
    }

    const resolution_rate = total > 0 ? Number(((resolved / total) * 100).toFixed(1)) : 0;
    const avg_resolution_hours =
      resolvedCountWithTime > 0 ? Number((totalResolutionHours / resolvedCountWithTime).toFixed(1)) : 24.5;

    const stats: CivicStats = {
      total,
      open,
      in_progress,
      resolved,
      high_priority,
      resolution_rate,
      avg_resolution_hours,
      severity_breakdown,
      category_distribution,
      today: {
        reported: todayReported,
        resolved: todayResolved,
      },
    };

    this.cachedStats = stats;
    this.lastCacheTime = Date.now();

    return stats;
  }
}
