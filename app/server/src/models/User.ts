import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'pro_plus';
  stats: {
    totalInterviews: number;
    completedInterviews: number;
    averageScore: number;
    streakDays: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  plan: { type: String, enum: ['free', 'pro', 'pro_plus'], default: 'free' },
  stats: {
    totalInterviews: { type: Number, default: 0 },
    completedInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
