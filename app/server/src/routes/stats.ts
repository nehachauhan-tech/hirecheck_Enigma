import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import Session from '../models/Session';
import TrainingProfile from '../models/TrainingProfile';

const router = express.Router();

// Get User Stats Overview
router.get('/overview', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const profile = await TrainingProfile.findOne({ userId });
        const sessions = await Session.find({ userId, endedAt: { $exists: true } });

        const totalInterviews = sessions.length;
        const marathons = sessions.filter(s => s.interviewMode === 'marathon').length;
        const sprints = sessions.filter(s => s.interviewMode === 'sprint').length;

        // Calculate real avg score from history
        const historyScores = profile?.history?.map(h => h.score) || [];
        const avgScore = historyScores.length > 0
            ? Math.round((historyScores.reduce((a, b) => a + b, 0) / historyScores.length) * 100)
            : 0;

        const strengths = profile?.history
            ?.filter(h => h.score > 0.8)
            .map(h => h.problemCategory)
            .filter((v, i, a) => a.indexOf(v) === i)
            .slice(0, 3) || [];

        const improving = profile?.weaknesses?.slice(0, 3) || [];

        res.json({
            totalInterviews,
            avgScore,
            marathons,
            sprints,
            xp: profile?.xp || 0,
            dailyStreak: profile?.dailyStreak || 0,
            strengths: strengths.length > 0 ? strengths : ['React', 'Node.js'],
            improving: improving.length > 0 ? improving : ['Algorithms', 'System Design']
        });
    } catch (error) {
        console.error('Stats overview error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Get recent activity
router.get('/recent', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const profile = await TrainingProfile.findOne({ userId: req.userId });
        if (!profile || !profile.history) return res.json([]);

        const history = profile.history || [];
        const recent = [...history]
            .sort((a, b) => {
                const dateA = a.date ? new Date(a.date).getTime() : 0;
                const dateB = b.date ? new Date(b.date).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 5)
            .map(h => ({
                id: h.sessionId ? h.sessionId.toString() : Math.random().toString(),
                date: h.date ? new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
                type: h.problemCategory || 'General',
                score: Math.round((h.score || 0) * 100),
                stars: (h.score || 0) > 0.9 ? 5 : ((h.score || 0) > 0.7 ? 4 : 3)
            }));

        res.json(recent);
    } catch (error) {
        console.error('Stats recent error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
});

// Get Skills
router.get('/skills', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const profile = await TrainingProfile.findOne({ userId: req.userId });
        const skillProgress = profile?.skillProgress || {};

        const skills = [
            { name: 'React.js', level: skillProgress['React.js'] || 50, trend: '+5%', color: '#61DAFB' },
            { name: 'Node/Express', level: skillProgress['Node/Express'] || 50, trend: '+3%', color: '#68A063' },
            { name: 'MongoDB', level: skillProgress['MongoDB'] || 50, trend: '0%', color: '#4DB33D' },
            { name: 'Algorithms', level: skillProgress['Algorithms'] || 30, trend: '-2%', color: '#FF6B6B' }
        ];
        res.json(skills);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

// Get Behavioral DNA
router.get('/dna', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const profile = await TrainingProfile.findOne({ userId: req.userId });
        res.json(profile?.behavioralDNA || {
            understanding: 50,
            strategy: 50,
            recovery: 50,
            adaptability: 50,
            communication: 50,
            optimization: 50,
            pressure: 50
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch behavioral DNA' });
    }
});

// Get Daily Challenge
router.get('/daily-challenge', authMiddleware, async (req: AuthRequest, res) => {
    // Mock daily challenge
    res.json({
        title: 'Build Real-Time Notification System',
        topics: ['WebSocket', 'React', 'Redis'],
        difficulty: 'Hard',
        time: '45 min',
        reward: '500 XP',
        badge: 'Real-Time Master'
    });
});

// Update Resume Context
router.post('/resume', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { resumeText } = req.body;
        if (!resumeText) {
            return res.status(400).json({ error: 'Resume text is required' });
        }

        await TrainingProfile.updateOne(
            { userId: req.userId },
            { $set: { resumeText, updatedAt: new Date() } },
            { upsert: true }
        );

        res.json({ success: true, message: 'Resume context updated' });
    } catch (error) {
        console.error('Resume update error:', error);
        res.status(500).json({ error: 'Failed to update resume' });
    }
});

// Get Resume Context
router.get('/resume', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const profile = await TrainingProfile.findOne({ userId: req.userId });
        res.json({ resumeText: profile?.resumeText || '' });
    } catch (error) {
        console.error('Resume fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch resume' });
    }
});

// Get Performance Trends
router.get('/trends', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const profile = await TrainingProfile.findOne({ userId: req.userId });
        if (!profile || !profile.history) {
            return res.json([]);
        }

        // Sort history by date
        const sortedHistory = [...profile.history].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Map to trend format
        const trends = sortedHistory.map(h => ({
            date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: Math.round(h.score * 100),
            topic: h.problemCategory
        }));

        res.json(trends);
    } catch (error) {
        console.error('Trends fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
});

// Get Activity Heatmap
router.get('/heatmap', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const profile = await TrainingProfile.findOne({ userId: req.userId });
        if (!profile || !profile.history) {
            return res.json({});
        }

        // Group by YYYY-MM-DD
        const activity: Record<string, number> = {};
        profile.history.forEach(h => {
            const date = new Date(h.date).toISOString().split('T')[0];
            activity[date] = (activity[date] || 0) + 1;
        });

        res.json(activity);
    } catch (error) {
        console.error('Heatmap fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch heatmap' });
    }
});

export default router;
