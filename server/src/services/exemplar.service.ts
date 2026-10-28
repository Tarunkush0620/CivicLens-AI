import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger.js';

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

export class ExemplarService {
  private static workspaceRoot = path.resolve(process.cwd(), '..');

  /**
   * Resolves the root of the Datasets folder
   */
  public static getDatasetsDir(): string {
    const candidate1 = path.resolve(process.cwd(), 'Datasets');
    if (fs.existsSync(candidate1)) return candidate1;
    const candidate2 = path.resolve(process.cwd(), '..', 'Datasets');
    if (fs.existsSync(candidate2)) return candidate2;
    return candidate1;
  }

  /**
   * Returns curated dataset samples from the 3 workspace datasets
   */
  public static getCuratedSamples(): DatasetSample[] {
    return [
      {
        id: 'sample-pothole-1',
        category: 'Pothole',
        title: 'Deep Asphalt Road Cavity with Sub-Base Damage',
        severity: 'HIGH',
        dataset_source: 'Urban Community Issues (Zenodo)',
        image_rel_path: 'Data_sets/pothole/images/1.jpg',
        image_url: '/api/datasets/raw/Data_sets/pothole/images/1.jpg',
        has_ground_truth: true,
        ground_truth_hazard: 'Tire blowout, two-wheeler skidding, and vehicular undercarriage damage',
        ground_truth_dept: 'Municipal Roads Department',
        description: 'Deep road cavity through the bituminous surface exposing stone sub-base.',
      },
      {
        id: 'sample-manhole-1',
        category: 'Open Manhole',
        title: 'Critical Life-Threatening Open Sewer Manhole',
        severity: 'CRITICAL',
        dataset_source: 'Urban Community Issues (Zenodo)',
        image_rel_path: 'Data_sets/open_manhole/images/1001.jpg',
        image_url: '/api/datasets/raw/Data_sets/open_manhole/images/1001.jpg',
        has_ground_truth: true,
        ground_truth_hazard: 'Immediate fatal fall risk for pedestrians and cyclists in pedestrian corridor',
        ground_truth_dept: 'Water Supply & Sewerage Department',
        description: 'Complete absence of heavy cast-iron circular utility cover with exposed vertical drop.',
      },
      {
        id: 'sample-cracks-1',
        category: 'Road Damage',
        title: 'Extensive Longitudinal & Alligator Pavement Cracking',
        severity: 'MEDIUM',
        dataset_source: 'Urban Community Issues (Zenodo)',
        image_rel_path: 'Data_sets/cracks/images/3001.jpg',
        image_url: '/api/datasets/raw/Data_sets/cracks/images/3001.jpg',
        has_ground_truth: true,
        ground_truth_hazard: 'Progressive water seepage accelerating structural sub-surface erosion',
        ground_truth_dept: 'Municipal Roads Department',
        description: 'Severe surface distress with interconnected fatigue crack networks across traffic lane.',
      },
      {
        id: 'sample-waste-1',
        category: 'Garbage',
        title: 'Overflowing Commercial Waste Dumpster',
        severity: 'MEDIUM',
        dataset_source: 'Urban Community Issues (Zenodo)',
        image_rel_path: 'Data_sets/waste_container/images/4001.jpg',
        image_url: '/api/datasets/raw/Data_sets/waste_container/images/4001.jpg',
        has_ground_truth: true,
        ground_truth_hazard: 'Vector disease proliferation, rodent attraction, and severe sidewalk blockage',
        ground_truth_dept: 'Sanitation / Solid Waste Management',
        description: 'Municipal waste container overflowing with uncollected mixed refuse onto public walkway.',
      },
      {
        id: 'sample-good-road-1',
        category: 'None detected',
        title: 'Negative Control: Smooth Intact Pavement (Good Road)',
        severity: 'NONE',
        dataset_source: 'Urban Community Issues (Negative Control)',
        image_rel_path: 'Data_sets/good_road/images/7001.jpg',
        image_url: '/api/datasets/raw/Data_sets/good_road/images/7001.jpg',
        has_ground_truth: true,
        ground_truth_hazard: 'None — Normal road condition with intact wearing course',
        ground_truth_dept: 'General Civic Grievance Cell',
        description: 'Clean, continuous asphalt roadway with no structural cavities or public hazards.',
      },
      {
        id: 'sample-qr4-pothole',
        category: 'Pothole',
        title: 'Water-Filled Monsoon Pothole with Edge Deterioration',
        severity: 'HIGH',
        dataset_source: 'Urban Civic Issues (QR4Change)',
        image_rel_path: 'Urban Civic Issues Image Dataset Potholes and Garb/pothole/1.jpg',
        image_url: '/api/datasets/raw/Urban Civic Issues Image Dataset Potholes and Garb/pothole/1.jpg',
        has_ground_truth: true,
        ground_truth_hazard: 'Hidden depth hazard for two-wheelers during precipitation',
        ground_truth_dept: 'Municipal Roads Department',
        description: 'Submerged pothole basin with loose gravel perimeter.',
      },
      {
        id: 'sample-qr4-garbage',
        category: 'Garbage',
        title: 'Roadside Municipal Refuse Accumulation',
        severity: 'MEDIUM',
        dataset_source: 'Urban Civic Issues (QR4Change)',
        image_rel_path: 'Urban Civic Issues Image Dataset Potholes and Garb/garbage/1.jpg',
        image_url: '/api/datasets/raw/Urban Civic Issues Image Dataset Potholes and Garb/garbage/1.jpg',
        has_ground_truth: true,
        ground_truth_hazard: 'Obstruction of pedestrian path and urban sanitation hazard',
        ground_truth_dept: 'Sanitation / Solid Waste Management',
        description: 'Scattered solid waste and plastic refuse piled along roadway shoulder.',
      },
      {
        id: 'sample-pothole-puddle',
        category: 'Pothole',
        title: 'Municipal Water Main Leakage Causing Pothole Flooding',
        severity: 'HIGH',
        dataset_source: 'CivicLens Field Evidence',
        image_rel_path: 'client/public/pothole-sample.jpg',
        image_url: '/pothole-sample.jpg',
        has_ground_truth: true,
        ground_truth_hazard: 'Causes high risk of vehicle damage and water contamination',
        ground_truth_dept: 'Municipal Roads Department',
        description: 'Asphalt cavity filled with standing water reflecting sky, severe surface disruption.',
      },
    ];
  }

  /**
   * Reads the image file buffer for a dataset sample
   */
  public static getSampleBuffer(relPath: string): { buffer: Buffer; mimeType: string } | null {
    const datasetsDir = this.getDatasetsDir();
    const candidatePath = path.resolve(datasetsDir, relPath);

    if (fs.existsSync(candidatePath)) {
      const buffer = fs.readFileSync(candidatePath);
      const ext = path.extname(candidatePath).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      return { buffer, mimeType };
    }

    // Check in client public
    const publicCandidate = path.resolve(process.cwd(), '..', relPath);
    if (fs.existsSync(publicCandidate)) {
      const buffer = fs.readFileSync(publicCandidate);
      const ext = path.extname(publicCandidate).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';
      return { buffer, mimeType };
    }

    logger.warn(`Dataset sample file not found: ${candidatePath}`);
    return null;
  }

  /**
   * Prepares few-shot multimodal contextual prompts from dataset exemplars
   */
  public static getFewShotContext(): string {
    return `EXEMPLAR CALIBRATION CRITERIA (Ground Truth Municipal Standard):
1. POTHOLE: Defined depression through asphalt surface binder with jagged borders, depth >5cm. (Severity: HIGH or CRITICAL if in fast lane; Dept: Municipal Roads Department; SLA: 24-48h).
2. OPEN_MANHOLE: Displaced, broken, or missing utility access cover over storm/sewer vault. (Severity: CRITICAL; Dept: Water Supply & Sewerage Department; SLA: Immediate emergency barricade <6h).
3. SURFACE_CRACKS: Longitudinal or interconnected alligator fissures without cavity perforation. (Severity: LOW to MEDIUM; Dept: Municipal Roads Department; SLA: 7-14 days).
4. GARBAGE / WASTE_CONTAINER: Spilled solid municipal refuse or overflowing container on public path. (Severity: MEDIUM; Dept: Sanitation / Solid Waste Management; SLA: 24h clearance).
5. GOOD_ROAD (NEGATIVE CONTROL): Smooth pavement surface, minor cosmetic tire marks without structural defect. Flag category as "None detected" with severity "LOW" or zero hazard.`;
  }
}
