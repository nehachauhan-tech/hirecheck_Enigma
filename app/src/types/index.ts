export interface User {
  id: string;
  email: string;
  plan: 'free' | 'pro' | 'pro_plus';
  stats: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    streakDays: number;
  };
}

export interface Session {
  sessionId: string;
  state: SessionState;
  timer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  problemId: string;
  code: string;
  language: string;
  active: boolean;
  startedAt: string;
  interviewerPersona?: 'Priya' | 'Arjun' | 'Vikram' | 'Karan';
  interviewMode?: 'marathon' | 'sprint' | 'debug' | 'review' | 'compass' | 'expert-sprint' | 'behavioral';
  problemQueue?: string[];
  currentProblemIndex?: number;
  currentRound: number;
  totalRounds: number;
  metadata: {
    problemTitle: string;
    problemCategory: string;
    timeLimit: number;
    targetTopic?: string;
    targetCompany?: string;
    targetRole?: string;
    experienceLevel?: string;
    activeSignal?: string;
    questionStartedAt?: number;
    activeConstraint?: string;
  };
  chatHistory: { role: 'interviewer' | 'candidate'; content: string; timestamp: string }[];
}

export type SessionState =
  | 'INIT'
  | 'INTRO'
  | 'THEORY'
  | 'PRACTICAL'
  | 'REVIEW'
  | 'REQUIREMENT'
  | 'APPROACH'
  | 'CODING'
  | 'INTERRUPTION'
  | 'CONSTRAINT'
  | 'OPTIMIZATION'
  | 'BEHAVIORAL'
  | 'ROUND_EVAL'
  | 'WAITING_FOR_GATE'
  | 'ANALYSIS'
  | 'VERDICT'
  | 'TRAINING'
  | 'ARCHIVED';

export interface Problem {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  description: string;
  starterCode: Record<string, string>;
  testCases: { input: string; output: string }[];
}

export interface Verdict {
  verdictId: string;
  score: number;
  confidence: number;
  archetype: string;
  report: {
    understanding: number;
    strategy: number;
    recovery: number;
    adaptability: number;
    communication: number;
    optimization: number;
    pressureStability: number;
  };
  explanation: string;
  recommendations: string[];
  createdAt: string;
}

export interface CodeExecutionResult {
  status: 'success' | 'error';
  output: string;
  error: string;
  time?: string;
  memory?: string;
}

export interface InterviewMessage {
  id: string;
  role: 'interviewer' | 'candidate';
  content: string;
  timestamp: number;
}

export interface BehavioralMetrics {
  thinkingLatency: number;
  rewriteDensity: number;
  approachConsistency: number;
  failureRecoveryTime: number;
  pressureResponseShift: number;
  typingSpeed: number;
  pauseFrequency: number;
  codeChurn: number;
}

export interface TrainingProfile {
  weaknesses: string[];
  recommendedProblems: string[];
  skillProgress: Record<string, number>;
  xp: number;
  dailyStreak: number;
}
