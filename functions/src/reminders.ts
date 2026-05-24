import * as admin from 'firebase-admin';
import { FonnteService } from './services/fonnteService';

// Message template variables
const CLINIC_NAME = 'Praktek Gigi Dan Mulut';

/**
 * Logic to send reminders for appointments scheduled for tomorrow.
 */
export const sendDailyReminders = async (fonnteToken: string) => {
  const db = admin.firestore();
  
  // 1. Get tomorrow's date string (YYYY-MM-DD)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0]; 

  console.log(`Checking appointments for date: ${tomorrowStr}`);

  try {
    // 2. Query 'queues' collection for patients scheduled tomorrow
    // Note: Adjust the collection name if needed based on the project structure
    const snapshot = await db.collection('queues')
      .where('date', '==', tomorrowStr)
      .get();

    if (snapshot.empty) {
      console.log('No appointments found for tomorrow.');
      return;
    }

    console.log(`Found ${snapshot.size} appointments. Sending reminders...`);

    const results = [];
    for (const doc of snapshot.docs) {
      const patient = doc.data();
      const { name, phone, date, time } = patient;

      if (!phone) {
        console.warn(`Patient ${name} has no phone number. Skipping...`);
        continue;
      }

      // Format date for the message (ex: 2026-04-13 -> 13 April 2026)
      const formattedDate = new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      // Template Pesan Profesional
      const message = `Halo Bapak/Ibu ${name}, ini adalah pengingat otomatis dari ${CLINIC_NAME}. Jadwal pemeriksaan Anda adalah besok, ${formattedDate} pukul ${time}. Mohon datang 15 menit lebih awal untuk proses administrasi. Terima kasih.`;

      try {
        const res = await FonnteService.sendMessage(phone, message, fonnteToken);
        results.push({ id: doc.id, success: true, response: res });
      } catch (err: any) {
        console.error(`Failed to send reminder to ${name} (${phone}):`, err.message);
        results.push({ id: doc.id, success: false, error: err.message });
      }
    }

    return results;
  } catch (error: any) {
    console.error('Error in sendDailyReminders function:', error);
    throw error;
  }
};
