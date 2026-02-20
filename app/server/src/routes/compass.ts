import express from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { AIAdapter } from '../services/AIAdapter';
import { companyData } from '../data/company-dna';
import TrainingProfile from '../models/TrainingProfile';

const router = express.Router();
const aiAdapter = new AIAdapter();

// @route   GET /api/compass/dna
// @desc    Get all company DNA profiles
router.get('/dna', authMiddleware, (req, res) => {
    res.json(companyData);
});

// @route   POST /api/compass/audit
// @desc    Perform deep resume audit
router.post('/audit', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const { company, role } = req.body;
        const profile = await TrainingProfile.findOne({ userId: req.userId });

        if (!profile || !profile.resumeText) {
            return res.status(400).json({ error: 'No resume found. Please upload a resume first.' });
        }

        const auditResult = await aiAdapter.auditResumeAgainstCompany(profile.resumeText, company, role);
        res.json(auditResult);
    } catch (error: any) {
        console.error('Audit failed:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
