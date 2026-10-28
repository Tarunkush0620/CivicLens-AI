const SAFE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generates collision-resistant civic Case IDs adhering strictly to specification:
 * CV-<YEAR>-<5 uppercase chars> (e.g. CV-2026-8F42A)
 */
export function generateCaseId(): string {
  const year = new Date().getFullYear();
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * SAFE_CHARS.length);
    code += SAFE_CHARS[randomIndex];
  }
  return `CV-${year}-${code}`;
}
