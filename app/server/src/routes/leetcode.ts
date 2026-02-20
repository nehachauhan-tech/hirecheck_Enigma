
import express, { Response } from 'express';
import { LeetCodeService } from '../services/LeetCodeService';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();
const leetCodeService = new LeetCodeService();

// Get Daily Challenge
router.get('/daily', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const daily = await leetCodeService.getDailyChallenge();
        if (!daily) {
            return res.status(404).json({ error: 'Failed to fetch daily challenge' });
        }

        // Adapt to our frontend format
        const adapted = leetCodeService.adaptToInternalFormat(daily);
        res.json(adapted);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search/Filter Problems (Proxy)
router.get('/problems', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { tag, limit } = req.query;
    try {
        const problems = await leetCodeService.getProblemsByTag(tag as string || 'array', Number(limit) || 10);
        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Specific Problem Details
router.get('/problem/:titleSlug', authMiddleware, async (req: AuthRequest, res: Response) => {
    const { titleSlug } = req.params;
    try {
        const problem = await leetCodeService.getProblemDetails(titleSlug as string);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        const adapted = leetCodeService.adaptToInternalFormat(problem);
        res.json(adapted);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
