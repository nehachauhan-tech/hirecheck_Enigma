import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import { InterviewEngine } from './services/InterviewEngine';
import { MemoryManager } from './services/MemoryManager';
import { QuestionDeliveryEngine } from './services/QuestionDeliveryEngine';
import { AlgorithmicPersona } from './services/AlgorithmicPersona';
import { InterruptionEngine } from './services/InterruptionEngine';
import { SignalResolver } from './services/SignalResolver';
import { NextMoveEngine } from './services/NextMoveEngine';
import { BehavioralDrift } from './services/BehavioralDrift';
import { SignalAnalyzer } from './services/SignalAnalyzer';
import { VectorMemory } from './services/VectorMemory';
import { RedTeamEngine } from './services/RedTeamEngine';
import { VerdictEngine } from './services/VerdictEngine';
import { SessionManager } from './services/SessionManager';
import { AIAdapter } from './services/AIAdapter';
import { AdaptivePressureEngine } from './services/AdaptivePressureEngine';
import { AntiCheatEngine } from './services/AntiCheatEngine';
import TrainingProfile from './models/TrainingProfile';
import Session from './models/Session';
import { problems } from './routes/problems';
import leetCodeRoutes from './routes/leetcode';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/leetcode', leetCodeRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hirecheck')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
import './models/User';
import './models/Session';
import './models/Snapshot';
import './models/Signal';
import './models/Verdict';
import './models/TrainingProfile';

// Services
const interviewEngine = new InterviewEngine();
const signalAnalyzer = new SignalAnalyzer();
const verdictEngine = new VerdictEngine();
const sessionManager = new SessionManager();
const aiAdapter = new AIAdapter();
const pressureEngine = new AdaptivePressureEngine();
const antiCheatEngine = new AntiCheatEngine();

// Helper for Proactive AI Messages
async function sendProactiveMessage(socket: any, sessionId: string, currentCode?: string) {
  try {
    const session = await Session.findById(sessionId);
    if (!session) return;

    const problem = problems.find((p: any) => p.id === session.problemId);
    if (!problem) return;

    const profile = await TrainingProfile.findOne({ userId: session.userId });

    // EXPERT: Resolve the previous signal before making the next move
    const activeSignalId = (session.metadata as any).activeSignal;
    if (activeSignalId) {
      const metrics = signalAnalyzer.getMetrics(sessionId);
      // We assume stability for proactive triggers unless panic is detected
      const resolvedState = SignalResolver.resolve({ id: activeSignalId } as any, metrics);
      QuestionDeliveryEngine.resolveSignal(sessionId, activeSignalId, resolvedState);
    }

    // EXPERT: Fetch clinical intent for the next question
    const nextIntent = QuestionDeliveryEngine.getNextQuestionIntent(session);

    const context = {
      state: session.state,
      code: currentCode || session.code,
      previousMessages: session.chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`),
      behavioralMetrics: signalAnalyzer.getMetrics(sessionId),
      persona: session.interviewerPersona as any,
      mode: session.interviewMode as any,
      resumeText: profile?.resumeText,
      emotionalState: signalAnalyzer.getEmotionalContext(sessionId),
      roundScopedMemory: session.roundScopedMemory,
      probeIntent: nextIntent?.intent,
      level: session.level as any,
      targetCompany: (session.metadata as any).targetCompany,
      targetRole: (session.metadata as any).targetRole,
      experienceLevel: (session.metadata as any).experienceLevel,
      probingStage: (session.metadata as any).probingStage || 1,
      sessionId
    } as any;

    const aiResponse = await aiAdapter.generateInterviewerMessage(context, {
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      category: problem.category
    });

    // AI Response Sanitization (Length Control)
    let finalMessage = aiResponse.message;

    // EXPERT: Optimal Arousal Scaling (Phase 4)
    const pressureAction = pressureEngine.evaluate(context.behavioralMetrics, sessionId);
    if (pressureAction) {
      finalMessage = pressureAction.message || finalMessage;
      pressureEngine.recordAction(sessionId, pressureAction);
    }

    // Update chat history
    await sessionManager.addChatMessage(sessionId, 'interviewer', finalMessage);

    socket.emit('interviewer_message', { message: finalMessage });

    // EXPERT: Persist probing stage
    if (aiResponse.probingStage) {
      sessionManager.setSessionMetadata(sessionId, 'probingStage', aiResponse.probingStage);
    }

    // V1 FORENSIC TELEMETRY: Structured Event Stream
    console.log(JSON.stringify({
      timestamp: Date.now(),
      event: 'AI_MESSAGE',
      sessionId,
      persona: session.interviewerPersona,
      pressureAction: pressureAction?.type || 'none',
      messageLength: finalMessage.length,
      metrics: context.behavioralMetrics
    }));

    // Track which signal we are currently testing
    if (nextIntent) {
      sessionManager.setSessionMetadata(sessionId, 'activeSignal', nextIntent.signal.id);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ProactiveAI] Error sending message:', message);
  }
}

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string; email: string };
    socket.data.userId = decoded.userId;
    socket.data.userEmail = decoded.email;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.data.userId}`);

  // Join interview namespace
  socket.on('join_interview', async (data) => {
    const { sessionId } = data;
    const sessionRes = await sessionManager.reconnectSession(sessionId, socket.data.userId);
    socket.join(`interview:${sessionId}`);
    socket.emit('interview_joined', { sessionId });

    // Sync SignalAnalyzer with DB code immediately
    if (sessionRes.success && sessionRes.snapshot?.code) {
      signalAnalyzer.trackEvent(sessionId, {
        type: 'code_update',
        code: sessionRes.snapshot.code,
        timestamp: Date.now()
      });
    }

    // AI Introduction (Only if history is empty or has only the initial briefing)
    setTimeout(async () => {
      const session = await Session.findById(sessionId);
      if (session && session.chatHistory.length === 0) {
        const latestCode = signalAnalyzer.getLatestCode(sessionId);
        sendProactiveMessage(socket, sessionId, latestCode);
      }
    }, 800);
  });

  // Code update events
  socket.on('code_update', async (data) => {
    const { sessionId, code, cursorPosition } = data;

    // Analyze signal
    signalAnalyzer.trackEvent(sessionId, {
      type: 'code_update',
      code,
      cursorPosition,
      timestamp: Date.now()
    });

    // Check for anti-cheat
    const suspicionScore = antiCheatEngine.analyze(sessionId, code);
    if (suspicionScore > 0.45) {
      socket.emit('probe_request', { reason: 'suspicious_activity' });
    }

    // Broadcast to room (for interviewer view)
    socket.to(`interview:${sessionId}`).emit('code_change', { code, cursorPosition });

    // EXPERT: Real-Time Adaptation (AQDE Layer 2)
    const metrics = signalAnalyzer.getMetrics(sessionId);
    const emotionalState = signalAnalyzer.getEmotionalContext(sessionId);

    // Hand-waving / High-churn detection
    if (metrics.rewriteDensity > 0.6 || emotionalState.includes('Frustrated')) {
      // Throttle interruptions: Only interrupt if last message was > 30s ago
      const lastMessage = sessionManager.getLastInterviewerMessageTime(sessionId);
      if (Date.now() - lastMessage > 30000) {
        sendProactiveMessage(socket, sessionId, code);
      }
    }

    // Emit live HUD data
    const hudData = signalAnalyzer.getLiveHUDData(sessionId);
    socket.emit('behavioral_update', hudData);
  });

  // Editor events
  socket.on('editor_event', async (data) => {
    const { sessionId, event } = data;
    signalAnalyzer.trackEvent(sessionId, event);

    // Check for panic or loop patterns
    const metrics = signalAnalyzer.getMetrics(sessionId);
    // Emit live HUD data
    const hudData = signalAnalyzer.getLiveHUDData(sessionId);
    socket.emit('behavioral_update', hudData);

    // V1 FORENSIC TELEMETRY: Editor Event
    console.log(JSON.stringify({
      timestamp: Date.now(),
      event: 'EDITOR_ACTION',
      sessionId,
      action: (event as any).type,
      metrics: metrics,
      stress: hudData.stress,
      dnaMatch: hudData.dnaMatch
    }));

    // PHASE 5: Red-Team Adversarial Detection
    const attack = RedTeamEngine.detectAttack(metrics);
    if (attack) {
      RedTeamEngine.logAdversary(sessionId, attack);
      // Silently flag for the final verdict
      await sessionManager.setSessionMetadata(sessionId, 'redTeamFlag', attack);
    }
  });

  // Integrity/Proctoring events
  socket.on('integrity_event', (data) => {
    const { sessionId, type, timestamp } = data;
    // Log event to AntiCheatEngine
    // Note: You need to expose the instance or ensure it persists correctly
    // For now we assume a singleton or new instance per session scope if needed, 
    // but here we just log it as a proof of concept integration.
    console.log(`[Proctoring] Session ${sessionId}: ${type} at ${timestamp}`);
    // antiCheatEngine.logIntegrityEvent(sessionId, data); // Uncomment when instance is available globally or per session
  });

  // Audio stream handling (MVP)
  socket.on('audio_data', async (data: { sessionId: string; chunk: Buffer }) => {
    const { sessionId, chunk } = data;

    // 1. Log chunk arrival (Internal)
    // console.log(`[AudioStream] Received chunk for ${sessionId}: ${chunk.length} bytes`);

    // 2. Track speech time (MVP Rule: Stop at 25s if no MECE)
    const metrics = signalAnalyzer.getMetrics(sessionId);
    signalAnalyzer.trackEvent(sessionId, {
      type: 'audio_chunk',
      metadata: {
        size: chunk ? chunk.length : 0,
        transcript: (data as any).transcript
      },
      timestamp: Date.now()
    });

    // 3. Trigger Interruption Engine (Phase 3)
    const lastActivity = (sessionManager as any).getLastInterviewerMessageTime(sessionId);
    const silenceDuration = Date.now() - lastActivity;

    const hud = signalAnalyzer.getLiveHUDData(sessionId);

    const interruption = InterruptionEngine.evaluate({
      timeSpoken: metrics.timeSpoken,
      meceDetected: metrics.meceDetected,
      silenceDuration: silenceDuration,
      signalProgress: hud.dnaMatch > 80 ? 'strong' : 'none'
    });

    if (interruption.shouldInterrupt) {
      socket.emit('INTERRUPT', { reason: interruption.reason });
      sendProactiveMessage(socket, sessionId, interruption.message);
    }
  });

  // Run code
  socket.on('run_code', async (data) => {
    const { sessionId, code, language } = data;

    try {
      const result = await interviewEngine.executeCode(code, language);
      socket.emit('run_result', result);

      // Track execution signal
      signalAnalyzer.trackEvent(sessionId, {
        type: 'run',
        metadata: { success: result.status === 'success' },
        timestamp: Date.now()
      });
    } catch (error: any) {
      socket.emit('run_result', { status: 'error', error: error.message });
    }
  });

  // Submit solution
  socket.on('submit_solution', async (data) => {
    try {
      const { sessionId, code } = data;
      const session = await Session.findById(sessionId);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      // --- STRICT SUBMISSION VALIDATION ---
      const currentProblem = problems.find(p => p.id === session.problemId);
      const starterCode = currentProblem?.starterCode.javascript || '';

      if (!code || code.trim().length === 0) {
        socket.emit('error', { message: 'Submission REJECTED: Content body is empty.' });
        return;
      }

      if (currentProblem && code.trim() === starterCode.trim()) {
        socket.emit('error', { message: 'Submission REJECTED: No delta detected from starter code.' });
        return;
      }

      // SWIGGY VANILLA JS ENFORCEMENT
      if (session.metadata.targetCompany === 'Swiggy' || session.problemId?.startsWith('swiggy-')) {
        const frameworkKeywords = ['react', 'vue', 'angular', 'useState', 'useEffect', 'svelte', 'jquery'];
        const matches = frameworkKeywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(code));
        if (matches.length > 0) {
          socket.emit('error', {
            message: `Swiggy requirement violation: This round requires raw DOM manipulation and Vanilla JS. Please remove framework usage: ${matches.join(', ')}`
          });
          return;
        }
      }

      // Check if there are more rounds in the queue
      const hasRounds = session.problemQueue && session.problemQueue.length > 1;

      if (hasRounds) {
        // Transition to EVAL state for the current round
        await interviewEngine.transitionState(sessionId, 'ROUND_EVAL');

        const signals = signalAnalyzer.getAllSignals(sessionId);
        const roundVerdict = verdictEngine.calculateRoundVerdict(session, signals);

        // Update Round History
        const metrics = signalAnalyzer.getMetrics(sessionId);
        const currentRoundData = {
          roundId: session.problemId,
          roundName: `Round ${session.currentRound}`,
          scorecard: roundVerdict.scorecard,
          rejectionSignals: roundVerdict.rejectionSignals,
          interviewerNotes: roundVerdict.notes,
          verdict: roundVerdict.verdict,
          code: code,
          metrics: metrics as any
        };

        session.roundHistory.push(currentRoundData);

        // Summarize and flow risks forward
        MemoryManager.summarizeRound(session, roundVerdict);

        if (roundVerdict.verdict === 'FAIL') {
          // BLUEPRINT: SILENT REJECTION
          if (session.interviewerPersona === 'Karan') {
            await interviewEngine.transitionLevel(sessionId, 'OUT');
            socket.emit('level_changed', { level: 'OUT' });
            // Don't terminate, let it flow to de-escalation
          } else {
            // EXPERT RULE: HARD FAIL TERMINATION
            session.state = 'TERMINATED';
            await session.save();

            socket.emit('state_changed', { state: 'TERMINATED' });
            socket.emit('interviewer_message', {
              message: "Based on your performance in this round, we will not be proceeding further with your candidacy. Thank you for your time."
            });

            const finalVerdict = verdictEngine.calculateVerdict(session, signals);
            await verdictEngine.saveVerdict(sessionId, session.userId.toString(), finalVerdict);
            socket.emit('verdict_ready', finalVerdict);
            return;
          }
        }

        // PASS: Move to next round if available
        if (session.currentRound < session.totalRounds) {
          session.currentRound += 1;
          session.currentProblemIndex += 1;
          const nextProblemId = session.problemQueue[session.currentProblemIndex];
          const nextProblem = problems.find(p => p.id === nextProblemId);

          if (nextProblem) {
            session.problemId = nextProblemId;
            session.code = nextProblem.starterCode.javascript || '';
            session.metadata.problemTitle = nextProblem.title;
            session.metadata.problemCategory = nextProblem.category;
            session.state = `ROUND_${session.currentRound}` as any;

            // --- PROGRESSIVE CHALLENGE INJECTION (EXPERT SPRINT) ---
            if ((session.interviewMode as string) === 'expert-sprint') {
              const avgScore = Object.values(roundVerdict.scorecard).reduce((a, b) => a + b, 0) / Object.values(roundVerdict.scorecard).length;
              if (avgScore > 0.8) {
                const constraints = [
                  "STRICT CONSTRAINT: You must implement this without using any built-in Higher Order Functions (no .map, .filter, .reduce).",
                  "SECURITY CONSTRAINT: Implement this with zero usage of the 'eval' or 'new Function' patterns. Use strict type checks.",
                  "PERFORMANCE CONSTRAINT: The solution must pass with O(1) auxiliary space complexity.",
                  "ARCHITECTURAL CONSTRAINT: Use the Factory Pattern for object creation and ensure absolute separation of concerns."
                ];
                const selectedConstraint = constraints[Math.floor(Math.random() * constraints.length)];
                session.metadata.activeConstraint = selectedConstraint;

                // We'll also prepend it to the problem description in the metadata so it shows in the UI
                console.log(`[Expert Sprint] High score (${avgScore.toFixed(2)}) detected. Injecting: ${selectedConstraint}`);
              }
            }

            await session.save();

            socket.emit('next_problem', {
              problemId: nextProblemId,
              problem: nextProblem,
              currentProblemIndex: session.currentProblemIndex,
              totalProblems: session.problemQueue.length,
              roundName: `Round ${session.currentRound}`
            });

            // Reset signal analyzer for the new round
            signalAnalyzer.trackEvent(sessionId, {
              type: 'round_start',
              metadata: { round: session.currentRound },
              timestamp: Date.now()
            });

            return;
          }
        }
      }

      // Final aggregation for session completion
      const finalSignals = signalAnalyzer.getAllSignals(sessionId);

      // V1: Herd Detection (Expert Forensic)
      const herdResult = await VectorMemory.analyzeSolution(code, session.problemId);
      if (herdResult.isHerd) {
        console.warn(`[ForensicAlert] Herd Detection triggered for session ${sessionId}: Match ${herdResult.matchId}`);
        // Log to session metadata for verdict engine
        await sessionManager.setSessionMetadata(sessionId, 'forensicFlags', {
          herdDetected: true,
          confidence: herdResult.confidence,
          matchId: herdResult.matchId
        });
      }

      const verdict = verdictEngine.calculateVerdict(session, finalSignals);
      await verdictEngine.saveVerdict(sessionId, session.userId.toString(), verdict);
      await interviewEngine.transitionState(sessionId, 'VERDICT');

      socket.emit('verdict_ready', verdict);
      socket.to(`interview:${sessionId}`).emit('verdict_ready', verdict);

      setTimeout(() => {
        const code = signalAnalyzer.getLatestCode(sessionId);
        sendProactiveMessage(socket, sessionId, code);
      }, 2000);
    } catch (error) {
      console.error('Error submitting solution:', error);
      socket.emit('error', { message: 'Failed to submit solution' });
    }
  });

  // Request explanation / Chat
  socket.on('request_explanation', async (data) => {
    try {
      const { sessionId, context: userMessage } = data;
      const session = await Session.findById(sessionId);
      if (!session) return;

      const problem = problems.find((p: any) => p.id === session.problemId);
      if (!problem) return;

      // Save candidate message to history
      await sessionManager.addChatMessage(sessionId, 'candidate', userMessage);

      const profile = await TrainingProfile.findOne({ userId: session.userId });

      // EXPERT: Resolve signal after candidate message
      const activeSignalId = session.metadata?.activeSignal;
      if (activeSignalId) {
        const metrics = signalAnalyzer.getMetrics(sessionId);
        const resolvedState = SignalResolver.resolve({ id: activeSignalId } as any, metrics);
        QuestionDeliveryEngine.resolveSignal(sessionId, activeSignalId, resolvedState);
      }

      const interviewContext = {
        state: session.state,
        code: signalAnalyzer.getLatestCode(sessionId) || session.code,
        previousMessages: session.chatHistory.map(m => `${m.role.toUpperCase()}: ${m.content}`),
        behavioralMetrics: signalAnalyzer.getMetrics(sessionId),
        persona: session.interviewerPersona as any,
        mode: session.interviewMode as any,
        resumeText: profile?.resumeText,
        emotionalState: signalAnalyzer.getEmotionalContext(sessionId),
        roundScopedMemory: session.roundScopedMemory,
        level: session.level as any,
        probingStage: (session.metadata as any).probingStage || 1,
        sessionId
      } as any;

      // EXPERT: Bar-Raiser Injection (if performance is >90%)
      const hud = signalAnalyzer.getLiveHUDData(sessionId);
      if (hud.dnaMatch > 90 && session.state !== 'INTRO') {
        (interviewContext as any).probeIntent = "BAR_RAISER: The candidate is coasting. Ask a brutal, architectural 'what breaks first' question to find their ceiling.";
      }
      // EXPERT: Time Pressure System (Phase 5 id 8)
      if (session && session.state.startsWith('ROUND_')) {
        const startedAt = (session.metadata as any).questionStartedAt || session.startedAt.getTime();
        const elapsed = (Date.now() - startedAt) / 1000;
        const LIMIT = 600; // 10 minutes per question

        if (elapsed > LIMIT) {
          // FORCE MOVE-ON
          socket.emit('interviewer_message', {
            message: "Time is up for this round. We are moving on to the next segment immediately. Please prepare your focus."
          });
          // Trigger submission logic automatically
          // ... call submit_solution logic or force transition ...
        } else if (elapsed > LIMIT - 60) {
          // 1-minute warning
          if (Math.round(elapsed) % 60 === 0) {
            socket.emit('interviewer_message', { message: "We have less than a minute left for this segment. Wrap up your current thought." });
          }
        }
      }

      const aiResponse = await aiAdapter.generatePersonaChat(
        interviewContext as any,
        {
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          category: problem.category
        },
        userMessage,
        interviewContext.code
      );

      // MVP AUTHORITY: Forced templates removed in favor of Micro-contracts
      let finalMessage = aiResponse.message;

      // Save AI response to history
      await sessionManager.addChatMessage(sessionId, 'interviewer', finalMessage);

      socket.emit('interviewer_message', { message: finalMessage });

      // EXPERT: Persist probing stage
      if (aiResponse.probingStage) {
        sessionManager.setSessionMetadata(sessionId, 'probingStage', aiResponse.probingStage);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      socket.emit('interviewer_message', { message: "I'm having trouble analyzing the context right now. Let's focus back on the code." });
    }
  });

  // State transition
  socket.on('state_transition', async (data) => {
    const { sessionId, newState } = data;

    const result = await interviewEngine.transitionState(sessionId, newState);
    if (result.success) {
      socket.emit('state_changed', { state: newState });
      socket.to(`interview:${sessionId}`).emit('state_changed', { state: newState });

      // AI Context Update for the new round
      setTimeout(() => {
        const code = signalAnalyzer.getLatestCode(sessionId);
        sendProactiveMessage(socket, sessionId, code);
      }, 1500);
    } else {
      socket.emit('transition_error', { error: result.error });
    }
  });

  // Heartbeat
  socket.on('heartbeat', async (data) => {
    const { sessionId } = data;
    await sessionManager.updateHeartbeat(sessionId);

    // EXPERT: Silence Detection (Phase 5 id 7)
    const session = await Session.findById(sessionId);
    if (session && session.state.startsWith('ROUND_')) {
      const isSilenceTriggered = AlgorithmicPersona.evaluateSilence(sessionId, session.lastHeartbeat.getTime());
      if (isSilenceTriggered) {
        sendProactiveMessage(socket, sessionId, session.code);
      }
    }

    // Periodic HUD update even if no typing
    const hudData = signalAnalyzer.getLiveHUDData(sessionId);
    socket.emit('behavioral_update', hudData);
  });

  // Disconnect handling
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.data.userId}`);
    // Grace period for reconnection
    setTimeout(async () => {
      // Check if user reconnected
    }, 600000); // 10 minutes
  });
});

// HTTP Routes
import authRoutes from './routes/auth';
import sessionRoutes from './routes/sessions';
import verdictRoutes from './routes/verdicts';
import problemRoutes from './routes/problems';
import diagRoutes from './routes/diag';
import statsRoutes from './routes/stats';

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/verdicts', verdictRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/diag', diagRoutes);
app.use('/api/stats', statsRoutes);
import compassRoutes from './routes/compass';
app.use('/api/compass', compassRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io, interviewEngine, signalAnalyzer, verdictEngine };
