import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  period: { type: String, required: true }, // format: YYYY-MM
  totalMessages: { type: Number, default: 0 },
  totalSuccess: { type: Number, default: 0 },
  totalFailed: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Billing', billingSchema);
