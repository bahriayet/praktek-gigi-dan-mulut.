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
  runTransaction
} from "./firebase";

// CRUD operations for Collections
export const addDocObj = async (collectionName: string, data: any) => {
  console.log(`[Firestore] Adding to ${collectionName}:`, data);
  const colRef = collection(db, collectionName);
  return await addDoc(colRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
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
  return await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteDocObj = async (collectionName: string, id: string) => {
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
