import * as admin from 'firebase-admin';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendDailyReminders } from './reminders';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Scheduled function to run every day at 08:00 WIB (01:00 UTC).
 * Note: asia-southeast2 (Jakarta) is UTC+7.
 * Cron: '0 1 * * *' runs at 01:00 UTC = 08:00 AM WIB.
 */
export const scheduledWhatsAppReminder = onSchedule({
  schedule: '0 1 * * *',
  timeZone: 'Asia/Jakarta',
  memory: '256MiB',
}, async (event) => {
  // Use a secret or environment variable for the token
  // For now, I'll use a placeholder. You should set this using:
  // firebase functions:secrets:set FONNTE_TOKEN
  const fonnteToken = process.env.FONNTE_TOKEN || 'YOUR_FONNTE_TOKEN_HERE';
  
  if (fonnteToken === 'YOUR_FONNTE_TOKEN_HERE') {
    console.error('FONNTE_TOKEN is not set. Please set it in Firebase Secrets.');
    return;
  }

  await sendDailyReminders(fonnteToken);
  console.log('Daily WhatsApp reminders process completed.');
});

/**
 * Manual trigger for testing the reminders immediately.
 * URL: https://<region>-<project-id>.cloudfunctions.net/manualTriggerReminder
 */
export const manualTriggerReminder = onRequest(async (req, res) => {
  const fonnteToken = process.env.FONNTE_TOKEN || 'YOUR_FONNTE_TOKEN_HERE';
  
  if (fonnteToken === 'YOUR_FONNTE_TOKEN_HERE') {
    res.status(500).send('FONNTE_TOKEN is not set.');
    return;
  }

  try {
    const results = await sendDailyReminders(fonnteToken);
    res.status(200).json({
      message: 'Reminder process triggered manually.',
      results: results
    });
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

/**
 * Endpoint for one-click WhatsApp notifications from the Admin Dashboard.
 */
export const apiSendWhatsApp = onRequest({
  region: 'asia-southeast2',
  cors: true,
  secrets: ['FONNTE_TOKEN'],
}, async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      res.status(400).json({ success: false, error: 'Phone and message are required' });
      return;
    }

    // Format phone number to 62...
    let formattedPhone = phone.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('8')) {
      formattedPhone = '62' + formattedPhone;
    }

    const token = process.env.FONNTE_TOKEN;
    if (!token) {
      res.status(500).json({ success: false, error: 'FONNTE_TOKEN secret is not set in Firebase' });
      return;
    }

    const response = await axios.post('https://api.fonnte.com/send', {
      target: formattedPhone,
      message: message,
      countryCode: '62',
    }, {
      headers: {
        'Authorization': token,
      }
    });

    if (response.data.status === true) {
      res.status(200).json({ success: true, data: response.data });
    } else {
      res.status(500).json({ success: false, error: response.data.reason || 'Failed to send WhatsApp' });
    }
  } catch (error: any) {
    console.error('WhatsApp Function Error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.reason || error.message || 'Internal server error' 
    });
  }
});

/**
 * Endpoint for AI Assistance using Google Gemini.
 */
export const apiGetAiAssistance = onRequest({
  region: 'asia-southeast2',
  cors: true,
  secrets: ['GEMINI_API_KEY'],
  memory: '512MiB',
}, async (req, res) => {
  try {
    const { type, data, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      res.status(500).json({ success: false, error: 'GEMINI_API_KEY secret is not set in Firebase' });
      return;
    }

    if (!type || !data) {
      res.status(400).json({ success: false, error: 'Type and data are required' });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = '';
    const disclaimer = '\n\n*DISCLAIMER: Saran AI hanya sebagai asisten dan keputusan akhir tetap ada di tangan dokter gigi.*';

    if (type === 'diagnosis') {
      prompt = `Anda adalah asisten cerdas untuk dokter gigi. Tugas Anda adalah menganalisis keluhan pasien yang saya berikan. Berikan 3 kemungkinan diagnosa medis, saran pemeriksaan lanjutan (seperti Rontgen atau tes sensitivitas), dan perkiraan tingkat urgensi kasus tersebut. Gunakan terminologi medis kedokteran gigi yang akurat.\n\nKeluhan Pasien: ${data}${disclaimer}`;
    } else if (type === 'treatment') {
      prompt = `Berdasarkan diagnosa pasien yaitu [${context || data}], buatkan rencana perawatan langkah-demi-langkah yang harus dilakukan. Sertakan juga saran instruksi pasca-perawatan yang harus disampaikan kepada pasien agar proses penyembuhan maksimal.\n\nData tambahan: ${data}${disclaimer}`;
    } else if (type === 'summary') {
      prompt = `Ubah catatan medis mentah berikut menjadi ringkasan rekam medis digital yang terstruktur. Pastikan formatnya mencakup: Subjektif (keluhan), Objektif (pemeriksaan klinis), Asesmen (diagnosa), dan Plan (tindakan). Buat bahasanya tetap formal namun mudah dipahami jika dibaca oleh pasien.\n\nCatatan Mentah: ${data}${disclaimer}`;
    } else {
      res.status(400).json({ success: false, error: 'Invalid assistant type' });
      return;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({ success: true, response: responseText });
  } catch (error: any) {
    console.error('AI Assistant Error:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});
