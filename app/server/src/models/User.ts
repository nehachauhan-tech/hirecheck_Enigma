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
  failedLoginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isLocked(): boolean;
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
  },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
}, { timestamps: true });

// Returns true if the account is currently locked
UserSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

export default mongoose.model<IUser>('User', UserSchema);
