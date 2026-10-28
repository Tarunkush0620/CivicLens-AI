/**
 * Prompt version 1.0.0
 * CivicLens AI - Visual Duplicate Verification Prompt
 */
export const DUPLICATE_IMAGE_PROMPT_VERSION = 'v1.0.0';

export const DUPLICATE_IMAGE_PROMPT = `Do these two photographs depict the exact same physical civic defect or incident at the same geographic spot?

Compare physical morphology, landmarks, pavement markers, and surrounding environment.

Return JSON:
{
  "same_issue": "YES" | "NO" | "UNCERTAIN",
  "reason": "Brief 1-sentence factual reason based on visual evidence"
}`;
