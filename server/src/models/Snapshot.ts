import mongoose, { Schema, Document } from 'mongoose';

export interface ISnapshot extends Document {
  sessionId: mongoose.Types.ObjectId;
  code: string;
  cursor: {
    line: number;
    column: number;
  };
  signals: any;
  timestamp: Date;
  state: string;
}

const SnapshotSchema = new Schema<ISnapshot>({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  code: { type: String, required: true },
  cursor: {
    line: { type: Number, default: 0 },
    column: { type: Number, default: 0 }
  },
  signals: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now },
  state: { type: String, required: true }
});

export default mongoose.model<ISnapshot>('Snapshot', SnapshotSchema);
