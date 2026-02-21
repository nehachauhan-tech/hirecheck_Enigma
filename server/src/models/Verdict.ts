import mongoose, { Schema, Document } from 'mongoose';

export interface IVerdict extends Document {
  sessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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
    leadership: number;
  };
  signalDensity: number;
  pushbackScore: number;
  leadershipCredits: string[];
  confidenceBand: number;
  provenance: Map<string, string>;
  recoveryNarrative: string;
  explanation: string;
  recommendations: string[];
  createdAt: Date;
}

const VerdictSchema = new Schema<IVerdict>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true, min: 0, max: 1 },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  archetype: { type: String, required: true },
  report: {
    understanding: { type: Number, default: 0 },
    strategy: { type: Number, default: 0 },
    recovery: { type: Number, default: 0 },
    adaptability: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    optimization: { type: Number, default: 0 },
    pressureStability: { type: Number, default: 0 },
    leadership: { type: Number, default: 0 }
  },
  signalDensity: { type: Number, default: 0 },
  pushbackScore: { type: Number, default: 0 },
  leadershipCredits: [{ type: String }],
  confidenceBand: { type: Number, default: 0 },
  provenance: { type: Map, of: String },
  recoveryNarrative: { type: String },
  explanation: { type: String, required: true },
  recommendations: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IVerdict>('Verdict', VerdictSchema);
