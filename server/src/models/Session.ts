import mongoose, { Schema, Document } from 'mongoose';

export type SessionState =
  | 'INIT'
  | 'INTRO'
  | 'ROUND_1'
  | 'ROUND_2'
  | 'ROUND_3'
  | 'ROUND_EVAL'
  | 'WAITING_FOR_GATE'
  | 'TERMINATED'
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
  | 'ANALYSIS'
  | 'VERDICT'
  | 'TRAINING'
  | 'ARCHIVED';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  state: SessionState;
  timer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  problemId: string;
  active: boolean;
  code: string;
  language: string;
  interviewerPersona: 'Priya' | 'Arjun' | 'Vikram' | 'Karan';
  interviewMode: 'marathon' | 'sprint' | 'debug' | 'review' | 'compass' | 'expert-sprint';
  marathonDifficulty?: 'easy' | 'intermediate' | 'hard' | 'advanced';
  startedAt: Date;
  endedAt?: Date;
  lastHeartbeat: Date;
  metadata: {
    problemTitle: string;
    problemCategory: string;
    timeLimit: number;
    targetTopic?: string; // For sprint mode
    targetCompany?: string; // For compass mode
    targetRole?: string;
    experienceLevel?: string;
    activeSignal?: string;
    questionStartedAt?: number;
    activeConstraint?: string;
    targetCompanyContext?: 'Startup' | 'Scale-up' | 'Enterprise';
    probingStage: number; // 1-4 for Progressive Constraints
  };
  problemQueue: string[];
  currentProblemIndex: number;
  currentRound: number;
  totalRounds: number;
  level: 200 | 300 | 400 | 'SOS' | 'OUT';
  roundHistory: {
    roundId: string;
    roundName: string;
    scorecard: Record<string, number>;
    rejectionSignals: string[];
    interviewerNotes: string;
    verdict: 'PASS' | 'FAIL' | 'GATE_LOCKED';
    code: string;
    metrics: Record<string, any>;
  }[];
  roundScopedMemory: {
    lastSummary: string;
    activeRisks: string[];
    probeHistory: string[];
  };
  chatHistory: { role: 'interviewer' | 'candidate'; content: string; timestamp: Date }[];
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  state: {
    type: String,
    enum: ['INIT', 'INTRO', 'ROUND_1', 'ROUND_2', 'ROUND_3', 'ROUND_EVAL', 'WAITING_FOR_GATE', 'TERMINATED', 'THEORY', 'PRACTICAL', 'REVIEW', 'REQUIREMENT', 'APPROACH', 'CODING', 'INTERRUPTION', 'CONSTRAINT', 'OPTIMIZATION', 'BEHAVIORAL', 'ANALYSIS', 'VERDICT', 'TRAINING', 'ARCHIVED'],
    default: 'INIT'
  },
  timer: { type: Number, default: 0 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  problemId: { type: String, required: true },
  active: { type: Boolean, default: true },
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  interviewerPersona: { type: String, enum: ['Priya', 'Arjun', 'Vikram', 'Karan'], default: 'Vikram' },
  interviewMode: { type: String, enum: ['marathon', 'sprint', 'debug', 'review', 'compass', 'expert-sprint'], default: 'marathon' },
  marathonDifficulty: { type: String, enum: ['easy', 'intermediate', 'hard', 'advanced'], default: 'intermediate' },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  lastHeartbeat: { type: Date, default: Date.now },
  metadata: {
    problemTitle: String,
    problemCategory: String,
    timeLimit: { type: Number, default: 3600 },
    targetTopic: String,
    targetCompany: String,
    targetRole: String,
    experienceLevel: String,
    resumeContext: String,
    activeSignal: String,
    questionStartedAt: Number,
    activeConstraint: String,
    targetCompanyContext: { type: String, enum: ['Startup', 'Scale-up', 'Enterprise'], default: 'Enterprise' },
    probingStage: { type: Number, default: 1 }
  },
  problemQueue: [{ type: String }],
  currentProblemIndex: { type: Number, default: 0 },
  currentRound: { type: Number, default: 1 },
  totalRounds: { type: Number, default: 3 },
  level: { type: Schema.Types.Mixed, default: 200 },
  roundHistory: [{
    roundId: String,
    roundName: String,
    scorecard: { type: Map, of: Number },
    rejectionSignals: [String],
    interviewerNotes: String,
    verdict: { type: String, enum: ['PASS', 'FAIL', 'GATE_LOCKED'] },
    code: { type: String, default: '' },
    metrics: { type: Schema.Types.Mixed }
  }],
  roundScopedMemory: {
    lastSummary: { type: String, default: '' },
    activeRisks: [String],
    probeHistory: [String]
  },
  chatHistory: [{
    role: { type: String, enum: ['interviewer', 'candidate'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);
