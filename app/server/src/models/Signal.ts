import mongoose, { Schema, Document } from 'mongoose';

export interface ISignal extends Document {
  sessionId: mongoose.Types.ObjectId;
  metric: string;
  value: number;
  time: Date;
  metadata?: any;
}

const SignalSchema = new Schema<ISignal>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  metric: { type: String, required: true },
  value: { type: Number, required: true },
  time: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed }
});

// Index for efficient querying
SignalSchema.index({ sessionId: 1, time: -1 });
SignalSchema.index({ sessionId: 1, metric: 1 });

export default mongoose.model<ISignal>('Signal', SignalSchema);
