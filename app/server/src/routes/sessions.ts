import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Session from '../models/Session';
import { InterviewEngine } from '../services/InterviewEngine';
import { SessionManager } from '../services/SessionManager';

const router = express.Router();
const interviewEngine = new InterviewEngine();
const sessionManager = new SessionManager();

// Create new session
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    console.log('[Sessions] Create session request received:', req.body);
    const { problemId, difficulty, persona, mode, targetTopic, marathonDifficulty, targetCompany, targetRole, experienceLevel } = req.body;

    // Automatically deactivate existing active sessions for this user
    const activeSession = await sessionManager.getActiveSession(req.userId!);
    if (activeSession) {
      console.log(`[Sessions] Deactivating existing session ${activeSession._id} for user ${req.userId}`);
      await interviewEngine.endSession(activeSession._id.toString());
    }

    const session = await interviewEngine.createSession(
      req.userId!,
      problemId,
      difficulty || 'medium',
      persona,
      mode,
      marathonDifficulty || 'intermediate',
      targetTopic,
      targetCompany,
      targetRole,
      experienceLevel
    );

    res.status(201).json({
      sessionId: session._id,
      state: session.state,
      timer: session.timer,
      difficulty: session.difficulty,
      problemId: session.problemId,
      interviewerPersona: session.interviewerPersona,
      interviewMode: session.interviewMode,
      marathonDifficulty: session.marathonDifficulty,
      problemQueue: session.problemQueue,
      currentProblemIndex: session.currentProblemIndex,
      currentRound: session.currentRound,
      totalRounds: session.totalRounds,
      metadata: session.metadata || {},
      chatHistory: session.chatHistory || []
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    res.status(500).json({ error: error.message || 'Failed to create session' });
  }
});

// Get session
router.get('/:sessionId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params as { sessionId: string };
    const session = await interviewEngine.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      sessionId: session._id,
      state: session.state,
      timer: session.timer,
      difficulty: session.difficulty,
      problemId: session.problemId,
      code: session.code,
      language: session.language,
      active: session.active,
      startedAt: session.startedAt,
      interviewMode: session.interviewMode,
      marathonDifficulty: session.marathonDifficulty,
      problemQueue: session.problemQueue,
      currentProblemIndex: session.currentProblemIndex,
      currentRound: session.currentRound,
      totalRounds: session.totalRounds,
      metadata: session.metadata || {},
      chatHistory: session.chatHistory || []
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

// Transition state
router.post('/:sessionId/transition', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params as { sessionId: string };
    const { newState } = req.body;

    const session = await interviewEngine.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await interviewEngine.transitionState(sessionId, newState);

    if (result.success) {
      res.json({ success: true, state: newState });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Transition error:', error);
    res.status(500).json({ error: 'Failed to transition state' });
  }
});

// Update code
router.patch('/:sessionId/code', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params as { sessionId: string };
    const { code } = req.body;

    const session = await interviewEngine.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await interviewEngine.updateCode(sessionId, code);

    res.json({ success: true });
  } catch (error) {
    console.error('Update code error:', error);
    res.status(500).json({ error: 'Failed to update code' });
  }
});

// Execute code
router.post('/:sessionId/execute', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params as { sessionId: string };
    const { code, language } = req.body;

    const session = await interviewEngine.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await interviewEngine.executeCode(code, language || 'javascript');

    res.json(result);
  } catch (error) {
    console.error('Execute code error:', error);
    res.status(500).json({ error: 'Failed to execute code' });
  }
});

// End session
router.post('/:sessionId/end', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params as { sessionId: string };

    const session = await interviewEngine.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await interviewEngine.endSession(sessionId);

    res.json({ success: true });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

// Get session history
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const sessions = await sessionManager.getSessionHistory(req.userId!, limit);

    res.json(sessions.map(s => ({
      sessionId: s._id,
      state: s.state,
      difficulty: s.difficulty,
      problemId: s.problemId,
      startedAt: s.startedAt,
      endedAt: s.endedAt,
      active: s.active
    })));
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

export default router;
