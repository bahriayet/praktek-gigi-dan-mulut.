'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Bell, 
  Building2, 
  Pill, 
  ChevronLeft, 
  UserCircle, 
  FileText,
  MessageSquare,
  Bot,
  PowerOff,
  ShieldCheck,
  Stethoscope,
  ClipboardList,
  Wallet,
  Calendar,
  X,
  SkipForward,
  RefreshCw,
  AlertTriangle,
  UserX
} from 'lucide-react';

import { QueueItem, InventoryItem, AdminSubView } from '@/app/types';
import { updateDocObj } from '@/lib/firestoreService';
import { cn, getLocalYMD } from '@/lib/utils';
import { getRecallMessage, formatMedicalRecordMessage, getWhatsAppLink } from '@/lib/whatsappHelper';

import { db, collection, addDoc, serverTimestamp } from '@/lib/firebase';
import dynamic from 'next/dynamic';
const DoctorAiAssistant = dynamic(() => import('./DoctorAiAssistant'), { ssr: false });



import { containerVariants, itemVariants, pageVariants } from '@/app/constants/animations';

interface ClinicDashboardProps {
  queue: QueueItem[];
  inventory: InventoryItem[];
  setActiveSubView: (v: AdminSubView) => void;
  onAddPatient: () => void;
  sendWhatsAppNotification?: (phone: string, message: string) => Promise<boolean>;
  onOpenEmr?: (p: QueueItem) => void;
  clinicConfig?: any;
  updateClinicConfig?: (data: any) => Promise<void>;
  showToast?: (message: string, type?: 'success' | 'error') => void;
  requestConfirm?: (options: any) => void;
}

export default function ClinicDashboard({
  queue,
  inventory,
  setActiveSubView,
  onAddPatient,
  sendWhatsAppNotification,
  onOpenEmr,
  clinicConfig,
  updateClinicConfig,
  showToast,
  requestConfirm
}: ClinicDashboardProps) {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isEditingHoliday, setIsEditingHoliday] = useState(false);

  const [localHolidayMsg, setLocalHolidayMsg] = useState(clinicConfig?.holidayMessage || '');
  const [selectedActiveId, setSelectedActiveId] = useState<string | null>(null);

  React.useEffect(() => {
    if (clinicConfig?.holidayMessage !== undefined) {
      setLocalHolidayMsg(clinicConfig.holidayMessage);
    }
  }, [clinicConfig?.holidayMessage]);
  


  const todayDateStr = getLocalYMD();
  const todayQueue = queue.filter(q => q.date === todayDateStr && (q.status as any) !== 'SKIPPED_PERMANENT');

  const getTomorrowStr = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getLocalYMD(tomorrow);
  };

  const tomorrowDateStr = getTomorrowStr();
  const tomorrowPatients = queue.filter(p => p.date === tomorrowDateStr);

  const handleBulkReminder = async () => {
    if (!sendWhatsAppNotification || tomorrowPatients.length === 0) return;
    for (const p of tomorrowPatients) {
      const message = `Halo *${p.name}*, kami dari *Praktek Gigi Dan Mulut*. Mengingatkan jadwal periksa Anda besok tanggal *${p.date}*. Mohon hadir sesuai jam praktik (16:30-21:30 WITA). Terima kasih.`;
      await sendWhatsAppNotification(p.phone, message);
    }
    setShowBulkConfirm(false);
    if (showToast) showToast(`Berhasil mengirim pengingat ke ${tomorrowPatients.length} pasien untuk besok.`, 'success');
  };

  const handleSendRecall = async (patient: QueueItem) => {
    if (!sendWhatsAppNotification) return;
    const message = getRecallMessage(patient.name);
    await sendWhatsAppNotification(patient.phone, message);
  };

  // Pasien dari hari-hari sebelumnya yang masih WAITING (belum pernah diproses)
  const missedPatients = queue.filter(q => q.date < todayDateStr && q.status === 'WAITING');
  // Pasien hari ini yang sudah di-skip
  const skippedToday = todayQueue.filter(q => q.status === 'SKIPPED');

  const stats = [
    { label: 'Total Antrean', value: todayQueue.length.toString(), change: 'Hari Ini', icon: <Users className="w-5 h-5" />, color: 'primary' },
    { label: 'Menunggu', value: todayQueue.filter(q => q.status === 'WAITING').length.toString().padStart(2, '0'), change: 'Rata-rata 15m', icon: <Clock className="w-5 h-5" />, color: 'secondary' },
    { label: 'Sedang Diperiksa', value: todayQueue.filter(q => q.status === 'TREATING' || q.status === 'CALLING').length.toString().padStart(2, '0'), change: 'Poli Gigi', icon: <Activity className="w-5 h-5" />, color: 'success' },
    { label: 'Selesai/Bayar', value: todayQueue.filter(q => q.status === 'FINISHED' || q.status === 'PAID').length.toString().padStart(2, '0'), change: 'Rekam Medis', icon: <CheckCircle2 className="w-5 h-5" />, color: 'success' },
  ];

  const activePatients = queue.filter(q => q.status === 'CALLING' || q.status === 'TREATING');
  const activePatient = selectedActiveId 
    ? activePatients.find(p => p.id === selectedActiveId) || activePatients[0]
    : activePatients[0];

  const lowStockItems = inventory.filter(item => item.status !== 'Safe');
  const alertMessage = lowStockItems.length > 0
    ? `${lowStockItems.slice(0, 2).map(i => i.name).join(' dan ')}${lowStockItems.length > 2 ? ' serta lainnya' : ''} perlu segera dipesan ulang.`
    : 'Semua stok obat dan alat kesehatan dalam kondisi aman.';

  const handleCall = async (id: string) => {
    await updateDocObj('queues', id, { status: 'CALLING', updatedAt: serverTimestamp() });
    setSelectedActiveId(id);
  };

  const handleManualWA = async (phone: string, message: string) => {
    if (!sendWhatsAppNotification) {
      // Fallback only if API function is missing
      const link = getWhatsAppLink(phone, message);
      window.open(link, '_blank');
      return;
    }
    
    try {
      const success = await sendWhatsAppNotification(phone, message);
      if (success) {
        if (showToast) showToast('Notifikasi WhatsApp berhasil dikirim langsung ke pasien.', 'success');
      } else {
        // If API fails, then show the manual link as backup
        if (requestConfirm) {
          requestConfirm({
            title: 'Kirim Manual?',
            description: 'Gagal mengirim otomatis (mungkin kuota API habis). Kirim secara manual via WhatsApp?',
            confirmText: 'Kirim Manual',
            onConfirm: () => window.open(getWhatsAppLink(phone, message), '_blank')
          });
        } else {
          if (confirm('Gagal mengirim otomatis (mungkin kuota API habis). Kirim secara manual via WhatsApp?')) {
            window.open(getWhatsAppLink(phone, message), '_blank');
          }
        }
      }
    } catch (error) {
      console.error('WA Direct error:', error);
      window.open(getWhatsAppLink(phone, message), '_blank');
    }
  };




  const handleStartTreat = async (id: string) => {
    await updateDocObj('queues', id, { status: 'TREATING', updatedAt: serverTimestamp() });
    setSelectedActiveId(id);
  };

  const handleSkip = async (id: string) => {
    await updateDocObj('queues', id, { status: 'SKIPPED', updatedAt: serverTimestamp() });
  };

  const handleReschedule = async (id: string) => {
    await updateDocObj('queues', id, { 
      status: 'WAITING', 
      date: todayDateStr,
      updatedAt: serverTimestamp() 
    });
  };

  const handleCancelSkip = async (id: string) => {
    // Mengubah status ke SKIPPED_PERMANENT agar tidak muncul di daftar dilewati
    await updateDocObj('queues', id, { 
      status: 'SKIPPED_PERMANENT' as any, 
      updatedAt: serverTimestamp() 
    });
    if (showToast) showToast('Pasien dihapus dari daftar tunggu hari ini.', 'success');
  };


  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 md:space-y-5"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
      >
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            className="luxury-card p-4 flex flex-col justify-between border-t-4 border-t-brand-600/80 hover-lift"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <div className="text-brand-500 dark:text-brand-400 opacity-60">{stat.icon}</div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg md:text-3xl font-black text-slate-800 dark:text-slate-100">{stat.value}</span>
              <span className="text-[9px] font-bold text-brand-500 dark:text-brand-400 hidden xs:inline">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {tomorrowPatients.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shrink-0"><Bell className="w-6 h-6 animate-pulse" /></div>
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Pengingat Jadwal Besok</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ada {tomorrowPatients.length} pasien terdaftar untuk besok.</p>
            </div>
          </div>
          <button onClick={() => setShowBulkConfirm(true)} className="w-full sm:w-auto bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-500/20">
            <MessageSquare className="w-4 h-4" /> Kirim Notifikasi
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="luxury-card p-6 md:p-8">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-8">Daftar Antrean Hari Ini</h2>
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {todayQueue.filter(q => q.status === 'WAITING').length > 0 ? (
                todayQueue.filter(q => q.status === 'WAITING').map((item) => (
                  <motion.div 
                    key={item.id} 
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-100/40 dark:bg-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700 transition-all group hover-lift"
                  >
                    <div className="flex items-center gap-6 w-full sm:w-auto">
                      <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-xl font-black text-brand-500 border border-slate-200/60 dark:border-slate-700 shrink-0 shadow-sm group-hover:shadow-md transition-all">{item.number}</div>
                      <div>
                        <h4 className="text-base font-black text-slate-800 dark:text-slate-100 truncate">{item.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">{item.time} • {item.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                      <button 
                        onClick={() => {
                          const msg = `Halo *${item.name}*, kami dari *Praktek Gigi Ranida* ingin mengingatkan jadwal perawatan gigi Anda hari ini. Kami tunggu kehadirannya di klinik. Terima kasih, sehat selalu. 🙏✨`;
                          handleManualWA(item.phone, msg);
                        }}
                        className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 transition-all active:scale-95 flex items-center justify-center"
                        title="Kirim Pengingat Jadwal Hari Ini"
                      >
                        <Clock className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => handleManualWA(item.phone, getRecallMessage(item.name))}
                        className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl hover:bg-emerald-200 transition-all active:scale-95 flex items-center justify-center"
                        title="Kirim Pesan WA Panggilan"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSkip(item.id)} 
                        className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl hover:bg-amber-200 transition-all active:scale-95 flex items-center justify-center"
                        title="Lewati Pasien (Tidak Hadir)"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleCall(item.id)} className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-brand-500/10 active:scale-95 flex items-center justify-center gap-2 hover:bg-brand-600 transition-all">
                        <Bell className="w-3.5 h-3.5" /> Panggil
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada antrean tunggu</p>
                </div>
              )}
            </motion.div>

            {/* Pasien Dilewati Hari Ini */}
            {skippedToday.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <UserX className="w-4 h-4" />
                  Dilewati Hari Ini ({skippedToday.length})
                </h3>
                <div className="space-y-3">
                  {skippedToday.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col sm:flex-row items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-amber-200/50 dark:border-amber-900/30 transition-all"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-sm font-black text-amber-600 dark:text-amber-400 shrink-0">{item.number}</div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.name}</h4>
                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">{item.time} • Tidak Hadir</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 sm:mt-0">
                        <button 
                          onClick={() => handleReschedule(item.id)}
                          className="px-4 py-2 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/10 active:scale-95 flex items-center gap-2 hover:bg-brand-600 transition-all"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Jadwalkan Ulang
                        </button>
                        <button 
                          onClick={() => handleCancelSkip(item.id)}
                          className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                        >
                          <X className="w-3.5 h-3.5" /> Hapus dari Daftar
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Banner Peringatan: Pasien Lama Menggantung */}
          {missedPatients.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="luxury-card p-6 border-l-4 border-l-amber-500"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Pasien Belum Diproses</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ada {missedPatients.length} pasien dari hari sebelumnya yang masih berstatus menunggu.</p>
                </div>
              </div>
              <div className="space-y-3">
                {missedPatients.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-xs font-black text-amber-600 dark:text-amber-400 shrink-0">{item.number}</div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.date} • {item.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 sm:mt-0">
                      <button 
                        onClick={() => handleReschedule(item.id)}
                        className="px-4 py-2 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 flex items-center gap-2 hover:bg-brand-600 transition-all"
                      >
                        <RefreshCw className="w-3 h-3" /> Jadwalkan Ulang
                      </button>
                      <button 
                        onClick={() => handleSkip(item.id)}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                      >
                        <UserX className="w-3 h-3" /> Tidak Hadir
                      </button>
                    </div>
                  </div>
                ))}
                {missedPatients.length > 5 && (
                  <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Dan {missedPatients.length - 5} pasien lainnya...</p>
                )}
              </div>
            </motion.div>
          )}

          {/* No Antrean Aktif - MOVED TO LEFT COLUMN */}
          <div className="bg-white dark:bg-slate-950/90 backdrop-blur-xl rounded-[40px] p-8 text-center shadow-xl dark:shadow-2xl relative overflow-hidden border border-slate-200 dark:border-white/5">
            <div className="relative z-10 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase mb-4">No Antrean Aktif</span>
              <div className="text-7xl font-black text-slate-800 dark:text-slate-100 leading-none mb-4">{activePatient ? activePatient.number : '---'}</div>
              <div className={cn("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest", activePatient ? "bg-brand-500 text-white" : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-100/40")}>
                {activePatient ? (activePatient.status === 'CALLING' ? 'Dipanggil' : 'Diperiksa') : 'Ruang Tunggu'}
              </div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-8 truncate w-full">{activePatient ? activePatient.name : 'Belum ada panggilan'}</h3>
              
              {activePatient && (
                <div className="mt-8 w-full">
                  <button 
                    onClick={() => onOpenEmr?.(activePatient)}
                    className="w-full py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-500/30 active:scale-95 transition-all hover:bg-brand-400 flex items-center justify-center gap-3"
                  >
                    <ClipboardList className="w-5 h-5" />
                    Buka Riwayat Lengkap
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Akses Cepat & Status Operasional */}
          <div className="luxury-card p-6">
            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Akses Cepat</h4>
            
            {/* Inventory Alerts - NEW SECTION AT TOP OF QUICK ACCESS */}
            {inventory.some(i => i.status === 'Low' || i.status === 'Out of Stock') && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl cursor-pointer hover:bg-red-100 transition-all group"
                onClick={() => setActiveSubView('inventory')}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600">
                    <Pill className="w-4 h-4 animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Stok Obat Menipis</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-3">
                  Terdapat {inventory.filter(i => i.status === 'Low' || i.status === 'Out of Stock').length} item obat yang perlu segera diisi ulang.
                </p>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-red-600 group-hover:translate-x-1 transition-transform">
                  <span>Lihat Detail</span>
                  <ChevronLeft className="w-3 h-3 rotate-180" />
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
               <button onClick={onAddPatient} className="p-4 bg-slate-100/50 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700 flex flex-col items-center hover:bg-white transition-all group">
                 <Users className="w-5 h-5 text-brand-500 mb-1 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-200">Input Pasien</span>
               </button>
               <button onClick={() => setActiveSubView('finance')} className="p-4 bg-slate-100/50 dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700 flex flex-col items-center hover:bg-white transition-all group">
                 <Wallet className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-200">Kasir</span>
               </button>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status Operasional</h4>
                  <div 
                    onClick={() => updateClinicConfig?.({ ...clinicConfig, isClosed: !clinicConfig?.isClosed })}
                    className={cn(
                      "w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300",
                      clinicConfig?.isClosed ? "bg-red-500" : "bg-emerald-500"
                    )}
                  >
                     <div className={cn(
                       "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                       clinicConfig?.isClosed ? "left-7" : "left-1"
                     )} />
                  </div>
               </div>
               <div className={cn(
                 "p-4 rounded-2xl border transition-all",
                 clinicConfig?.isClosed 
                  ? "bg-red-50 border-red-100 dark:bg-red-950/10 dark:border-red-900/20" 
                  : "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/20"
               )}>
                  <div className="flex items-center gap-3 mb-2">
                     <div className={cn("w-2 h-2 rounded-full animate-pulse", clinicConfig?.isClosed ? "bg-red-500" : "bg-emerald-500")} />
                     <span className={cn("text-[10px] font-black uppercase tracking-widest", clinicConfig?.isClosed ? "text-red-600" : "text-emerald-600")}>
                        Klinik {clinicConfig?.isClosed ? "Tutup / Libur" : "Buka Normal"}
                     </span>
                  </div>
                  <textarea 
                    value={localHolidayMsg}
                    onChange={(e) => setLocalHolidayMsg(e.target.value)}
                    onBlur={() => updateClinicConfig?.({ ...clinicConfig, holidayMessage: localHolidayMsg })}
                    placeholder="Contoh: Klinik tutup karena libur lebaran, buka kembali Senin depan."
                    className="w-full bg-transparent text-[11px] font-medium text-slate-600 dark:text-slate-400 outline-none resize-none h-12"
                  />
               </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBulkConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900 rounded-[32px] p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Pengingat Besok</h3>
                <button onClick={() => setShowBulkConfirm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                   <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-8">
                {tomorrowPatients.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100">{p.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.phone}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const msg = `Halo *${p.name}*, kami dari *Praktek Gigi Ranida*. Mengingatkan jadwal periksa Anda besok tanggal *${p.date}*. Mohon hadir sesuai jam praktik (16:30-21:30 WITA). Terima kasih.`;
                        handleManualWA(p.phone, msg);
                      }}
                      className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 hover:bg-emerald-600 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 mb-6">
                 <p className="text-[10px] text-slate-500 text-center font-medium leading-relaxed">
                   Klik tombol hijau di samping setiap nama untuk mengirim pengingat manual melalui WhatsApp Anda.
                 </p>
              </div>

              <button onClick={() => setShowBulkConfirm(false)} className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Tutup</button>
            </motion.div>
          </div>
        )}

        {/* {isAiModalOpen && activePatient && (
          <DoctorAiAssistant isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} patientData={{ name: activePatient.name, medicalHistory: activePatient.medicalHistory }} initialInput={activePatient.complaint} onApply={(content) => { setTreatment(content); setIsAiModalOpen(false); }} />
        )} */}
      </AnimatePresence>
    </motion.div>
  );
}
