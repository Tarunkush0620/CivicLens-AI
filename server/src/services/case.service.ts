import { db, ComplaintRecord } from '../repositories/db.js';
import { generateCaseId } from '../utils/caseId.js';
import { gemini } from '../integrations/gemini.js';
import { CreateCaseRequest } from '../schemas/case.schema.js';

export class CaseService {
  public static async createCase(req: CreateCaseRequest): Promise<ComplaintRecord> {
    // Generate unique collision-safe Case ID
    let caseId = generateCaseId();
    let existing = await db.getComplaintByCaseId(caseId);
    while (existing) {
      caseId = generateCaseId();
      existing = await db.getComplaintByCaseId(caseId);
    }

    // Embed description for future duplicate checks
    const embedding = await gemini.embed(req.analysis.description);

    const imageUrl = req.image_url || '/uploads/default-evidence.jpg';

    // 1. Insert Complaint Record
    const complaint = await db.createComplaint({
      case_id: caseId,
      image_url: imageUrl,
      category: req.analysis.category,
      severity: req.analysis.severity,
      confidence: req.analysis.confidence,
      description: req.analysis.description,
      hazard: req.analysis.hazard || 'None identified',
      department: req.analysis.department,
      urgency: req.analysis.urgency,
      recommended_action: req.analysis.recommended_action,
      severity_reasons: req.analysis.severity_reasons,
      contains_people_or_plates: req.analysis.contains_people_or_plates,
      box_2d: req.analysis.box_2d || null,
      road_type: req.analysis.road_type,
      complaint_title: req.complaint_title,
      complaint_text_ai: req.complaint_text_ai,
      complaint_text_final: req.complaint_text_final,
      latitude: req.latitude,
      longitude: req.longitude,
      address: req.address,
      description_embedding: embedding,
      status: 'SUBMITTED',
      report_count: 1,
    });

    // 2. Attach Primary Evidence
    await db.addEvidence({
      complaint_id: complaint.id,
      case_id: caseId,
      image_url: imageUrl,
      kind: 'ORIGINAL',
      note: 'Initial citizen photo evidence',
    });

    // 3. Populate Initial Vertical Timeline Events
    await db.addEvent({
      complaint_id: complaint.id,
      case_id: caseId,
      event_type: 'EVIDENCE_SUBMITTED',
      title: 'Evidence Submitted',
      note: `Original photo and GPS coordinates confirmed (${req.address})`,
      author: 'Citizen Reporter',
    });

    await db.addEvent({
      complaint_id: complaint.id,
      case_id: caseId,
      event_type: 'AI_ANALYSIS_COMPLETED',
      title: 'AI Analysis Completed',
      note: `Gemini classified as ${req.analysis.category} (${req.analysis.severity} severity) with ${(req.analysis.confidence * 100).toFixed(0)}% confidence`,
      author: 'CivicLens AI',
    });

    await db.addEvent({
      complaint_id: complaint.id,
      case_id: caseId,
      event_type: 'SUBMITTED_TO_DEPARTMENT',
      title: `Dispatched to ${req.analysis.department}`,
      note: `Formal civic grievance generated and routed for inspection`,
      author: 'System Dispatcher',
    });

    return complaint;
  }

  public static async addAdditionalEvidence(
    caseId: string,
    imageUrl: string,
    note?: string
  ): Promise<ComplaintRecord | null> {
    const complaint = await db.getComplaintByCaseId(caseId);
    if (!complaint) return null;

    // Attach additional evidence
    await db.addEvidence({
      complaint_id: complaint.id,
      case_id: caseId,
      image_url: imageUrl,
      kind: 'ADDITIONAL',
      note: note || 'Additional citizen corroborating photo',
    });

    // Increment count
    await db.incrementReportCount(caseId);

    // Add timeline event
    await db.addEvent({
      complaint_id: complaint.id,
      case_id: caseId,
      event_type: 'EVIDENCE_ADDED',
      title: 'Corroborating Evidence Added',
      note: `Citizen merged evidence with this active report. Total reports: ${complaint.report_count + 1}`,
      author: 'Citizen Contributor',
    });

    return db.getComplaintByCaseId(caseId);
  }

  public static async getCaseFullDetails(caseId: string) {
    const complaint = await db.getComplaintByCaseId(caseId);
    if (!complaint) return null;

    const evidence = await db.getEvidenceForCase(caseId);
    const events = await db.getEventsForCase(caseId);
    const resolutionChecks = await db.getResolutionChecksForCase(caseId);

    return {
      complaint,
      evidence,
      events,
      resolutionChecks,
    };
  }

  public static async updateStatus(caseId: string, status: string, note?: string, author = 'Municipal Administrator') {
    const complaint = await db.getComplaintByCaseId(caseId);
    if (!complaint) return null;

    const updated = await db.updateComplaintStatus(caseId, status);

    const friendlyTitleMap: Record<string, string> = {
      UNDER_INSPECTION: 'Municipal Inspection Scheduled',
      IN_PROGRESS: 'Work Crew Deployed & Repair in Progress',
      RESOLVED: 'Civic Defect Marked Resolved',
      REOPENED: 'Case Reopened for Further Remediation',
      SUBMITTED: 'Case Reset to Submitted',
    };

    await db.addEvent({
      complaint_id: complaint.id,
      case_id: caseId,
      event_type: 'STATUS_CHANGED',
      title: friendlyTitleMap[status] || `Status updated to ${status}`,
      note: note || `Official status transition executed by ${author}`,
      author,
    });

    return updated;
  }
}
