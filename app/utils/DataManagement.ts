import { 
  db,
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  writeBatch,
  query,
  limit,
  setDoc,
  serverTimestamp
} from '@/lib/firebase';

/**
 * Utility to clear clinical data while keeping staff and core setup.
 */
export const clearClinicalData = async () => {
  const collectionsToClear = [
    'queues',
    'patients',
    'visits',
    'odontograms',
    'inventory'
  ];

  try {
    for (const colName of collectionsToClear) {
      const q = query(collection(db, colName), limit(500)); // Batch clean for safety
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => {
        batch.delete(doc(db, colName, d.id));
      });
      
      await batch.commit();
      console.log(`[DataManagement] Cleared collection: ${colName}`);
    }

    // Reset Queue Counter in config
    await setDoc(doc(db, 'config', 'clinic'), {
      currentNumber: 0,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error clearing clinical data:", error);
    throw error;
  }
};
