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
  // Security fields
  failedLoginAttempts: number;
  lockUntil: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Helper method
  isLocked(): boolean;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  plan: { type: String, enum: ['free', 'pro', 'pro_plus'], default: 'free' },
  stats: {
    totalInterviews: { type: Number, default: 0 },
    completedInterviews: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    streakDays: { type: Number, default: 0 }
  },
  // Account lockout
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
}, { timestamps: true });

// Helper: is the account currently locked?
UserSchema.methods.isLocked = function (): boolean {
  if (!this.lockUntil) return false;
  return this.lockUntil.getTime() > Date.now();
};

export default mongoose.model<IUser>('User', UserSchema);
