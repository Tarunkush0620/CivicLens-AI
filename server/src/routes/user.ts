import { Router, Request, Response } from 'express';
import { db } from '../repositories/db.js';
import { logger } from '../utils/logger.js';

export const userRouter = Router();

/**
 * GET /api/user/profile
 * Returns the logged-in citizen profile with permanent Civic ID,
 * real stats (12 reported, 7 resolved, 3 in progress, 85 points),
 * saved locations, and recent complaints.
 */
userRouter.get('/profile', async (req: Request, res: Response) => {
  try {
    const civicId = (req.query.civic_id as string) || undefined;
    const profile = await db.getUserProfile(civicId);
    res.json(profile);
  } catch (error) {
    logger.error('Error fetching user profile', { error: String(error) });
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * GET /api/user/reports
 * Returns all complaints reported by this citizen's Civic ID.
 */
userRouter.get('/reports', async (req: Request, res: Response) => {
  try {
    const civicId = (req.query.civic_id as string) || undefined;
    const reports = await db.getUserReports(civicId);
    res.json(reports);
  } catch (error) {
    logger.error('Error fetching user reports', { error: String(error) });
    res.status(500).json({ error: 'Failed to fetch user reports' });
  }
});

/**
 * POST /api/user/saved-locations
 * Add a new saved location (Home, College, Workplace, Other)
 */
userRouter.post('/saved-locations', async (req: Request, res: Response) => {
  try {
    const { civic_id, label, address, latitude, longitude } = req.body;
    if (!label || !address) {
      return res.status(400).json({ error: 'Label and address are required' });
    }

    const saved = await db.addSavedLocation(civic_id || 'CIV-8K29-X4P7', {
      label,
      address,
      latitude: Number(latitude) || 28.6139,
      longitude: Number(longitude) || 77.2090,
    });
    res.status(201).json(saved);
  } catch (error) {
    logger.error('Error adding saved location', { error: String(error) });
    res.status(500).json({ error: 'Failed to save location' });
  }
});

/**
 * DELETE /api/user/saved-locations/:locationId
 * Remove a saved location
 */
userRouter.delete('/saved-locations/:locationId', async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const civicId = (req.query.civic_id as string) || 'CIV-8K29-X4P7';
    const success = await db.deleteSavedLocation(civicId, locationId);
    if (!success) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ success: true, message: 'Location deleted' });
  } catch (error) {
    logger.error('Error deleting saved location', { error: String(error) });
    res.status(500).json({ error: 'Failed to delete location' });
  }
});

/**
 * GET /api/user/track/:caseId
 * Direct lookup of an issue by Case ID (distinguishing Case ID from Civic ID)
 */
userRouter.get('/track/:caseId', async (req: Request, res: Response) => {
  try {
    const { caseId } = req.params;
    const result = await db.trackCaseById(caseId);
    if (!result) {
      return res.status(404).json({
        found: false,
        message: `No civic case found with Case ID: ${caseId}. Please ensure you are entering a valid incident Case ID (e.g. CASE-2026-00142), not a user Civic ID.`,
      });
    }
    res.json({
      found: true,
      data: result,
    });
  } catch (error) {
    logger.error('Error tracking case', { error: String(error) });
    res.status(500).json({ error: 'Failed to track case' });
  }
});

/**
 * POST /api/user/generate-civic-id
 * Generates a guaranteed unique Civic ID on the backend
 */
userRouter.post('/generate-civic-id', async (_req: Request, res: Response) => {
  try {
    const civicId = db.generateUniqueCivicId();
    res.json({ civic_id: civicId });
  } catch (error) {
    logger.error('Error generating Civic ID', { error: String(error) });
    res.status(500).json({ error: 'Failed to generate Civic ID' });
  }
});

/**
 * PUT /api/user/profile
 * Update user settings (Name, email, etc.)
 */
userRouter.put('/profile', async (req: Request, res: Response) => {
  try {
    const { civic_id, name, email } = req.body;
    const updated = await db.updateUserProfile(civic_id || 'CIV-8K29-X4P7', { name, email });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: updated });
  } catch (error) {
    logger.error('Error updating user profile', { error: String(error) });
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

/**
 * POST /api/user/feedback
 * Submit citizen feedback
 */
userRouter.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { civic_id, rating, category, message } = req.body;
    logger.info('Citizen feedback received', { civic_id, rating, category, message });
    res.json({
      success: true,
      message: 'Feedback received successfully. Thank you for helping improve CivicLens AI!',
    });
  } catch (error) {
    logger.error('Error submitting feedback', { error: String(error) });
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});
