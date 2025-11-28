import express from 'express';
import Message from '../models/Message.js';
import Billing from '../models/Billing.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware: verify client
function verifyClient(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'client') return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Middleware: verify admin
function verifyAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Client: Kirim pesan (dummy, integrasi ke Waha nanti)
router.post('/send', verifyClient, async (req, res) => {
  const { to, content, wahaInstance } = req.body;
  try {
    // Simpan pesan ke database (status pending)
    const msg = new Message({
      user: req.user.id,
      to,
      content,
      wahaInstance,
      status: 'pending',
    });
    await msg.save();
    // TODO: Integrasi ke Waha API, update status sent/failed
    res.status(201).json({ message: 'Pesan dikirim (simulasi)', data: msg });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Statistik pesan sukses/gagal per user
router.get('/stats/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const total = await Message.countDocuments({ user: userId });
    const success = await Message.countDocuments({ user: userId, status: 'sent' });
    const failed = await Message.countDocuments({ user: userId, status: 'failed' });
    res.json({ total, success, failed });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: List billing per user
router.get('/billing/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const bills = await Billing.find({ user: userId }).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Generate billing manual (per bulan)
router.post('/billing/generate/:userId', verifyAdmin, async (req, res) => {
  const { userId } = req.params;
  const { period, tarif } = req.body; // period: '2025-11', tarif: per pesan
  try {
    const total = await Message.countDocuments({ user: userId, createdAt: { $gte: new Date(period+'-01'), $lt: new Date(period+'-31') } });
    const success = await Message.countDocuments({ user: userId, status: 'sent', createdAt: { $gte: new Date(period+'-01'), $lt: new Date(period+'-31') } });
    const failed = await Message.countDocuments({ user: userId, status: 'failed', createdAt: { $gte: new Date(period+'-01'), $lt: new Date(period+'-31') } });
    const amount = success * tarif;
    const bill = new Billing({ user: userId, period, totalMessages: total, totalSuccess: success, totalFailed: failed, amount });
    await bill.save();
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
