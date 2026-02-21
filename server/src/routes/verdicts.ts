import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Verdict from '../models/Verdict';
import Session from '../models/Session';

const router = express.Router();

// Get verdict for session
router.get('/:sessionId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    
    // Verify session belongs to user
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const verdict = await Verdict.findOne({ sessionId }).sort({ createdAt: -1 });
    
    if (!verdict) {
      return res.status(404).json({ error: 'Verdict not found' });
    }

    res.json({
      verdictId: verdict._id,
      score: verdict.score,
      confidence: verdict.confidence,
      archetype: verdict.archetype,
      report: verdict.report,
      explanation: verdict.explanation,
      recommendations: verdict.recommendations,
      createdAt: verdict.createdAt
    });
  } catch (error) {
    console.error('Get verdict error:', error);
    res.status(500).json({ error: 'Failed to get verdict' });
  }
});

// Get user's verdict history
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    // Get all user's sessions
    const sessions = await Session.find({ userId: req.userId });
    const sessionIds = sessions.map(s => s._id);

    const verdicts = await Verdict.find({ sessionId: { $in: sessionIds } })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(verdicts.map(v => ({
      verdictId: v._id,
      sessionId: v.sessionId,
      score: v.score,
      confidence: v.confidence,
      archetype: v.archetype,
      createdAt: v.createdAt
    })));
  } catch (error) {
    console.error('Get verdicts error:', error);
    res.status(500).json({ error: 'Failed to get verdicts' });
  }
});

export default router;
