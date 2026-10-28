import { db } from '../src/repositories/db.js';
import { generateCaseId } from '../src/utils/caseId.js';
import { gemini } from '../src/integrations/gemini.js';
import { logger } from '../src/utils/logger.js';

const DEMO_CASES = [
  {
    category: 'Pothole',
    severity: 'HIGH',
    confidence: 0.94,
    description: 'Deep road surface crater (approx 12cm depth) located in active vehicle lane on Alpha 1 commercial road.',
    hazard: 'High risk of vehicular tyre rupture, vehicle diversion, and acute two-wheeler skid accidents.',
    department: 'Municipal Roads Department',
    urgency: 'IMMEDIATE',
    recommended_action: 'Perform rapid asphalt patching, level surface, and inspect adjacent subgrade.',
    severity_reasons: [
      'Cavity depth exceeds 10 cm in active driving lane',
      'Located directly in high-speed corridor',
      'Water pooling in base causing accelerated pavement disintegration',
      'Significant hazard to nocturnal motorcycle traffic',
    ],
    box_2d: [380, 240, 720, 760],
    road_type: 'Main commercial corridor',
    complaint_title: 'Severe Road Pothole Obstructing Traffic and Creating High Accident Hazard',
    complaint_text_ai:
      'A deep and dangerous road pothole has been identified at Alpha 1 Commercial Belt, Greater Noida. The cavity lies in the active traffic path and creates acute risk for two-wheelers and passenger vehicles. Immediate municipal inspection and asphalt resurfacing are urgently requested.',
    complaint_text_final:
      'A deep and dangerous road pothole has been identified at Alpha 1 Commercial Belt, Greater Noida. The cavity lies in the active traffic path and creates acute risk for two-wheelers and passenger vehicles. Immediate municipal inspection and asphalt resurfacing are urgently requested.',
    latitude: 28.4744,
    longitude: 77.504,
    address: 'Alpha 1 Commercial Belt, Greater Noida, Uttar Pradesh',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    status: 'IN_PROGRESS',
    report_count: 5,
    events: [
      {
        event_type: 'EVIDENCE_SUBMITTED',
        title: 'Evidence Submitted',
        note: 'Citizen captured photograph and confirmed GPS coordinates.',
        author: 'Citizen Reporter',
      },
      {
        event_type: 'AI_ANALYSIS_COMPLETED',
        title: 'AI Analysis Completed',
        note: 'Gemini Vision detected Pothole (HIGH severity, 94% confidence).',
        author: 'CivicLens AI',
      },
      {
        event_type: 'SUBMITTED_TO_DEPARTMENT',
        title: 'Dispatched to Municipal Roads Department',
        note: 'Grievance ticket registered under Work Order #GN-RDS-4819.',
        author: 'System Dispatcher',
      },
      {
        event_type: 'EVIDENCE_ADDED',
        title: '4 Additional Citizen Reports Merged',
        note: 'Corroborating photos attached by 4 nearby residents.',
        author: 'Citizen Contributors',
      },
      {
        event_type: 'STATUS_CHANGED',
        title: 'Repair Crew Assigned',
        note: 'Municipal road engineering crew dispatched with cold-mix asphalt.',
        author: 'Road Inspector Sharma',
      },
    ],
  },
  {
    category: 'Garbage',
    severity: 'MEDIUM',
    confidence: 0.91,
    description: 'Overflowing community waste bin with solid waste spilling onto pedestrian pavement.',
    hazard: 'Stagnant foul odor, vector breeding grounds, and complete pedestrian sidewalk obstruction.',
    department: 'Sanitation / Solid Waste Management',
    urgency: 'SOON',
    recommended_action: 'Deploy compactor truck, clean sidewalk perimeter, and place additional secondary bin.',
    severity_reasons: [
      'Uncollected solid waste overflowing for >48 hours',
      'Forcing pedestrians into active motor roadway',
      'Pest and stray animal gathering risk',
    ],
    box_2d: [280, 180, 820, 840],
    road_type: 'Residential sector avenue',
    complaint_title: 'Overflowing Garbage Bin Blocking Pedestrian Walkway in Sector Beta 2',
    complaint_text_ai:
      'Solid municipal waste is overflowing at Sector Beta 2 central market entrance, Greater Noida. The debris blocks the footpath and creates sanitary and health concerns. Timely clearing by sanitation vehicles is requested.',
    complaint_text_final:
      'Solid municipal waste is overflowing at Sector Beta 2 central market entrance, Greater Noida. The debris blocks the footpath and creates sanitary and health concerns. Timely clearing by sanitation vehicles is requested.',
    latitude: 28.4682,
    longitude: 77.4981,
    address: 'Near Beta 2 Market, Greater Noida, Uttar Pradesh',
    image_url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
    status: 'SUBMITTED',
    report_count: 2,
    events: [
      {
        event_type: 'EVIDENCE_SUBMITTED',
        title: 'Evidence Submitted',
        note: 'Citizen captured photograph of overflowing dumpster.',
        author: 'Citizen Reporter',
      },
      {
        event_type: 'AI_ANALYSIS_COMPLETED',
        title: 'AI Analysis Completed',
        note: 'Gemini categorized issue as Garbage (MEDIUM severity, 91% confidence).',
        author: 'CivicLens AI',
      },
    ],
  },
  {
    category: 'Broken Streetlight',
    severity: 'HIGH',
    confidence: 0.96,
    description: 'LED street luminaire fixture broken and hanging loose from municipal pole with exposed cabling.',
    hazard: 'Complete black-out zone on curving road; potential electrocution hazard from dangling cable.',
    department: 'Electricity / Street Lighting Department',
    urgency: 'URGENT',
    recommended_action: 'Isolate circuit, secure luminaire fixture, replace housing, and restore lighting.',
    severity_reasons: [
      'Luminaire fixture structurally detached and suspended',
      'Exposed wiring reachable by high vehicles',
      'Severe blind spot created on unlit curve',
    ],
    box_2d: [120, 390, 580, 610],
    road_type: 'Sector perimeter road',
    complaint_title: 'Dangerous Dangling Streetlight Fixture with Exposed Wiring',
    complaint_text_ai:
      'A damaged streetlight luminaire fixture is dangling by electrical cables on the Sector Gamma 1 road in Greater Noida. The structural failure causes a dark zone and severe safety risk. Urgent electrical inspection and fixture replacement are requested.',
    complaint_text_final:
      'A damaged streetlight luminaire fixture is dangling by electrical cables on the Sector Gamma 1 road in Greater Noida. The structural failure causes a dark zone and severe safety risk. Urgent electrical inspection and fixture replacement are requested.',
    latitude: 28.4891,
    longitude: 77.5123,
    address: 'Sector Gamma 1 Perimeter Road, Greater Noida, Uttar Pradesh',
    image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    status: 'UNDER_INSPECTION',
    report_count: 1,
    events: [
      {
        event_type: 'EVIDENCE_SUBMITTED',
        title: 'Evidence Submitted',
        note: 'Report filed with photo evidence.',
        author: 'Citizen Reporter',
      },
      {
        event_type: 'AI_ANALYSIS_COMPLETED',
        title: 'AI Analysis Completed',
        note: 'Gemini flagged as Broken Streetlight with electrical hazard risk.',
        author: 'CivicLens AI',
      },
      {
        event_type: 'STATUS_CHANGED',
        title: 'Electrical Inspection Scheduled',
        note: 'Lineman unit notified for urgent bucket-truck dispatch.',
        author: 'Electrical JE Patel',
      },
    ],
  },
  {
    category: 'Open Manhole',
    severity: 'CRITICAL',
    confidence: 0.98,
    description: 'Cast-iron sewer manhole lid completely missing on busy pedestrian and cyclist pathway.',
    hazard: 'Extreme life-threatening fall risk for pedestrians, especially children, and catastrophic bicycle falls.',
    department: 'Water Supply & Sewerage Department',
    urgency: 'IMMEDIATE',
    recommended_action: 'Place immediate high-visibility barricade and install reinforced composite manhole cover.',
    severity_reasons: [
      'Uncovered 80cm diameter vertical fall drop directly into storm sewer',
      'Zero warning signage or physical barrier installed',
      'Located 2 meters from public bus stop queue',
      'High foot traffic zone during morning and evening rush',
    ],
    box_2d: [420, 320, 780, 710],
    road_type: 'Public transit bus concourse',
    complaint_title: 'Critical Hazard: Open Uncovered Sewer Manhole Near Bus Terminal',
    complaint_text_ai:
      'A hazardous open sewer manhole with no protective cover has been reported near Pari Chowk Transit Stop, Greater Noida. This creates an immediate, life-threatening danger to commuters and pedestrians. Immediate emergency barricading and cover replacement are demanded.',
    complaint_text_final:
      'A hazardous open sewer manhole with no protective cover has been reported near Pari Chowk Transit Stop, Greater Noida. This creates an immediate, life-threatening danger to commuters and pedestrians. Immediate emergency barricading and cover replacement are demanded.',
    latitude: 28.4628,
    longitude: 77.5147,
    address: 'Pari Chowk Junction Concourse, Greater Noida, Uttar Pradesh',
    image_url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    status: 'IN_PROGRESS',
    report_count: 8,
    events: [
      {
        event_type: 'EVIDENCE_SUBMITTED',
        title: 'Evidence Submitted',
        note: 'Emergency report logged by citizen.',
        author: 'Citizen Reporter',
      },
      {
        event_type: 'AI_ANALYSIS_COMPLETED',
        title: 'AI Analysis Completed - Critical Flag',
        note: 'Gemini detected Open Manhole with CRITICAL severity rating.',
        author: 'CivicLens AI',
      },
      {
        event_type: 'STATUS_CHANGED',
        title: 'Emergency Barricade Deployed',
        note: 'Rapid response unit placed warning drums and cones.',
        author: 'Quick Response Team',
      },
    ],
  },
  {
    category: 'Water Leakage',
    severity: 'MEDIUM',
    confidence: 0.92,
    description: 'Underground municipal water pipeline breach leaking clean drinking water across roadway.',
    hazard: 'Substantial clean water wastage and gradual softening of pavement asphalt subgrade.',
    department: 'Water Supply & Sewerage Department',
    urgency: 'SOON',
    recommended_action: 'Isolate main valve, excavate leaking joint, replace gasket, and backfill.',
    severity_reasons: [
      'Pressurized potable water flooding across 25 meters of road',
      'Water ponding creating hydroplaning risk for motorists',
      'Subgrade erosion under newly surfaced road',
    ],
    box_2d: [350, 200, 750, 790],
    road_type: 'Sector connecting boulevard',
    complaint_title: 'Municipal Water Main Leakage Causing Road Flooding in Delta 1',
    complaint_text_ai:
      'A municipal water supply line has burst on Delta 1 Sector Main Road, Greater Noida, discharging continuous pressurized water. This is wasting potable water and undermining the road pavement. Immediate line shutdown and pipeline repair are requested.',
    complaint_text_final:
      'A municipal water supply line has burst on Delta 1 Sector Main Road, Greater Noida, discharging continuous pressurized water. This is wasting potable water and undermining the road pavement. Immediate line shutdown and pipeline repair are requested.',
    latitude: 28.4815,
    longitude: 77.5195,
    address: 'Delta 1 Sector Main Road, Greater Noida, Uttar Pradesh',
    image_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    status: 'RESOLVED',
    report_count: 3,
    events: [
      {
        event_type: 'EVIDENCE_SUBMITTED',
        title: 'Evidence Submitted',
        note: 'Citizen uploaded photo of street flooding.',
        author: 'Citizen Reporter',
      },
      {
        event_type: 'AI_ANALYSIS_COMPLETED',
        title: 'AI Analysis Completed',
        note: 'Gemini detected Water Leakage (MEDIUM severity).',
        author: 'CivicLens AI',
      },
      {
        event_type: 'STATUS_CHANGED',
        title: 'Repair Completed',
        note: 'Damaged 4-inch pipe sleeve repaired and pressure test passed.',
        author: 'Water Works Eng. Singh',
      },
      {
        event_type: 'RESOLUTION_VERIFIED',
        title: 'Resolution Verified by AI',
        note: 'After-repair photo verified (Likely Resolved, 95% confidence).',
        author: 'Municipal Administrator',
      },
    ],
  },
];

async function seed() {
  logger.info('Starting CivicLens database seed...');
  await db.clearAll();

  for (const item of DEMO_CASES) {
    const caseId = generateCaseId();
    const embedding = await gemini.embed(item.description);

    const complaint = await db.createComplaint({
      case_id: caseId,
      image_url: item.image_url,
      category: item.category,
      severity: item.severity,
      confidence: item.confidence,
      description: item.description,
      hazard: item.hazard,
      department: item.department,
      urgency: item.urgency,
      recommended_action: item.recommended_action,
      severity_reasons: item.severity_reasons,
      contains_people_or_plates: false,
      box_2d: item.box_2d,
      road_type: item.road_type,
      complaint_title: item.complaint_title,
      complaint_text_ai: item.complaint_text_ai,
      complaint_text_final: item.complaint_text_final,
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      description_embedding: embedding,
      status: item.status,
      report_count: item.report_count,
    });

    await db.addEvidence({
      complaint_id: complaint.id,
      case_id: caseId,
      image_url: item.image_url,
      kind: 'ORIGINAL',
      note: 'Initial citizen photo evidence (Demo Data)',
    });

    for (const evt of item.events) {
      await db.addEvent({
        complaint_id: complaint.id,
        case_id: caseId,
        event_type: evt.event_type,
        title: evt.title,
        note: evt.note,
        author: evt.author,
      });
    }

    if (item.status === 'RESOLVED') {
      await db.addResolutionCheck({
        complaint_id: complaint.id,
        case_id: caseId,
        after_image_url: item.image_url,
        resolution_status: 'LIKELY_RESOLVED',
        confidence: 0.95,
        before_summary: item.description,
        after_summary: 'Issue thoroughly inspected and successfully rectified.',
        same_location_likelihood: 'HIGH',
        remaining_issues: [],
        admin_confirmed: true,
      });
    }

    logger.info(`Seeded case: ${caseId} (${item.category} - ${item.severity})`);
  }

  // Seed sample session timing metrics
  await db.logSessionMetric(42.3, 0.08);
  await db.logSessionMetric(35.1, 0.15);
  await db.logSessionMetric(51.8, 0.22);
  await db.logSessionMetric(29.4, 0.04);
  await db.logSessionMetric(38.0, 0.11);

  logger.info('CivicLens database seed completed successfully!');
}

seed().catch((err) => {
  logger.error('Failed to seed database', { error: String(err) });
  process.exit(1);
});
