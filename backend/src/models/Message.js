import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: String, required: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['pending', 'sent', 'failed'], default: 'pending' },
  wahaInstance: { type: String }, // untuk tracking instance waha mana
  sentAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Message', messageSchema);
