import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phonenumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Contact', contactSchema);
