import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'client'], default: 'client' },
  name: { type: String },
  isActive: { type: Boolean, default: true },
  balance: { type: Number, default: 0 }, // saldo untuk billing per pesan
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
