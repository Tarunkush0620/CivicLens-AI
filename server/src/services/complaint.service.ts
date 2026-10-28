import { AnalysisOutput } from '../schemas/analysis.schema.js';
import { ComplaintOutput, ComplaintOutputSchema } from '../schemas/complaint.schema.js';
import { COMPLAINT_SYSTEM_PROMPT, COMPLAINT_PROMPT_VERSION } from '../prompts/complaint.js';
import { gemini } from '../integrations/gemini.js';

export class ComplaintService {
  public static async generateComplaint(
    analysis: AnalysisOutput,
    location: { latitude: number; longitude: number; address: string }
  ): Promise<{ complaint: ComplaintOutput; promptVersion: string }> {
    const prompt = `Structured Analysis Details:
- Issue Category: ${analysis.category}
- Evaluated Severity: ${analysis.severity}
- Visible Physical Description: ${analysis.description}
- Stated Hazard: ${analysis.hazard || 'Public obstruction and potential safety issue'}
- Assigned Department: ${analysis.department}
- Recommended Municipal Action: ${analysis.recommended_action}
- Key Reasons: ${analysis.severity_reasons.join('; ')}

Incident Location:
- Address / Landmark: ${location.address}
- Coordinates: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}

Draft the formal civic complaint based strictly on these facts.`;

    const result = await gemini.generateJSON<ComplaintOutput>({
      prompt,
      systemInstruction: COMPLAINT_SYSTEM_PROMPT,
      schema: ComplaintOutputSchema,
      temperature: 0.5,
      stageName: 'complaint',
    });

    const slaMap: Record<string, string> = {
      CRITICAL: '24 Hours (Immediate Emergency)',
      HIGH: '1 – 3 Days (High Priority)',
      MEDIUM: '3 – 5 Days (Routine Municipal)',
      LOW: '7 – 10 Days (Scheduled Maintenance)',
    };

    const materialsMap: Record<string, string[]> = {
      Pothole: ['Cold-mix asphalt bitumen', 'Mechanical plate compactor', 'High-visibility safety cones', 'Tack coat emulsion'],
      'Open Manhole': ['Reinforced composite manhole cover (600mm)', 'Reflective perimeter safety barricades', 'Heavy utility lifting tongs'],
      Garbage: ['Hydraulic compactor truck', 'Industrial disinfectant spray', 'Protective sanitary gloves and shovels'],
      'Road Damage': ['Asphalt milling machine', 'Hot-mix bitumen binder', 'Vibratory road roller'],
      'Broken Streetlight': ['Cherry-picker bucket crane', 'LED luminaire fixture (120W)', 'Waterproof insulated wiring harness'],
      'Water Leakage': ['Underground acoustic leak sensor', 'Replacement ductile iron pipe sleeve', 'Hydraulic excavator'],
    };

    const finalComplaint: ComplaintOutput = {
      ...result,
      responsible_department: result.responsible_department || analysis.department,
      target_sla: result.target_sla || slaMap[analysis.severity] || '1 – 3 Days',
      required_materials: result.required_materials && result.required_materials.length > 0
        ? result.required_materials
        : materialsMap[analysis.category] || ['Standard municipal inspection kit', 'Safety cones'],
      draft_letter: result.draft_letter || `To,
The Executive Engineer / Zonal Officer,
${analysis.department},
Municipal Corporation

Subject: Urgent Complaint Regarding ${result.title}

Respected Sir/Madam,

I wish to formally report a civic defect located at ${location.address} (Coordinates: ${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}).

Ground-level evidence verified by CivicLens AI indicates a ${analysis.severity} severity condition: ${analysis.description}. This presents a hazard: ${analysis.hazard}.

I request the concerned municipal maintenance team to inspect the site and initiate remedial action (${analysis.recommended_action}) within the stipulated SLA of ${slaMap[analysis.severity] || '3 days'}.

Sincerely,
Concerned Citizen & CivicLens Verification Network`,
    };

    return {
      complaint: finalComplaint,
      promptVersion: COMPLAINT_PROMPT_VERSION,
    };
  }
}
