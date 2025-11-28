import mongoose from 'mongoose';
import Message from './models/Message.js';
import Campaign from './models/Campaign.js';
import axios from 'axios';

// Helper: random delay in ms
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function sendMessageToWaha(msg, campaign) {
  try {
    // Kirim ke Waha API (ganti URL sesuai instance)
    const payload = {
      to: msg.to,
      message: msg.content,
      imageUrl: campaign.imageUrl,
      buttons: []
    };
    if (campaign.button1 && campaign.button1.label && campaign.button1.url) {
      payload.buttons.push({ type: 'url', label: campaign.button1.label, url: campaign.button1.url });
    }
    if (campaign.button2 && campaign.button2.label && campaign.button2.url) {
      payload.buttons.push({ type: 'url', label: campaign.button2.label, url: campaign.button2.url });
    }
    // Contoh endpoint Waha (ganti sesuai API Waha Anda)
    const response = await axios.post('http://waha1:3000/send-message', payload);
    if (response.data && response.data.status === 'sent') {
      msg.status = 'sent';
      msg.sentAt = new Date();
    } else {
      msg.status = 'failed';
    }
  } catch (err) {
    msg.status = 'failed';
  }
  await msg.save();
}

export async function processCampaignQueue() {
  // Ambil campaign yang running
  const runningCampaigns = await Campaign.find({ status: 'running' });
  for (const campaign of runningCampaigns) {
    // Ambil pesan pending untuk campaign ini
    const pendingMessages = await Message.find({ campaign: campaign._id, status: 'pending' }).sort({ createdAt: 1 });
    let count = 0;
    for (const msg of pendingMessages) {
      await sendMessageToWaha(msg, campaign);
      count++;
      // Delay 5-7 detik per pesan
      await new Promise(r => setTimeout(r, randomDelay(5000, 7000)));
      // Setelah 10 pesan, delay 10-15 detik
      if (count % 10 === 0) {
        await new Promise(r => setTimeout(r, randomDelay(10000, 15000)));
      }
    }
    // Jika sudah tidak ada pending, update campaign selesai
    const sisa = await Message.countDocuments({ campaign: campaign._id, status: 'pending' });
    if (sisa === 0) {
      campaign.status = 'completed';
      campaign.completedAt = new Date();
      await campaign.save();
    }
  }
}

// Scheduler: jalankan setiap 30 detik
global.campaignWorkerInterval = setInterval(() => {
  processCampaignQueue().catch(console.error);
}, 30000);
