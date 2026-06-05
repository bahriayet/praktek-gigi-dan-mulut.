'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  ClipboardList, 
  Pill, 
  Wallet, 
  ShieldCheck, 
  Stethoscope, 
  LogOut, 
  Activity, 
  X,
  ClipboardCheck,
  Image as ImageIcon,
  Home,
  Monitor,
  ExternalLink
} from 'lucide-react';


import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AdminSubView } from '@/app/types';
import ConfirmDeleteModal from '@/app/components/modals/ConfirmDeleteModal';
import { setSingleDoc } from '@/lib/firestoreService';
import ThemeToggle from '@/app/components/ThemeToggle';

import { containerVariants, itemVariants } from '@/app/constants/animations';

interface AdminSidebarProps {
  userRole: string | null;
  activeSubView: AdminSubView;
  setActiveSubView: (v: AdminSubView) => void;
  setActiveView: (v: import('@/app/types').View) => void;
  onLogout: () => void;
  showToast: (m: string, t?: 'success' | 'error') => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  onFactoryReset?: () => Promise<void>;
}

export default function AdminSidebar({ 
  userRole, 
  activeSubView, 
  setActiveSubView,
  setActiveView,
  onLogout, 
  showToast, 
  isOpen, 
  setIsOpen,
  onFactoryReset
}: AdminSidebarProps) {
  const fullMenuItems: { id: AdminSubView, icon: React.ReactNode, label: string }[] = [
    { id: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
    { id: 'patients', icon: <Users className="w-5 h-5" />, label: 'Database Pasien' },
    { id: 'records', icon: <ClipboardList className="w-5 h-5" />, label: 'Rekam Kunjungan' },
    { id: 'hasil-emr', icon: <ClipboardCheck className="w-5 h-5" />, label: 'Rekam Medis EMR' },
    { id: 'inventory', icon: <Pill className="w-5 h-5" />, label: 'Manajemen Stok' },
    { id: 'finance', icon: <Wallet className="w-5 h-5" />, label: 'Laporan Keuangan' },
    { id: 'staff', icon: <ShieldCheck className="w-5 h-5" />, label: 'Manajemen Tim' },
    { id: 'gallery', icon: <ImageIcon className="w-5 h-5" />, label: 'Galeri Klinik' },
    { id: 'audit-log', icon: <Activity className="w-5 h-5" />, label: 'Log Aktivitas' },
  ];



  const menuItems = fullMenuItems.filter(item => {
    if (userRole === 'admin') return true;
    if (userRole === 'doctor') {
      return !['finance', 'staff', 'audit-log'].includes(item.id);
    }
    return false;
  });

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [factoryResetModalOpen, setFactoryResetModalOpen] = useState(false);

  const handleFactoryResetConfirm = async () => {
    try {
      if (onFactoryReset) {
        await onFactoryReset();
        showToast('Database klinis telah dibersihkan sepenuhnya.', 'success');
        setFactoryResetModalOpen(false);
      }
    } catch (error) {
      console.error('Factory reset error:', error);
      showToast('Gagal membersihkan database.', 'error');
    }
  };

  const handleResetQueue = async () => {
    try {
      await setSingleDoc('config', 'clinic', { currentNumber: 0 });
      showToast('Nomor antrean berhasil direset ke 1.', 'success');
      setResetModalOpen(false);
    } catch (error) {
      console.error('Reset queue error:', error);
      showToast('Gagal mereset nomor antrean.', 'error');
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 glass-premium flex flex-col p-5 gap-6 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 overflow-y-auto custom-scrollbar border-r border-slate-200/50 dark:border-white/5",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-500/20">
              <Image src="/images/logo-ranida.png" alt="Logo" fill className="object-contain p-2.5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight tracking-tight uppercase">
                Praktek Gigi
                <span className="block text-brand-500 text-xs font-black tracking-[0.3em]">RANIDA</span>
              </h1>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-1"
        >
          {menuItems.map((item) => (
            <motion.button
              key={item.id}
              variants={itemVariants}
              onClick={() => {
                setActiveSubView(item.id as AdminSubView);
                if (window.innerWidth < 768) setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                activeSubView === item.id 
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30 font-bold" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-white font-medium"
              )}
            >
              {activeSubView === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className={cn(
                "transition-transform duration-300 group-hover:scale-110",
                activeSubView === item.id ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-brand-500"
              )}>
                {item.icon}
              </div>
              <span className="text-[13px] tracking-tight">{item.label}</span>
            </motion.button>
          ))}
        </motion.div>

        <div className="space-y-4">
          <button
             onClick={() => setResetModalOpen(true)}
             className="w-full py-3 bg-brand-500 text-white rounded-xl font-bold text-sm shadow-md hover:opacity-90 transition-all hover-lift active:scale-95"
           >
             Reset Antrean
           </button>
           {userRole === 'admin' && (
             <button
               onClick={() => setFactoryResetModalOpen(true)}
               className="w-full py-3.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 dark:border-red-900/30 hover:bg-red-600 hover:text-white transition-all hover-lift active:scale-95 flex items-center justify-center gap-2"
             >
               <Activity className="w-3.5 h-3.5" />
               Hapus Semua Data (Mulai Baru)
             </button>
           )}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1">
            <p className="px-4 text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Tampilan Publik</p>
            <button
              onClick={() => {
                setActiveView('landing');
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-brand-500 dark:text-brand-400 text-sm font-bold bg-brand-500/5 hover:bg-brand-500/10 transition-all rounded-xl w-full text-left group hover-lift"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Beranda</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-xl w-full text-left hover-lift"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {resetModalOpen && (
          <ConfirmDeleteModal
            title="Reset Nomor Antrean?"
            description="Apakah Anda yakin ingin mereset nomor antrean? Nomor pendaftaran berikutnya akan kembali dimulai dari 1."
            onConfirm={handleResetQueue}
            onClose={() => setResetModalOpen(false)}
          />
        )}
        {factoryResetModalOpen && (
          <ConfirmDeleteModal
            title="Hapus SEMUA Data Klinis?"
            description="TINDAKAN INI TIDAK DAPAT DIBATALKAN. Semua data antrean, pasien, rekam medis, dan inventori akan dihapus permanen. Gunakan hanya jika Anda ingin memulai dari awal."
            onConfirm={handleFactoryResetConfirm}
            onClose={() => setFactoryResetModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
