import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  imageUrl: { type: String },
  button1: {
    label: { type: String },
    url: { type: String }
  },
  button2: {
    label: { type: String },
    url: { type: String }
  },
  status: { type: String, enum: ['draft', 'running', 'completed', 'failed'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  startedAt: { type: Date },
  completedAt: { type: Date }
});

export default mongoose.model('Campaign', campaignSchema);
