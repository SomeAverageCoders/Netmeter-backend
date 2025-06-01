import mongoose, { Schema, Document } from 'mongoose';

export interface IUsage extends Document {
  userId: string;
  deviceId: string;
  dataUsedMB: number;
  timestamp: Date;
}

const UsageSchema: Schema = new Schema({
  userId: { type: String, required: true },
  deviceId: { type: String, required: true },
  dataUsedMB: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Usage || mongoose.model<IUsage>('Usage', UsageSchema);
