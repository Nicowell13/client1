import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';

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

// Ambil QR code dari Waha API
router.get('/qr', verifyClient, async (req, res) => {
  try {
    // Ganti URL di bawah sesuai endpoint Waha instance default
    const response = await axios.get('http://waha1:3000/instance/qr');
    if (response.data && response.data.qr) {
      res.json({ qr: response.data.qr });
    } else {
      res.status(404).json({ message: 'QR code not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to get QR code', error: err.message });
  }
});

// Ambil screenshot QR code dari Waha API
router.get('/qr-screenshot', verifyClient, async (req, res) => {
  try {
    // Ganti URL di bawah sesuai endpoint Waha instance default
    const response = await axios.get('http://waha1:3000/instance/qr/screenshot', { responseType: 'arraybuffer' });
    res.set('Content-Type', 'image/png');
    res.send(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get QR screenshot', error: err.message });
  }
});

export default router;
