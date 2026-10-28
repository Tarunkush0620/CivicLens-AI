import { db } from '../repositories/db.js';
import { gemini } from '../integrations/gemini.js';
import { ImageService, ProcessedImage } from './image.service.js';
import { RESOLUTION_SYSTEM_PROMPT } from '../prompts/resolution.js';
import { ResolutionOutput, ResolutionOutputSchema } from '../schemas/resolution.schema.js';
import { CaseService } from './case.service.js';
import fs from 'fs';
import path from 'path';

export class ResolutionService {
  public static async verifyResolution(
    caseId: string,
    afterProcessedImage: ProcessedImage
  ): Promise<ResolutionOutput> {
    const complaint = await db.getComplaintByCaseId(caseId);
    if (!complaint) {
      throw new Error('CASE_NOT_FOUND');
    }

    // Prepare after-image part
    const afterPart = ImageService.toGeminiPart(afterProcessedImage.buffer, afterProcessedImage.mimeType);

    // Prepare before-image part
    let beforePart: any = null;
    try {
      const beforeFilename = path.basename(complaint.image_url);
      const beforeFilePath = path.resolve(process.cwd(), 'uploads', beforeFilename);
      if (fs.existsSync(beforeFilePath)) {
        const beforeBuffer = await fs.promises.readFile(beforeFilePath);
        beforePart = ImageService.toGeminiPart(beforeBuffer, 'image/jpeg');
      }
    } catch {
      // fallback if file not on disk
    }

    const images = beforePart ? [beforePart, afterPart] : [afterPart];

    const prompt = `BEFORE Image Reference:
- Original Case Category: ${complaint.category}
- Initial Evaluated Severity: ${complaint.severity}
- Initial Observed Defect: ${complaint.description}
- Department: ${complaint.department}

Evaluate the AFTER image against the original issue and determine if it appears resolved.`;

    const result = await gemini.generateJSON<ResolutionOutput>({
      prompt,
      systemInstruction: RESOLUTION_SYSTEM_PROMPT,
      images,
      schema: ResolutionOutputSchema,
      temperature: 0.2,
      stageName: 'resolution',
    });

    // Store resolution check record in DB
    await db.addResolutionCheck({
      complaint_id: complaint.id,
      case_id: caseId,
      after_image_url: afterProcessedImage.url,
      resolution_status: result.resolution_status,
      confidence: result.confidence,
      before_summary: result.before_summary,
      after_summary: result.after_summary,
      same_location_likelihood: result.same_location_likelihood,
      remaining_issues: result.remaining_issues || [],
      admin_confirmed: false,
    });

    return result;
  }

  public static async confirmResolution(caseId: string, note?: string) {
    const complaint = await db.getComplaintByCaseId(caseId);
    if (!complaint) {
      throw new Error('CASE_NOT_FOUND');
    }

    // Mark resolution check confirmed
    await db.confirmResolutionCheck(caseId);

    // Transition case to RESOLVED
    await CaseService.updateStatus(caseId, 'RESOLVED', note || 'Resolution verified by AI and confirmed by municipal administrator.');

    // Add resolution timeline event
    await db.addEvent({
      complaint_id: complaint.id,
      case_id: caseId,
      event_type: 'RESOLUTION_VERIFIED',
      title: 'Resolution Verified & Case Closed',
      note: note || 'After-repair photo verified. Case marked RESOLVED.',
      author: 'Municipal Administrator',
    });

    return db.getComplaintByCaseId(caseId);
  }
}
