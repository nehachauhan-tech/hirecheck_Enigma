import express from 'express';
import Groq from 'groq-sdk';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/test-ai', authMiddleware, async (req, res) => {
    const results: any = {
        groq: { status: 'pending', message: 'Not tested' }
    };

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
        results.groq = { status: 'error', message: 'GROQ_API_KEY missing in server .env' };
    } else {
        try {
            const groq = new Groq({ apiKey: GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: 'Say "Working"' }],
                model: 'llama-3.1-8b-instant',
            });
            results.groq = { status: 'success', message: `Response: ${completion.choices[0]?.message?.content}` };
        } catch (error: any) {
            results.groq = { status: 'error', message: error.message };
        }
    }

    res.json(results);
});

export default router;
