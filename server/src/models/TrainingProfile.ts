import mongoose, { Schema, Document } from 'mongoose';

export interface ITrainingProfile extends Document {
  userId: mongoose.Types.ObjectId;
  resumeText: string;
  weaknesses: string[];
  history: {
    sessionId: mongoose.Types.ObjectId;
    problemId: string;
    problemCategory: string;
    score: number;
    weaknessesIdentified: string[];
    date: Date;
  }[];
  recommendedProblems: string[];
  skillProgress: {
    [key: string]: number;
  };
  behavioralDNA: {
    understanding: number;
    strategy: number;
    recovery: number;
    adaptability: number;
    communication: number;
    optimization: number;
    pressure: number;
  };
  xp: number;
  dailyStreak: number;
  lastDailyChallengeDate?: Date;
  updatedAt: Date;
}

const TrainingProfileSchema = new Schema<ITrainingProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  resumeText: { type: String, default: '' },
  weaknesses: [{ type: String }],
  history: [{
    sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
    problemId: String,
    problemCategory: String,
    score: Number,
    weaknessesIdentified: [{ type: String }],
    date: { type: Date, default: Date.now }
  }],
  recommendedProblems: [{ type: String }],
  skillProgress: {
    type: Schema.Types.Mixed, default: {
      'React.js': 50,
      'Node/Express': 50,
      'MongoDB': 50,
      'Algorithms': 30
    }
  },
  behavioralDNA: {
    understanding: { type: Number, default: 50 },
    strategy: { type: Number, default: 50 },
    recovery: { type: Number, default: 50 },
    adaptability: { type: Number, default: 50 },
    communication: { type: Number, default: 50 },
    optimization: { type: Number, default: 50 },
    pressure: { type: Number, default: 50 }
  },
  xp: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 0 },
  lastDailyChallengeDate: { type: Date },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITrainingProfile>('TrainingProfile', TrainingProfileSchema);
