// Worker campaign
import './campaignWorker.js';
import express from 'express';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import cors from 'cors';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

import User from './models/User.js';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/message.js';
import contactRoutes from './routes/contact.js';
import wahaRoutes from './routes/waha.js';
import campaignRoutes from './routes/campaign.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Redis connection
const redis = new Redis(process.env.REDIS_URL);
redis.on('connect', () => {
  console.log('Redis connected');
});
redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Routes

app.use('/api/message', messageRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/waha', wahaRoutes);
app.use('/api/campaign', campaignRoutes);

// Simple route
app.get('/', (req, res) => {
  res.json({ message: 'WhatsApp API Backend running!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
