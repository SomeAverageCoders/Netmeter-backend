import mongoose, { Schema, Document } from 'mongoose';

// export interface IUsage extends Document {
//   userId: string;
//   deviceId: string;
//   dataUsedMB: number;
//   timestamp: Date;
// }

// const UsageSchema: Schema = new Schema({
//   userId: { type: String, required: true },
//   deviceId: { type: String, required: true },
//   dataUsedMB: { type: Number, required: true },
//   timestamp: { type: Date, default: Date.now }
// });

// Define the schema once
const SessionSchema = new mongoose.Schema({
  time: String,
  download: Number,
  upload: Number,
}, { _id: false });

const UsageSchema = new mongoose.Schema({
  date: String,
  download: Number,
  upload: Number,
  sessions: [SessionSchema],
});

export default mongoose.models.Usage || mongoose.model('Usage', UsageSchema);

// export default mongoose.models.Usage || mongoose.model<IUsage>('Usage', UsageSchema);
