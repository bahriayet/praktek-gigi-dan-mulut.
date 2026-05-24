import { QueueItem } from '@/app/types';

export const formatWhatsAppNumber = (phone: string): string => {
  let formatted = phone.replace(/[^0-9]/g, '');
  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.slice(1);
  } else if (formatted.startsWith('8')) {
    formatted = '62' + formatted;
  }
  return formatted;
};

export const getRegistrationMessage = (name: string, number: string): string => {
  return `*PENDAFTARAN BERHASIL* ✅
  
Halo *${name}*, pendaftaran Anda di *Praktek Gigi Ranida* telah kami terima.

🎫 No. Antrean: *${number || '-'}*
📅 Tanggal: *${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*
⏰ Jam Praktik: *16:30 - 21:30 WITA*

Silakan datang tepat waktu dan tunjukkan nomor antrean ini kepada petugas kami. Sampai jumpa di lokasi! 👋`;
};

export const getRecallMessage = (name: string): string => {
  return `*PANGGILAN ANTREAN* 🔔

Halo *${name}*, giliran Anda sudah tiba di *Praktek Gigi Ranida*. Silakan menuju ke ruang periksa sekarang. 

Terima kasih atas kesabaran Anda.`;
};


export const formatMedicalRecordMessage = (record: QueueItem): string => {
  const amount = (record.billingAmount || 0).toLocaleString('id-ID');
  
  let clinicalPart = '';
  if (record.vitals?.bloodPressure) clinicalPart += `\n*TD:* ${record.vitals.bloodPressure} mmHg`;
  if (record.vitals?.temperature) clinicalPart += `\n*Suhu:* ${record.vitals.temperature}°C`;
  
  return `*RINGKASAN REKAM MEDIS*
Praktek Gigi Dan Mulut

*Pasien:* ${record.name}
*Tanggal:* ${record.date}
${clinicalPart}

*Anamnesa:*
${record.subjective || record.complaint || '-'}

*Diagnosis & Tindakan:*
${record.assessmentDescription || record.treatment || '-'}

*Total Biaya:* Rp ${amount}

_Terima kasih telah mempercayakan kesehatan gigi Anda kepada kami._`;
};

export const getWhatsAppLink = (phone: string, message: string): string => {
  const formattedPhone = formatWhatsAppNumber(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
};

