'use client';

import { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  collection, 
  query, 
  orderBy, 
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from '@/lib/firebase';
import { supabase } from '@/lib/supabaseClient';


import { useAuthState, useCollection } from '@/app/hooks/useFirebase';

import {
  addDocObj,
  updateDocObj,
  deleteDocObj,
  setSingleDoc,
  updateAuthRole,
  syncUserRole,
  getDocData,
  incrementClinicCounter
} from '@/lib/firestoreService';

import { 
  View, 
  AdminSubView, 
  ClinicUser, 
  QueueItem, 
  InventoryItem,
  Patient,
  SoapVisit,
  Article
} from '@/app/types';
import { clearClinicalData } from '@/app/utils/DataManagement';

export function useClinicData(initialView: View = 'patient') {
  const [activeView, setActiveView] = useState<View>(initialView);
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, loadingAuth] = useAuthState(auth);
  const [appUser, setAppUser] = useState<ClinicUser | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const [configSnapshot] = useCollection(query(collection(db, 'config')));
  const clinicConfig = configSnapshot?.docs.find((doc: QueryDocumentSnapshot<DocumentData>) => doc.id === 'clinic')?.data() || {};


  useEffect(() => {
    if (user) {
      setIsSyncing(true);
      const storedRole = typeof window !== 'undefined' ? sessionStorage.getItem('pendingClinicRole') : null;
      const roleToSync = pendingRole || storedRole || undefined;

      syncUserRole(user, roleToSync).then(uData => {
        if (uData) setAppUser(uData as ClinicUser);
        setIsSyncing(false);
        if (pendingRole) setPendingRole(null);
        if (typeof window !== 'undefined') sessionStorage.removeItem('pendingClinicRole');
      }).catch(() => setIsSyncing(false));
    } else {
      setAppUser(null);
      setIsSyncing(false);
    }
  }, [user, pendingRole]);

  const userRole = appUser?.role || null;
  const isStaff = userRole === 'admin' || userRole === 'doctor';

  const [queuesSnapshot] = useCollection(query(collection(db, 'queues')));
  const queue = queuesSnapshot 
    ? queuesSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as QueueItem))
      .sort((a: QueueItem, b: QueueItem) => {
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
        return timeA - timeB;
      })
    : [];

  const needsAdminData = activeView === 'clinic';

  const [inventorySnapshot] = useCollection(needsAdminData ? collection(db, 'inventory') : null);
  const inventory = inventorySnapshot 
    ? inventorySnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as InventoryItem))
    : [];

  const [usersSnapshot] = useCollection(needsAdminData ? collection(db, 'users') : null);
  const users = usersSnapshot 
    ? Array.from(
        usersSnapshot.docs
          .map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as ClinicUser))
          .reduce((acc, user) => {
            const email = user.email || 'unknown';
            const existing = acc.get(email);
            // If duplicate found, keep the one with higher role or newer createdAt
            if (!existing || (user.role === 'admin' && existing.role !== 'admin')) {
              acc.set(email, user);
            }
            return acc;
          }, new Map<string, ClinicUser>())
          .values()
      )
    : [];

  const [patientsSnapshot] = useCollection(needsAdminData ? query(collection(db, 'patients'), orderBy('updatedAt', 'desc')) : null);
  const patients = patientsSnapshot 
    ? patientsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as Patient))
    : [];

  const [visitsSnapshot] = useCollection(needsAdminData ? query(collection(db, 'visits'), orderBy('date', 'desc')) : null);
  const visits = visitsSnapshot 
    ? visitsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as SoapVisit))
    : [];


  const needsPhotos = activeView === 'landing' || activeView === 'clinic';
  const [photosSnapshot] = useCollection(needsPhotos ? collection(db, 'photos') : null);
  const photos = photosSnapshot
    ? photosSnapshot.docs
        .map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as any))
        .sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0))
    : [];

  const needsArticles = activeView === 'landing' || activeView === 'clinic';
  const [articlesSnapshot] = useCollection(needsArticles ? collection(db, 'articles') : null);
  const articles = articlesSnapshot
    ? articlesSnapshot.docs
        .map((doc: QueryDocumentSnapshot<DocumentData>) => ({ id: doc.id, ...doc.data() } as Article))
        .sort((a: Article, b: Article) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
          return timeB - timeA;
        })
    : [];




  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async (email?: string, password?: string) => {
    try {
      // Handle role upgrade trigger if already logged in or master password provided
      if (password === 'praktek-gigi-ranida') {
        setPendingRole('admin');
        if (typeof window !== 'undefined') sessionStorage.setItem('pendingClinicRole', 'admin');
        
        // If we are already logged in, the useEffect will handle the sync
        // If not, we continue to attempt login below
      }

      if (email && password) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          showToast('Login Berhasil');
        } catch (signInError: any) {
          if (password === 'praktek-gigi-ranida') {
            throw new Error('Gagal login dengan Password Master. Akun ini mungkin sudah terdaftar dengan password berbeda. Silakan Masuk dengan password Anda sendiri atau lewat Google, lalu gunakan fitur Upgrade di layar Akses Ditolak.');
          }
          throw signInError;
        }
      } else if (!email && !password) {
        await signInWithPopup(auth, googleProvider);
        showToast('Login Google Berhasil');
      }
    } catch (error: any) {
      let msg = error.message;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        msg = 'Password salah atau akun tidak ditemukan. Silakan gunakan password Anda sendiri atau Masuk lewat Google.';
      } else if (error.code === 'auth/user-not-found') {
        msg = 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.';
      }
      showToast(msg, 'error');
    }
  };

  const handleRegister = async (email?: string, password?: string) => {
    try {
      if (email && password) {
        if (password === 'praktek-gigi-ranida') {
          setPendingRole('admin');
          if (typeof window !== 'undefined') sessionStorage.setItem('pendingClinicRole', 'admin');
        }
        await createUserWithEmailAndPassword(auth, email, password);
        showToast('Registrasi Berhasil');
      }
    } catch (error: any) {
      // IF email already exists AND they used the master password, we can "Auto-Upgrade" them
      // This helps users who are already registered as patients to become admin
      if (error.code === 'auth/email-already-in-use' && password === 'praktek-gigi-ranida') {
        try {
          // Since we can't login without their password, we'll tell them to Login with their OWN password
          // and we've already set the pendingRole to 'admin' so when they DO login successfully,
          // syncUserRole will pick up the 'admin' role and upgrade them.
          showToast('Email sudah terdaftar. Silakan MASUK dengan password Anda sendiri untuk menjadi Admin.', 'success');
          // Switch view back to login if possible or just let them know
        } catch (e) {
          showToast('Gagal memproses upgrade role.', 'error');
        }
        return;
      }

      let msg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        msg = 'Email sudah terdaftar. Silakan gunakan menu Masuk (Login).';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password terlalu lemah. Minimal 6 karakter.';
      }
      showToast(msg, 'error');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setAppUser(null);
    setActiveView('patient');
    showToast('Logout Berhasil');
  };

  const handleDeletePatient = async (id: string) => {
    await deleteDocObj('queues', id);
    showToast('Pasien dihapus');
  };

  const handleUpdatePatient = async (id: string, updates: any) => {
    await updateDocObj('patients', id, updates);
    showToast('Data pasien diupdate');
  };

  const handleDeleteInventory = async (id: string) => {
    await deleteDocObj('inventory', id);
    showToast('Item dihapus');
  };

  const handleUpdateInventory = async (id: string | undefined, updates: any) => {
    if (!id) {
      await addDocObj('inventory', updates);
      showToast('Item baru ditambahkan');
    } else {
      await updateDocObj('inventory', id, updates);
      showToast('Inventori diupdate');
    }
  };

  const handleUpdateUserRole = async (uid: string, newRole: string) => {
    await updateAuthRole(uid, newRole);
    showToast(`Role diupdate ke ${newRole}`);
  };

  const handleUpdateUserName = async (uid: string, newName: string) => {
    await updateDocObj('users', uid, { displayName: newName });
    showToast(`Nama diupdate ke ${newName}`);
  };

  const handleDeletePatientMaster = async (id: string) => {
    await deleteDocObj('patients', id);
    showToast('Data pasien master dihapus');
  };

  const handleDeleteVisit = async (id: string) => {
    await deleteDocObj('visits', id);
    showToast('Riwayat kunjungan dihapus');
  };

  const handleUpdateVisit = async (id: string, updates: any) => {
    await updateDocObj('visits', id, updates);
    showToast('Kunjungan diupdate');
  };

  const handleFactoryReset = async () => {
    await clearClinicalData();
    showToast('Database klinis telah dibersihkan sepenuhnya.', 'success');
  };

  const updateClinicConfig = async (updates: any) => {
    await setSingleDoc('config', 'clinic', updates);
    showToast('Konfigurasi diupdate');
  };

  const handleUpdateHeroImage = async (url: string) => {
    await updateClinicConfig({ heroImageUrl: url });
    showToast('Foto Utama diperbarui', 'success');
  };

  const uploadToSupabase = async (file: File) => {
    try {
      const { supabase } = require('@/lib/supabaseClient');
      const fileName = `${Date.now()}_${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('images') // Pastikan bucket 'images' sudah dibuat di Supabase
        .upload(fileName, file);

      if (error) {
        console.error('Supabase upload error:', error.message);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('Supabase catch error:', err);
      return null;
    }
  };


  const sendWhatsAppNotification = async (phone: string, message: string) => {
    try {
      const token = process.env.NEXT_PUBLIC_FONNTE_TOKEN;
      if (!token) {
        console.error('WhatsApp notification failed: FONNTE_TOKEN not found');
        return false;
      }

      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': token
        },
        body: new URLSearchParams({
          target: phone,
          message: message,
          countryCode: '62'
        })
      });

      const result = await response.json();
      if (result.status) {
        console.log('WhatsApp notification sent:', result);
        return true;
      } else {
        console.error('WhatsApp API error:', result);
        return false;
      }
    } catch (error) {
      console.error('WhatsApp request failed:', error);
      return false;
    }
  };

  const handleDeleteArticle = async (id: string) => {
    await deleteDocObj('articles', id);
    showToast('Artikel dihapus');
  };

  const handleUpdateArticle = async (id: string | undefined, updates: any) => {
    if (!id) {
      await addDocObj('articles', updates);
      showToast('Artikel baru ditambahkan');
    } else {
      await updateDocObj('articles', id, updates);
      showToast('Artikel diupdate');
    }
  };


  return {
    activeView, setActiveView,
    adminSubView, setAdminSubView,
    isSidebarOpen, setIsSidebarOpen,
    user, loadingAuth, appUser, userRole, isStaff, isSyncing,
    toast, setToast, showToast,
    queue, inventory, users, patients, visits,
    handleLogin, handleRegister, handleLogout,
    handleDeletePatient, handleUpdatePatient,
    handleDeleteInventory, handleUpdateInventory,
    handleUpdateUserRole, handleUpdateUserName, handleDeletePatientMaster,
    handleDeleteVisit, handleUpdateVisit,
    sendWhatsAppNotification, uploadToSupabase,
    handleFactoryReset, clinicConfig, updateClinicConfig,
    handleUpdateHeroImage,

    photos,
    handleAddPhoto: async (data: any) => {
      await addDocObj('photos', { ...data, timestamp: serverTimestamp() });
      showToast('Foto disimpan');
    },
    handleDeletePhoto: async (id: string) => {
      await deleteDocObj('photos', id);
      showToast('Foto dihapus');
    },

    articles,
    handleDeleteArticle,
    handleUpdateArticle
  };


}
