'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Phone, 
  UserCircle, 
  Calendar, 
  MessageSquare, 
  Search, 
  Ticket,
  ChevronRight,
  MapPin,
  ShieldAlert,
  Activity as ActivityIcon
} from 'lucide-react';
import { QueueItem, PatientTab } from '@/app/types';
import { 
  db,
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  Timestamp 
} from '@/lib/firebase';
import { addDocObj, updateDocObj, incrementClinicCounter } from '@/lib/firestoreService';
import { cn, getLocalYMD } from '@/lib/utils';

import { containerVariants, itemVariants } from '@/app/constants/animations';

interface PatientPortalProps {
  queue: QueueItem[];
  onShowTicket: (ticket: QueueItem) => void;
  clinicConfig?: any;
  sendWhatsAppNotification?: (phone: string, message: string) => Promise<boolean>;
  showToast?: (message: string, type?: 'success'|'error') => void;
}

export default function PatientPortal({ queue, onShowTicket, clinicConfig, sendWhatsAppNotification, showToast }: PatientPortalProps) {
  const [tab, setTab] = useState<PatientTab>('register');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: getLocalYMD(),
    time: '16:30 WITA',
    complaint: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    birthDate: '',
    gender: 'L' as 'L' | 'P'
  });

  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Auto-fill name and gender based on phone number
  useEffect(() => {
    const lookupPatient = async () => {
      if (formData.phone.length < 10) return;
      setIsSearching(true);
      try {
        const q = query(
          collection(db, 'queues'), 
          where('phone', '==', formData.phone),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0].data();
          if (latestDoc.name && !formData.name) {
            setFormData(prev => ({ 
              ...prev, 
              name: latestDoc.name,
              gender: latestDoc.gender || prev.gender
            }));
          }
        }
      } catch (error) {
        console.warn('Silent lookup failed:', error);
      } finally {
        setIsSearching(false);
      }
    };
    const debounceTimer = setTimeout(lookupPatient, 800);
    return () => clearTimeout(debounceTimer);
  }, [formData.phone, formData.name]);

  const handleRegister = async () => {
    if (!formData.name || !formData.phone || !formData.complaint) {
      if (showToast) showToast('Harap isi nama, nomor WA, dan keluhan Anda.', 'error');
      return;
    }
    setLoading(true);
    try {
      const today = getLocalYMD();
      let nextNum = 1;
      try {
        nextNum = await incrementClinicCounter();
      } catch (err) {
        const todayQueues = queue.filter(q => q.date === today);
        const existingNums = todayQueues.map(q => {
          const match = q.number.match(/A-(\d+)/);
          return match ? parseInt(match[1]) : 0;
        });
        nextNum = Math.max(0, ...existingNums) + 1;
      }
      const queueNumber = `A-${nextNum.toString().padStart(3, '0')}`;
      const ticketData = {
        number: queueNumber,
        name: formData.name,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        complaint: formData.complaint,
        address: formData.address,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies,
        birthDate: formData.birthDate,
        gender: formData.gender,
        status: 'WAITING' as const,
        createdAt: Timestamp.now()
      };
      const res = await addDocObj('queues', ticketData);

      // --- Sync to Patient Master Directory ---
      try {
        const patientsRef = collection(db, 'patients');
        const q = query(patientsRef, where('phone', '==', formData.phone));
        const querySnapshot = await getDocs(q);
        
        const patientMasterData = {
          name: formData.name,
          phone: formData.phone,
          address: formData.address || '',
          medicalHistory: formData.medicalHistory || '',
          allergies: formData.allergies || '',
          gender: formData.gender,
          lastVisit: ticketData.date,
          updatedAt: Timestamp.now() // Use Firestore Timestamp for consistency
        };

        if (querySnapshot.empty) {
          await addDocObj('patients', {
            ...patientMasterData,
            createdAt: Timestamp.now()
          });
        } else {
          const docId = querySnapshot.docs[0].id;
          // Import was already available via firestoreService if we move it up or use it directly
          await updateDocObj('patients', docId, patientMasterData);
        }
      } catch (masterError) {
        console.error('Error syncing to master patients:', masterError);
      }

      onShowTicket({ id: res.id, ...ticketData } as QueueItem);
      
      // Reset form to prevent double registration
      setFormData({
        name: '',
        phone: '',
        date: getLocalYMD(),
        time: '16:30 WITA',
        complaint: '',
        address: '',
        medicalHistory: '',
        allergies: '',
        birthDate: '',
        gender: 'L'
      });
    } catch (error) {
      console.error('Error during registration:', error);
      if (showToast) showToast('Gagal mengambil nomor antrean. Silakan coba lagi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckTicket = async () => {
    if (!formData.phone) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'queues'), where('phone', '==', formData.phone));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const tickets = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as QueueItem));
        const ticketDoc = tickets.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toDate?.() ? a.createdAt.toDate().getTime() : 0;
          const timeB = b.createdAt?.toDate?.() ? b.createdAt.toDate().getTime() : 0;
          return timeB - timeA;
        })[0];
        if (ticketDoc) {
          onShowTicket(ticketDoc);
        } else {
          if (showToast) showToast('Tiket tidak ditemukan untuk nomor ini.', 'error');
        }
      } else {
        if (showToast) showToast('Tiket tidak ditemukan untuk nomor ini.', 'error');
      }
    } catch (error) {
      console.error('Search error:', error);
      if (showToast) showToast('Terjadi kesalahan saat mencari tiket.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 md:space-y-8"
    >
      <div className="flex glass-premium p-1.5 rounded-[24px]">
        <button
          onClick={() => setTab('register')}
          className={cn(
            "flex-1 py-4 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 rounded-[20px] flex items-center justify-center gap-2 hover-lift",
            tab === 'register' 
              ? "bg-brand-500 text-white shadow-xl shadow-brand-500/20 scale-[1.02]" 
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
          )}
        >
          <Calendar className="w-4 h-4" />
          Daftar Antrean
        </button>
        <button
          onClick={() => setTab('check')}
          className={cn(
            "flex-1 py-4 text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 rounded-[20px] flex items-center justify-center gap-2 hover-lift",
            tab === 'check' 
              ? "bg-brand-500 text-white shadow-xl shadow-brand-500/20 scale-[1.02]" 
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50"
          )}
        >
          <Ticket className="w-4 h-4" />
          Cek Tiket Saku
        </button>
      </div>

      {tab === 'register' ? (
        <div className="space-y-6 md:space-y-8">
           {clinicConfig?.isClosed && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 bg-gradient-to-tr from-brand-500 to-brand-400 rounded-[32px] text-white shadow-2xl shadow-brand-500/30 flex items-center gap-6 relative overflow-hidden hover-lift"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="w-24 h-24" />
                 </div>
                 <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-10 h-10" />
                 </div>
                 <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter">Klinik Sedang Tutup</h3>
                    <p className="text-sm font-medium opacity-90 leading-relaxed mt-1">
                       {clinicConfig?.holidayMessage || "Kami sedang tidak beroperasi saat ini. Silakan cek kembali nanti atau hubungi admin via WhatsApp."}
                    </p>
                 </div>
              </motion.div>
           )}

           {/* Tip Card */}
          <div className="glass-premium p-6 rounded-[32px] flex gap-4 md:gap-6 items-center transition-all hover-lift">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-2xl bg-brand-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
               <ActivityIcon className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
              Gunakan nomor WhatsApp aktif untuk menerima notifikasi status antrean secara otomatis.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="glass-premium p-6 md:p-10 rounded-[40px] shadow-2xl shadow-slate-200/50 dark:shadow-none border-glow"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Nomor WhatsApp</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors">
                    <Phone className={cn("w-full h-full", isSearching && "animate-pulse text-brand-500")} />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      // Only allow digits
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                    }}
                    placeholder="Contoh: 08123456789"
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-sm md:text-base border-glow"
                    pattern="[0-9]*"
                    inputMode="numeric"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Nama Lengkap</label>
                <div className="relative group">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama Anda..."
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-base border-glow"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Jenis Kelamin</label>
                <div className="relative group">
                  <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" />
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-base appearance-none bg-no-repeat bg-[right_1.25rem_center] cursor-pointer border-glow"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '94a3b8' : 'cbd5e1'}' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                      backgroundSize: '1.25rem' 
                    }}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Tanggal Lahir</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" />
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-base border-glow"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Rencana Kedatangan</label>
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-base border-glow"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Pilih Jam</label>
                <div className="relative group">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" />
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-base appearance-none bg-no-repeat bg-[right_1.25rem_center] cursor-pointer border-glow"
                    style={{ 
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23${typeof window !== 'undefined' && document.documentElement.classList.contains('dark') ? '94a3b8' : 'cbd5e1'}' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, 
                      backgroundSize: '1.25rem' 
                    }}
                  >
                    <option>16:30 WITA</option>
                    <option>17:00 WITA</option>
                    <option>17:30 WITA</option>
                    <option>18:00 WITA</option>
                    <option>18:30 WITA</option>
                    <option>19:00 WITA</option>
                    <option>19:30 WITA</option>
                    <option>20:00 WITA</option>
                    <option>20:30 WITA</option>
                    <option>21:00 WITA</option>
                  </select>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Riwayat Penyakit (Jika Ada)</label>
                <div className="relative group">
                  <ActivityIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-red-600 dark:group-focus-within:text-red-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                    placeholder="Contoh: Diabetes, Asma, Hipertensi..."
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-base border-glow"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Alergi (Jika Ada)</label>
                <div className="relative group">
                  <ShieldAlert className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-amber-600 dark:group-focus-within:text-amber-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="Contoh: Penicillin, Seafood, Debu..."
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-base border-glow"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Alamat Lengkap</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Nama jalan atau kota..."
                    className="luxury-input w-full pl-12 h-14 md:h-16 text-base border-glow"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2 space-y-3 transition-colors">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Keluhan Gigi</label>
                <div className="relative group">
                  <MessageSquare className="absolute left-4 top-5 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors" />
                  <textarea
                    value={formData.complaint}
                    onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                    placeholder="Ceritakan keluhan Anda agar dokter dapat mempersiapkan tindakan yang sesuai..."
                    rows={3}
                    className="luxury-input w-full pl-12 pt-4 resize-none h-32 text-base leading-relaxed border-glow"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="md:col-span-2 pt-6">
                <button
                  onClick={handleRegister}
                  disabled={loading || clinicConfig?.isClosed}
                  className={cn(
                    "w-full h-16 md:h-24 rounded-3xl md:rounded-[32px] font-black text-sm md:text-lg uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 md:gap-4 disabled:opacity-50 hover-lift active:scale-[0.98] group border-glow",
                    clinicConfig?.isClosed 
                      ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none" 
                      : "bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20 hover:shadow-brand-500/30"
                  )}
                >
                  {loading ? (
                    <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{clinicConfig?.isClosed ? "Pendaftaran Ditutup" : "Ambil Nomor Antrean"}</span>
                      {!clinicConfig?.isClosed && <ChevronRight className="w-5 h-5 md:w-6 md:h-6 transform group-hover:translate-x-1 transition-transform" />}
                    </>
                  )}
                </button>
                
                <div className="mt-8 p-6 rounded-[32px] glass-premium flex flex-col gap-3 transition-all hover-lift">
                  <div className="flex flex-col md:flex-row justify-between items-center text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] transition-colors gap-2">
                    <span>SIPTGM: 503/1463/PMPTSP/SITGM/07/2023</span>
                    <span>STR: 18 04 5 1 2 21-3433260</span>
                  </div>
                  <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] transition-colors">
                    Hari Libur / Hari Besar Tutup
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="py-12 space-y-10 flex flex-col items-center"
        >
           <motion.div variants={itemVariants} className="relative">
              <div className="absolute inset-0 bg-brand-500 blur-3xl opacity-20 animate-pulse"></div>
              <div className="w-24 h-24 rounded-[36px] bg-brand-500 flex items-center justify-center shadow-2xl relative z-10 transition-transform hover-lift">
                <Ticket className="w-12 h-12 text-white" />
              </div>
           </motion.div>
           
           <motion.div variants={itemVariants} className="text-center max-w-sm space-y-3">
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter transition-colors">Temukan Tiket Saya</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed transition-colors">
                Masukkan nomor WhatsApp Anda untuk melihat riwayat antrean terbaru.
              </p>
           </motion.div>

           <motion.div variants={itemVariants} className="w-full max-w-md glass-premium p-8 rounded-[40px] shadow-2xl space-y-8 border-glow">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-2 block transition-colors">Nomor Terdaftar</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-600 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 0812...."
                    className="luxury-input w-full pl-12 h-16 text-lg tracking-wider border-glow"
                  />
                </div>
              </div>
              <button
                onClick={handleCheckTicket}
                disabled={loading || !formData.phone}
                className="w-full bg-slate-900 dark:bg-brand-500 text-white h-16 rounded-[28px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98] hover:bg-slate-800 dark:hover:bg-brand-600 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 hover-lift border-glow"
              >
                {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="w-5 h-5" />}
                Cari Riwayat Antrean
              </button>
           </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
