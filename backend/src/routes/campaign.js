import express from 'express';
import Campaign from '../models/Campaign.js';
import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
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

// Buat campaign baru
router.post('/', verifyClient, async (req, res) => {
  const { name, message, imageUrl, button1, button2 } = req.body;
  try {
    const campaign = new Campaign({
      user: req.user.id,
      name,
      message,
      imageUrl,
      button1,
      button2,
      status: 'draft',
    });
    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List campaign user
router.get('/', verifyClient, async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Start campaign (buat antrian pesan, status running)
router.post('/start/:id', verifyClient, async (req, res) => {
  const { id } = req.params;
  try {
    const campaign = await Campaign.findOne({ _id: id, user: req.user.id });
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    if (campaign.status !== 'draft') return res.status(400).json({ message: 'Campaign sudah berjalan' });
    // Ambil semua contact user
    const contacts = await Contact.find({ user: req.user.id });
    // Buat pesan untuk setiap contact (status pending)
    const messages = contacts.map(c => ({
      user: req.user.id,
      to: c.phonenumber,
      content: campaign.message.replace(/{{name}}/g, c.name),
      wahaInstance: 'waha1',
      status: 'pending',
      campaign: campaign._id
    }));
    await Message.insertMany(messages);
    campaign.status = 'running';
    campaign.startedAt = new Date();
    await campaign.save();
    // Worker akan proses pengiriman (implementasi selanjutnya)
    res.json({ message: 'Campaign started', campaign });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
