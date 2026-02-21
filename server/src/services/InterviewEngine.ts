import mongoose from 'mongoose';
import Session, { ISession, SessionState } from '../models/Session';
import Snapshot from '../models/Snapshot';
import axios from 'axios';

interface StateTransition {
  from: SessionState[];
  to: SessionState;
  condition?: (session: ISession) => boolean;
}

const STATE_TRANSITIONS: Record<SessionState, StateTransition> = {
  'INIT': { from: [], to: 'INTRO' },
  'INTRO': { from: ['INIT'], to: 'ROUND_1' },
  'ROUND_1': { from: ['INTRO'], to: 'ROUND_EVAL' },
  'ROUND_2': { from: ['WAITING_FOR_GATE'], to: 'ROUND_EVAL' },
  'ROUND_3': { from: ['WAITING_FOR_GATE'], to: 'VERDICT' },
  'ROUND_EVAL': { from: ['ROUND_1', 'ROUND_2', 'ROUND_3', 'CODING'], to: 'WAITING_FOR_GATE' },
  'WAITING_FOR_GATE': { from: ['ROUND_EVAL'], to: 'ROUND_2' }, // logic handled in engine
  'TERMINATED': { from: ['ROUND_EVAL', 'WAITING_FOR_GATE', 'CODING'], to: 'VERDICT' },
  'THEORY': { from: ['INTRO'], to: 'PRACTICAL' },
  'PRACTICAL': { from: ['THEORY', 'REQUIREMENT', 'APPROACH', 'CODING', 'INTERRUPTION', 'CONSTRAINT', 'OPTIMIZATION'], to: 'REVIEW' },
  'REVIEW': { from: ['PRACTICAL', 'BEHAVIORAL', 'ANALYSIS'], to: 'VERDICT' },
  'REQUIREMENT': { from: ['INTRO'], to: 'APPROACH' },
  'APPROACH': { from: ['REQUIREMENT'], to: 'CODING' },
  'CODING': { from: ['APPROACH', 'INTERRUPTION', 'CONSTRAINT', 'ROUND_1', 'ROUND_2', 'ROUND_3'], to: 'OPTIMIZATION' },
  'INTERRUPTION': { from: ['CODING'], to: 'CODING' },
  'CONSTRAINT': { from: ['CODING', 'INTERRUPTION'], to: 'CODING' },
  'OPTIMIZATION': { from: ['CODING'], to: 'BEHAVIORAL' },
  'BEHAVIORAL': { from: ['OPTIMIZATION'], to: 'ANALYSIS' },
  'ANALYSIS': { from: ['BEHAVIORAL', 'CODING', 'OPTIMIZATION'], to: 'VERDICT' },
  'VERDICT': { from: ['ANALYSIS', 'REVIEW', 'TERMINATED', 'ROUND_EVAL'], to: 'TRAINING' },
  'TRAINING': { from: ['VERDICT'], to: 'ARCHIVED' },
  'ARCHIVED': { from: ['TRAINING', 'VERDICT'], to: 'ARCHIVED' }
};

import { problems } from '../routes/problems';
import { specialistProblems } from './specialist-problems';
import { companyData } from '../data/company-dna';

export class InterviewEngine {
  private activeSessions: Map<string, NodeJS.Timeout> = new Map();

  async createSession(
    userId: string,
    problemId: string,
    difficulty: 'easy' | 'medium' | 'hard',
    persona: 'Priya' | 'Arjun' | 'Vikram' | 'Karan' = 'Vikram',
    mode: 'marathon' | 'sprint' | 'debug' | 'review' | 'compass' | 'expert-sprint' = 'marathon',
    marathonDifficulty: 'easy' | 'intermediate' | 'hard' | 'advanced' = 'intermediate',
    targetTopic?: string,
    targetCompany?: string,
    targetRole?: string,
    experienceLevel?: string
  ): Promise<ISession> {
    console.log(`[InterviewEngine] Creating session: userId=${userId}, problemId=${problemId}, mode=${mode}, targetCompany=${targetCompany}`);

    // RELIABLE FIX: Use Mongoose registry lookup to avoid import cycles
    const TrainingProfile = mongoose.models['TrainingProfile'];

    if (mode === 'compass') {
      persona = 'Karan';
    }

    let problemQueue: string[] = [problemId];

    // --- COMPASS MODE LOGIC: Generate Expert Loops ---
    if (mode === 'compass' && targetCompany) {
      // Find company in DNA
      const company = Object.values(companyData).find(c =>
        c.name.toLowerCase() === targetCompany.toLowerCase() ||
        targetCompany.toLowerCase().includes(c.name.toLowerCase())
      );

      if (company && company.rounds && company.rounds.length > 0) {
        problemQueue = company.rounds;
        problemId = problemQueue[0];
        console.log(`[InterviewEngine] Initializing EXPERT COMPASS LOOP for ${company.name}: ${problemQueue.join(' -> ')}`);
      } else {
        // Fallback or Generic Loop
        problemId = 'compass-behavioral-intro';
        problemQueue = [problemId];
        console.log(`[InterviewEngine] No specific rounds found for ${targetCompany}. Using default loop.`);
      }
    } else if (mode === 'compass') {
      problemId = 'compass-behavioral-intro';
      problemQueue = [problemId];
      console.log(`[InterviewEngine] Compass mode active without targetCompany, using default intro.`);
    }

    // Determine Market-Lens Calibration Profile
    let targetCompanyContext: 'Startup' | 'Scale-up' | 'Enterprise' = 'Enterprise';
    if (targetCompany) {
      const company = Object.values(companyData).find(c =>
        c.name.toLowerCase() === targetCompany.toLowerCase() ||
        targetCompany.toLowerCase().includes(c.name.toLowerCase())
      );
      if (company) {
        if (company.category === 'Startup') targetCompanyContext = 'Startup';
        else if (company.category === 'Product MNC') targetCompanyContext = 'Scale-up';
        else targetCompanyContext = 'Enterprise';
      }
    }

    // Ensure the selected problem is in the main list
    const selectedProblem = specialistProblems.find(p => p.id === problemId);
    if (selectedProblem && !problems.find(p => p.id === problemId)) {
      problems.push(selectedProblem as any);
    }

    // --- RANDOM PROBLEM SELECTION ---
    if (problemId === 'random') {
      // Filter out specialist problems to avoid mixing modes unintentionally
      const standardProblems = problems.filter(p => !p.id.startsWith('debug-') && !p.id.startsWith('review-'));
      const random = standardProblems[Math.floor(Math.random() * standardProblems.length)];
      if (random) problemId = random.id;
    }

    let problem = problems.find(p => p.id === problemId);

    // Fallback: Check LeetCode Service if not found locally
    if (!problem) {
      // Check specialist problems first before going to LeetCode
      const specialist = specialistProblems.find(p => p.id === problemId);
      if (specialist) {
        problems.push(specialist as any);
        problem = specialist as any;
      }
    }

    if (!problem) {
      try {
        const { LeetCodeService } = await import('./LeetCodeService');
        const lcService = new LeetCodeService();
        const lcProblem = await lcService.getProblemDetails(problemId);
        if (lcProblem) {
          problem = lcService.adaptToInternalFormat(lcProblem);
        }
      } catch (err) {
        console.error('Failed to fetch from LeetCode:', err);
      }
    }

    if (!problem) throw new Error('Problem not found');

    if (mode === 'sprint' && targetTopic) {
      // Hybrid Mode: Overwrite generic problem with Specialist Problem
      let categoryKeyword = targetTopic;
      if (targetTopic === 'Node/Express') categoryKeyword = 'Node.js';

      const specialistProblem = problems.find(p => p.category === categoryKeyword || (p.category && p.category.includes(categoryKeyword)));

      if (specialistProblem) {
        // Use the specialist problem instead of the generic one
        problemId = specialistProblem.id;
        problemQueue = [problemId];
        console.log(`[InterviewEngine] Switched to Specialist Problem: ${problemId} for topic ${targetTopic}`);
      }
    }

    // Refresh problem reference in case ID changed
    problem = problems.find(p => p.id === problemId) || problem; // Use existing if updated, or keep fallback
    if (!problem) throw new Error('Problem not found'); // Should not happen if data is consistent

    if (mode === 'marathon') {
      // Smart problem selection based on difficulty mode
      let selectedProblems: typeof problems = [];

      // FRESHNESS ALGORITHM: Filter out seen problems
      if (TrainingProfile) {
        let profile = null;
        try {
          profile = await TrainingProfile.findOne({ userId });
        } catch (e) {
          console.warn('[InterviewEngine] Failed to load profile for history', e);
        }

        const seenProblemIds = new Set(profile?.history?.map((h: any) => h.problemId) || []);
        const availableProblems = problems.filter(p => !seenProblemIds.has(p.id) && p.id !== problemId);

        // Use filtered pool or fallback to full pool if exhausted
        const pool = availableProblems.length >= 2 ? availableProblems : problems.filter(p => p.id !== problemId);

        switch (marathonDifficulty) {
          case 'easy':
            selectedProblems = pool.filter(p => p.difficulty === 'easy').sort(() => 0.5 - Math.random()).slice(0, 2);
            break;
          case 'intermediate':
            selectedProblems = pool.filter(p => p.difficulty === 'medium').sort(() => 0.5 - Math.random()).slice(0, 2);
            break;
          case 'hard':
            const mediumProblems = pool.filter(p => p.difficulty === 'medium').sort(() => 0.5 - Math.random()).slice(0, 1);
            const hardProblem = pool.filter(p => p.difficulty === 'hard').sort(() => 0.5 - Math.random()).slice(0, 1);
            selectedProblems = [...mediumProblems, ...hardProblem];
            break;
          case 'advanced':
            selectedProblems = pool.filter(p => p.difficulty === 'hard').sort(() => 0.5 - Math.random()).slice(0, 2);
            break;
        }
      } else {
        // Fallback if TrainingProfile is missing
        const availableProblems = problems.filter(p => p.id !== problemId);
        const pool = availableProblems.length >= 2 ? availableProblems : problems.filter(p => p.id !== problemId);
        switch (marathonDifficulty) {
          case 'easy':
            selectedProblems = pool.filter(p => p.difficulty === 'easy').sort(() => 0.5 - Math.random()).slice(0, 2);
            break;
          case 'intermediate':
            selectedProblems = pool.filter(p => p.difficulty === 'medium').sort(() => 0.5 - Math.random()).slice(0, 2);
            break;
          case 'hard':
            selectedProblems = pool.filter(p => p.difficulty === 'medium').slice(0, 1).concat(pool.filter(p => p.difficulty === 'hard').slice(0, 1));
            break;
          case 'advanced':
            selectedProblems = pool.filter(p => p.difficulty === 'hard').sort(() => 0.5 - Math.random()).slice(0, 2);
            break;
        }
      }
      problemQueue = [problemId, ...selectedProblems.map(p => p.id)];
    } else if (mode === 'expert-sprint') {
      // 1 random Hard problem + 1 specialized challenge
      const pool = problems.filter(p => p.id !== problemId);
      const hardProblem = pool
        .filter(p => p.difficulty === 'hard')
        .sort(() => 0.5 - Math.random())[0];

      const specialist = specialistProblems
        .filter(p => p.difficulty.toLowerCase() === 'hard')
        .sort(() => 0.5 - Math.random())[0];

      if (hardProblem && specialist) {
        problemQueue = [problemId, hardProblem.id, specialist.id];
      } else {
        // Fallback
        problemQueue = [problemId, 'faang-retry-storm-diag'];
      }
      console.log(`[InterviewEngine] Initializing EXPERT SPRINT: ${problemQueue.join(' -> ')}`);
    }

    // Resume Context Injection
    let resumeContext = '';
    if (TrainingProfile) {
      try {
        const profile = await TrainingProfile.findOne({ userId });
        resumeContext = profile?.resumeText || '';
      } catch (e) {
        console.warn('[InterviewEngine] Failed to load resume context', e);
      }
    }

    const currentProblem = problems.find(p => p.id === problemQueue[0]);
    if (!currentProblem) throw new Error('Problem not found');

    // BLUEPRINT: BRIEFING DOSSIER (Level 200)
    // Start with an under-specified prompt if in expert mode (Karan)
    let initialPrompt = currentProblem.description;
    if (persona === 'Karan') {
      const constraints = (currentProblem as any).constraints?.join(' | ') || 'No explicit constraints provided.';

      // EXPERT: For Compass Mode, inject Company-specific Persona Skinning
      let companyContext = '';
      if (mode === 'compass' && targetCompany) {
        const company = Object.values(companyData).find(c =>
          c.name.toLowerCase() === targetCompany.toLowerCase() ||
          targetCompany.toLowerCase().includes(c.name.toLowerCase())
        );
        if (company) {
          companyContext = `\nINTERVIEW STYLE: ${company.interviewStyle}\nFOCUS AREAS: ${company.focusAreas.join(' | ')}`;
        }
      }

      initialPrompt = `[SECURITY BRIEFING DOSSIER] 
PROJECT: ${currentProblem.title}
DATA SEGMENT: ${currentProblem.category}${companyContext}
CONSTRAINTS: ${constraints}

I've delivered the briefing. This is a ${targetCompany || 'standard'} assessment. I need to see your technical frame first. How do you plan to address the constraints?`;
    }

    const session = new Session({
      userId,
      problemId: problemQueue[0],
      difficulty,
      interviewerPersona: persona,
      interviewMode: mode,
      state: 'INTRO',
      timer: 0,
      active: true,
      code: currentProblem.starterCode.javascript || '',
      language: 'javascript',
      marathonDifficulty: mode === 'marathon' ? marathonDifficulty : undefined,
      problemQueue,
      currentProblemIndex: 0,
      currentRound: 1,
      totalRounds: problemQueue.length,
      level: 200,
      roundHistory: [],
      roundScopedMemory: {
        lastSummary: '',
        activeRisks: [],
        probeHistory: []
      },
      startedAt: new Date(),
      lastHeartbeat: new Date(),
      metadata: {
        problemTitle: currentProblem.title,
        problemCategory: currentProblem.category || 'General',
        timeLimit: (currentProblem as any).timeLimit || 3600,
        targetTopic,
        targetCompany,
        targetRole,
        experienceLevel,
        resumeContext,
        targetCompanyContext
      },
      chatHistory: [
        {
          role: 'interviewer',
          content: initialPrompt,
          timestamp: new Date()
        }
      ]
    });

    await session.save();
    this.startTimer(session._id.toString());

    return session;
  }

  async transitionState(sessionId: string, newState: SessionState): Promise<{ success: boolean; error?: string }> {
    const session = await Session.findById(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const transition = STATE_TRANSITIONS[newState];
    if (!transition) {
      return { success: false, error: 'Invalid state transition' };
    }

    if (!transition.from.includes(session.state) && transition.from.length > 0) {
      return { success: false, error: `Cannot transition from ${session.state} to ${newState}` };
    }

    if (transition.condition && !transition.condition(session)) {
      return { success: false, error: 'Transition condition not met' };
    }

    session.state = newState;
    await session.save();

    // Create snapshot on state change
    await this.createSnapshot(sessionId);

    return { success: true };
  }

  async transitionLevel(sessionId: string, newLevel: 200 | 300 | 400 | 'SOS' | 'OUT'): Promise<{ success: boolean; error?: string }> {
    const session = await Session.findById(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    console.log(`[InterviewEngine] Transitioning level for session ${sessionId}: ${session.level} -> ${newLevel}`);
    session.level = newLevel;
    await session.save();

    return { success: true };
  }

  async getSession(sessionId: string): Promise<ISession | null> {
    return Session.findById(sessionId);
  }

  async updateCode(sessionId: string, code: string): Promise<void> {
    await Session.findByIdAndUpdate(sessionId, { code });
  }

  private startTimer(sessionId: string): void {
    const interval = setInterval(async () => {
      const session = await Session.findById(sessionId);
      if (!session || !session.active) {
        clearInterval(interval);
        this.activeSessions.delete(sessionId);
        return;
      }

      session.timer += 1;
      await session.save();
    }, 1000);

    this.activeSessions.set(sessionId, interval);
  }

  private async createSnapshot(sessionId: string): Promise<void> {
    const session = await Session.findById(sessionId);
    if (!session) return;

    const snapshot = new Snapshot({
      sessionId,
      code: session.code,
      cursor: { line: 0, column: 0 },
      signals: {},
      state: session.state,
      timestamp: new Date()
    });

    await snapshot.save();
  }

  async executeCode(code: string, language: string): Promise<any> {
    const JUDGE0_KEY = process.env.JUDGE0_KEY;

    // Use Mock Execution if No API Key is provided
    if (!JUDGE0_KEY || JUDGE0_KEY.trim() === '') {
      console.log('[InterviewEngine] No Judge0 Key found. Using mock execution.');
      return this.mockExecute(code, language);
    }

    try {
      // Judge0 API integration
      const JUDGE0_API = process.env.JUDGE0_API || 'https://judge0-ce.p.rapidapi.com';

      const languageMap: Record<string, number> = {
        'javascript': 63,
        'python': 71,
        'java': 62,
        'cpp': 54,
        'typescript': 74
      };

      const languageId = languageMap[language] || 63;

      const response = await axios.post(
        `${JUDGE0_API}/submissions`,
        {
          source_code: code,
          language_id: languageId,
          stdin: ''
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': JUDGE0_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          },
          timeout: 4000
        }
      );

      const token = response.data.token;

      // Poll for result
      let result;
      let attempts = 0;
      while (attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));

        const resultResponse = await axios.get(
          `${JUDGE0_API}/submissions/${token}`,
          {
            headers: {
              'X-RapidAPI-Key': JUDGE0_KEY,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
            }
          }
        );

        result = resultResponse.data;
        if (result.status.id > 2) break; // Not pending or processing
        attempts++;
      }

      return {
        status: result.status.description === 'Accepted' ? 'success' : 'error',
        output: result.stdout || '',
        error: result.stderr || result.compile_output || '',
        time: result.time,
        memory: result.memory
      };
    } catch (error) {
      console.error('Code execution error:', error);
      return {
        status: 'error',
        error: 'Execution service unavailable. Falling back to mock results.'
      };
    }
  }

  private mockExecute(code: string, language: string): any {
    // Basic heuristics for mock execution
    const hasSyntaxError = code.includes('const') && !code.includes('=');

    // Extract console.log content (basic)
    let output = '';
    const logMatches = code.matchAll(/console\.log\(([^)]+)\)/g);
    const logs = Array.from(logMatches).map(m => m[1].replace(/['"]/g, ''));

    if (logs.length > 0) {
      output = logs.join('\n') + '\n\n(Mock Output: Real execution requires Judge0)';
    } else {
      output = `> Execution Successful (Mock Mode)\n> Language: ${language}\n> Time: 0.04s\n\nNo output detected. Try console.log() to see results.`;
    }

    return {
      status: hasSyntaxError ? 'error' : 'success',
      output: hasSyntaxError ? '' : output,
      error: hasSyntaxError ? 'SyntaxError: Missing initializer in const declaration' : '',
      time: '0.042',
      memory: '2048',
      isMock: true
    };
  }

  async endSession(sessionId: string): Promise<void> {
    const interval = this.activeSessions.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.activeSessions.delete(sessionId);
    }

    await Session.findByIdAndUpdate(sessionId, {
      active: false,
      endedAt: new Date()
    });
  }
}
