import { 
  db, 
  auth, 
  MASTER_ADMIN_EMAIL,
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  increment,
  runTransaction,
  writeBatch,
  Timestamp,
} from "./firebase";

// ─── Audit Trail: Tulis log ke koleksi auditLogs ──────────────────────────────
export const writeAuditLog = async ({
  action,
  collectionName,
  docId,
  summary,
}: {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  collectionName: string;
  docId?: string;
  summary: string;
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return; // Jangan catat jika tidak ada user login
    const logRef = collection(db, 'auditLogs');
    await addDoc(logRef, {
      action,
      collection: collectionName,
      docId: docId || null,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email || 'Unknown',
      userEmail: currentUser.email || '-',
      summary,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Jangan sampai error audit mengganggu operasi utama
    console.warn('[AuditLog] Gagal menulis log:', e);
  }
};

// ─── Backup: Export semua data ke file JSON ───────────────────────────────────
export const exportAllData = async (): Promise<void> => {
  const collectionsToExport = ['patients', 'queues', 'visits', 'inventory', 'auditLogs'];
  const backup: Record<string, any[]> = {};

  for (const col of collectionsToExport) {
    const snap = await getDocs(collection(db, col));
    backup[col] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '-');
  const timeStr = `${now.getHours()}${now.getMinutes()}`;
  const filename = `backup-praktek-gigi-ranida-${dateStr}-${timeStr}.json`;

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


// ─── Arsipkan & Hapus Log Lama ────────────────────────────────────────────────
// Mengambil log yang lebih tua dari `daysOld` hari, mengunduh sebagai backup .json,
// lalu menghapusnya dari Firestore secara bertahap (batch 500 dokumen).
export const archiveAndDeleteOldLogs = async (daysOld: number): Promise<{ deletedCount: number }> => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysOld);
  const cutoffTimestamp = Timestamp.fromDate(cutoff);

  // 1. Ambil semua log yang lebih tua dari cutoff
  const logsRef = collection(db, 'auditLogs');
  const q = query(logsRef, where('timestamp', '<', cutoffTimestamp));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { deletedCount: 0 };
  }

  const logsToArchive = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  // 2. Unduh sebagai file JSON (backup arsip)
  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID').replace(/\//g, '-');
  const filename = `arsip-auditlog-sebelum-${daysOld}hari-${dateStr}.json`;
  const blob = new Blob([JSON.stringify(logsToArchive, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // 3. Hapus dari Firestore dalam batch (maks 500 per batch)
  const BATCH_SIZE = 500;
  let deletedCount = 0;

  for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    const chunk = snap.docs.slice(i, i + BATCH_SIZE);
    chunk.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    deletedCount += chunk.length;
  }

  return { deletedCount };
};

// CRUD operations for Collections
export const addDocObj = async (collectionName: string, data: any) => {
  console.log(`[Firestore] Adding to ${collectionName}:`, data);
  const colRef = collection(db, collectionName);
  const result = await addDoc(colRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
  writeAuditLog({ action: 'CREATE', collectionName, docId: result.id, summary: `Tambah data baru di ${collectionName}` });
  return result;
};

export const incrementClinicCounter = async () => {
  const docRef = doc(db, "config", "clinic");
  // Use a transaction or simpler atomic increment
  // For better immediate return of the NEW value, we can use a transaction if needed,
  // but updateDoc + increment is simpler for rules.
  // Actually, to get the value BACK we need a transaction or two steps.
  // Let's use a transaction to be safe and accurate.
  try {
    const newNumber = await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(docRef);
      if (!sfDoc.exists()) {
        transaction.set(docRef, { currentNumber: 1, updatedAt: serverTimestamp() });
        return 1;
      }
      const newNum = (sfDoc.data().currentNumber || 0) + 1;
      transaction.update(docRef, { currentNumber: newNum, updatedAt: serverTimestamp() });
      return newNum;
    });
    return newNumber;
  } catch (e) {
    console.error("Transaction failed: ", e);
    throw e;
  }
};

export const updateDocObj = async (collectionName: string, id: string, updates: any) => {
  console.log(`[Firestore] Updating ${collectionName}/${id}:`, updates);
  const docRef = doc(db, collectionName, id);
  const result = await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
  writeAuditLog({ action: 'UPDATE', collectionName, docId: id, summary: `Update data di ${collectionName}` });
  return result;
};

export const deleteDocObj = async (collectionName: string, id: string) => {
  writeAuditLog({ action: 'DELETE', collectionName, docId: id, summary: `Hapus data dari ${collectionName}` });
  const docRef = doc(db, collectionName, id);
  return await deleteDoc(docRef);
};

// Generic Document operations
export const setSingleDoc = async (collectionName: string, docId: string, data: any) => {
  const docRef = doc(db, collectionName, docId);
  return await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
};

export const getDocData = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    // Kita gunakan getDoc, jika sedang offline maka akan mencoba mengambil dari cache
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (error: any) {
    if (error.code === 'unavailable' || error.message.includes('offline')) {
      console.warn(`[Firestore Status] Client sedang OFFLINE saat mencoba mengambil ${collectionName}/${docId}. Menggunakan cache lokal jika tersedia.`);
      return null;
    }
    console.error(`[Firestore Error] getDocData (${collectionName}/${docId}):`, error);
    return null; // Mengembalikan null alih-alih melempar error agar UI tidak crash
  }
};

// User & Role Management
export const syncUserRole = async (user: any, initialRole?: string) => {
  if (!user) return null;
  
  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const roleToSet = initialRole || (user.email === MASTER_ADMIN_EMAIL ? 'admin' : 'patient');
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: roleToSet,
        createdAt: serverTimestamp()
      };
      await setDoc(userRef, userData);
      return userData;
    } else {
      const existingData = userSnap.data();
      
      // Upgrade role if initialRole is provided (e.g. from password check)
      if (initialRole && existingData.role !== initialRole) {
        await updateDoc(userRef, { role: initialRole });
        return { ...existingData, role: initialRole };
      }

      // Upgrade role to admin if it's the master email
      if (user.email === MASTER_ADMIN_EMAIL && existingData.role !== 'admin') {
        await updateDoc(userRef, { role: 'admin' });
        return { ...existingData, role: 'admin' };
      }
      return existingData;
    }
  } catch (error: any) {
    console.error("CRITICAL FIRESTORE ERROR (Sync):", error);
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: initialRole || (user.email === MASTER_ADMIN_EMAIL ? 'admin' : 'patient'),
      roleSyncFailed: true
    };
  }
};

export const updateAuthRole = async (uid: string, newRole: string) => {
  const userRef = doc(db, "users", uid);
  return await updateDoc(userRef, { role: newRole });
};
