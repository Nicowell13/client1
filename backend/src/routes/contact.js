import express from 'express';
import Contact from '../models/Contact.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';

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

// Tambah contact manual
router.post('/', verifyClient, async (req, res) => {
  const { name, phonenumber } = req.body;
  try {
    const contact = new Contact({ user: req.user.id, name, phonenumber });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List contact user
router.get('/', verifyClient, async (req, res) => {
  try {
    const contacts = await Contact.find({ user: req.user.id });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Multer setup for CSV upload
const upload = multer({ dest: 'uploads/' });

// Upload CSV bulk contact (format: name,phonenumber)
router.post('/upload', verifyClient, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv(['name', 'phonenumber']))
    .on('data', (data) => {
      if (data.name && data.phonenumber) {
        results.push({ user: req.user.id, name: data.name, phonenumber: data.phonenumber });
      }
    })
    .on('end', async () => {
      try {
        await Contact.insertMany(results);
        fs.unlinkSync(req.file.path);
        res.status(201).json({ message: 'Contacts uploaded', count: results.length });
      } catch (err) {
        res.status(500).json({ message: 'Server error' });
      }
    });
});

export default router;
