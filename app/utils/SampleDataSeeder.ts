import { db, collection, doc, setDoc, serverTimestamp, addDoc, getDocs, query, where, deleteDoc } from '@/lib/firebase';

export const seedSampleData = async () => {
  const p1_id = "08123456789";
  const p1_name = "Andi Wijaya";
  
  const p2_id = "08771234567";
  const p2_name = "Siti Aminah";

  try {
    // Helper to clear existing sample data to avoid duplicates for these IDs
    const clearOld = async (pid: string) => {
      const q = query(collection(db, 'visits'), where('patientId', '==', pid));
      const snap = await getDocs(q);
      snap.forEach(async (d) => await deleteDoc(doc(db, 'visits', d.id)));
    };
    await clearOld(p1_id);
    await clearOld(p2_id);

    // ==========================================
    // PATIENT 1: ANDI WIJAYA (Kompleks)
    // ==========================================

    // 1. Data Pasien & Catatan Umum
    await setDoc(doc(db, 'patients', p1_id), {
      name: p1_name,
      phone: p1_id,
      birthDate: "1990-05-15",
      address: "Jl. Merdeka No. 45, Jakarta",
      medicalHistory: "Hipertensi terkontrol, Maag kronis. Mengonsumsi Amlodipine 5mg.",
      allergies: "Alergi obat Golongan Penicillin (Amoxicillin), Alergi Seafood.",
      gender: "L",
      bloodType: "B",
      createdAt: serverTimestamp(),
      lastVisit: new Date().toISOString()
    });

    // 2. Odontogram (Berbagai Kondisi)
    const p1_odontogram = [
      { tooth: 18, cond: 'IMP', notes: "Erupsi sebagian, posisi miring (Mesioangular)" },
      { tooth: 11, cond: 'SOU', notes: "Normal" },
      { tooth: 21, cond: 'SOU', notes: "Normal" },
      { tooth: 36, cond: 'RCT', notes: "Karies profunda distal, rencana PSA" },
      { tooth: 37, cond: 'CAR', notes: "Karies mencapai dentin pada oklusal" },
      { tooth: 46, cond: 'FIL', notes: "Tambalan komposit pada oklusal, kondisi baik" },
      { tooth: 45, cond: 'MIS', notes: "Pencabutan 2 tahun lalu" },
    ];

    for (const item of p1_odontogram) {
      await setDoc(doc(db, 'odontograms', `${p1_id}_${item.tooth}`), {
        patientId: p1_id,
        toothNumber: item.tooth,
        condition: item.cond,
        notes: item.notes,
        updatedAt: serverTimestamp()
      });
    }

    // 3. SOAP History (2 Kunjungan)
    
    // Kunjungan 1: 6 Bulan Lalu (Scaling)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    await addDoc(collection(db, 'visits'), {
      patientId: p1_id,
      patientName: p1_name,
      date: sixMonthsAgo.toISOString(),
      subjective: "Pasien datang untuk kontrol rutin dan ingin membersihkan karang gigi. Tidak ada keluhan sakit.",
      objective: "Calculus (karang gigi) pada regio rahang bawah anterior lingual dan rahang atas posterior bukal. Gingiva sedikit kemerahan (Gingivitis ringan).",
      vitals: { bloodPressure: "120/80", heartRate: "78", temperature: "36.2" },
      assessmentIcd10: "K05.1",
      assessmentDescription: "Gingivitis Marginal (Regio 3, 4)",
      plan: "Dilakukan Scaling & Polishing seluruh rahang. Instruksi cara menyikat gigi (DHE). Pasien disarankan kontrol 6 bulan lagi.",
      billingAmount: 250000,
      createdAt: serverTimestamp()
    });

    // Kunjungan 2: Sekarang (Sakit Gigi)
    await addDoc(collection(db, 'visits'), {
      patientId: p1_id,
      patientName: p1_name,
      date: new Date().toISOString(),
      subjective: "Pasien mengeluh sakit gigi bawah kiri belakang (36) sejak 3 hari lalu. Berdenyut terutama malam hari. Sakit jika kena dingin.",
      objective: "Gigi 36: Karies profunda distal, pulpa terbuka. Perkusi (+), Sondase (+). Gigi 37: Karies dentin oklusal.",
      vitals: { bloodPressure: "135/85", heartRate: "88", temperature: "36.7" },
      assessmentIcd10: "K04.02",
      assessmentDescription: "Pulpitis Irreversible (Gigi 36)",
      plan: "- Open bur gigi 36\n- Ekstirpasi jaringan pulpa\n- Medikamen TKF & Tumpatan Sementara\n- Rencana PSA minggu depan",
      soapTeeth: "36",
      billingAmount: 450000,
      createdAt: serverTimestamp()
    });

    // ==========================================
    // PATIENT 2: SITI AMINAH (Kasus Berbeda)
    // ==========================================
    
    await setDoc(doc(db, 'patients', p2_id), {
      name: p2_name,
      phone: p2_id,
      birthDate: "1995-11-20",
      address: "Apartemen Kalibata City, Tower Jasmine",
      medicalHistory: "Sehat, tidak ada penyakit sistemik.",
      allergies: "Tidak ada alergi.",
      gender: "P",
      createdAt: serverTimestamp(),
      lastVisit: new Date().toISOString()
    });

    await setDoc(doc(db, 'odontograms', `${p2_id}_11`), {
      patientId: p2_id,
      toothNumber: 11,
      condition: 'SOU',
      notes: "Kondisi sangat baik",
      updatedAt: serverTimestamp()
    });

    await addDoc(collection(db, 'visits'), {
      patientId: p2_id,
      patientName: p2_name,
      date: new Date().toISOString(),
      subjective: "Pasien ingin mencabut gigi geraham bungsu yang sering terasa sakit dan mengganjal.",
      objective: "Gigi 48: Impaksi sebagian, posisi horizontal. Gusi sekitar sedikit bengkak (Perikoronitis).",
      vitals: { bloodPressure: "110/70", heartRate: "72", temperature: "36.4" },
      assessmentIcd10: "K35.0",
      assessmentDescription: "Impaksi Molar 3 (Gigi 48) dengan Perikoronitis",
      plan: "Pemberian antibiotik dan pereda nyeri. Rencana Odontektomi (Bedah Mulut) setelah radang mereda.",
      soapTeeth: "48",
      billingAmount: 150000,
      createdAt: serverTimestamp()
    });

    return { success: true, patientName: p1_name };
  } catch (error) {
    console.error("Error seeding sample data:", error);
    throw error;
  }
};
