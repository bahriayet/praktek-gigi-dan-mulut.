'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Users, ClipboardList, ArrowLeft, ShieldCheck, CreditCard, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { QueueItem } from '@/app/types';
import { cn, getLocalYMD } from '@/lib/utils';

interface LiveMonitorProps {
  queue: QueueItem[];
  onBack?: () => void;
  clinicConfig?: any;
}

export default function LiveMonitor({ queue, onBack, clinicConfig }: LiveMonitorProps) {
  const todayDateStr = getLocalYMD();
  const todayQueue = queue.filter(q => q.date === todayDateStr && (q.status as any) !== 'SKIPPED_PERMANENT');

  // Cari pasien yang dipanggil berdasarkan yang paling baru diupdate statusnya menjadi CALLING
  const currentCalling = todayQueue
    .filter(q => q.status === 'CALLING')
    .sort((a, b) => {
      const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
      const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
      return timeB - timeA; // Ambil yang paling baru
    })[0];

  const treatingPatients = todayQueue.filter(q => q.status === 'TREATING');
  const paidPatients = todayQueue.filter(q => q.status === 'PAID').slice(0, 3);
  const waitingQueue = todayQueue.filter(q => q.status === 'WAITING');
  const finishedCount = todayQueue.filter(q => q.status === 'FINISHED').length;




  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 p-4 md:p-8 lg:p-12 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>



      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <header className="flex flex-row justify-between items-center gap-4 mb-12">
          <div className="flex items-center gap-2 sm:gap-4">
            {onBack && (
              <button 
                onClick={onBack}
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/80 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex shrink-0 items-center justify-center text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all shadow-sm group backdrop-blur-md"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            )}
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-[24px] bg-brand-500 dark:bg-slate-800 flex items-center justify-center shadow-xl p-2 md:p-3 relative border border-slate-100 dark:border-slate-700 overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-50/50 to-transparent dark:from-teal-500/5 pointer-events-none" />
                    <div className="relative w-full h-full">
                        <Image src="/images/logo-ranida.png" alt="Logo" fill className="object-contain" priority />
                    </div>
                </div>
                <div>
                    <h1 className="text-sm md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none">
                        Praktek Gigi <span className="text-brand-500 dark:text-brand-400">Ranida</span>
                    </h1>
                    <p className="text-[6px] md:text-xs text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mt-0.5">Live Monitor</p>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('id-ID', { weekday: 'long' })}</p>
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/60 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-white dark:border-slate-700 shadow-sm backdrop-blur-md md:px-4 md:py-2 md:rounded-2xl">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse md:w-2 md:h-2" />
                <span className="text-[8px] md:text-xs font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Online</span>
            </div>

          </div>
        </header>

        {clinicConfig?.isClosed && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-8 bg-gradient-to-tr from-brand-500 to-brand-400 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-brand-500/30 relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldAlert className="w-32 h-32" />
             </div>
             <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-10 h-10" />
                </div>
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Pemberitahuan Penting: Klinik Tutup</h2>
                    <p className="text-sm font-medium opacity-90 max-w-2xl mt-1">
                       {clinicConfig?.holidayMessage || "Klinik saat ini sedang tidak melayani pasien. Silakan hubungi admin untuk informasi lebih lanjut."}
                    </p>
                </div>
             </div>
             <div className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                Operational Status: Offline
             </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Calling Section */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
               layout
               className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-16 relative overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/20 border border-slate-100 dark:border-transparent border-glow"
            >
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-brand-400 text-[10px] font-black uppercase tracking-[0.2em] mb-12 hover-lift cursor-default">
                        <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                        Panggilan Sekarang
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCalling?.id || 'none'}
                            initial={{ opacity: 0, y: 40, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -40, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 100 }}
                            className="flex flex-col items-center"
                        >
                             <h2 className="text-[70px] sm:text-[120px] md:text-[180px] font-black leading-none tracking-tighter mb-2 md:mb-4 text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 dark:from-white dark:to-white/60">
                                {currentCalling ? currentCalling.number : '---'}
                            </h2>
                             <h3 className="text-xl md:text-4xl font-black tracking-tight text-slate-700 dark:text-white/90 max-w-2xl px-4">
                                {currentCalling ? currentCalling.name : 'Silakan Tunggu Antrean'}
                            </h3>
                             <div className="mt-8 flex items-center gap-3 text-brand-500 dark:text-brand-400 font-black uppercase tracking-widest text-[10px] md:text-sm">
                                <ShieldCheck className="w-5 h-5" />
                                {currentCalling ? 'Silakan Menuju Ruang Periksa' : 'Petugas akan segera memanggil'}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Sub Status Cards (Treating & Paid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Sedang Diperiksa */}
                <div className="glass-premium rounded-[32px] p-6 md:p-8">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Sedang Diperiksa
                    </h4>
                    <div className="space-y-4">
                        {treatingPatients.length > 0 ? treatingPatients.map(p => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={p.id} 
                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover-lift"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="min-w-[3rem] h-10 px-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black shrink-0 whitespace-nowrap rounded-xl">
                                        {p.number}
                                    </div>
                                    <p className="font-bold text-slate-800 dark:text-slate-100">{p.name}</p>
                                </div>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </motion.div>
                        )) : (
                            <p className="text-xs font-bold text-slate-300 italic text-center py-4">Belum ada pasien di ruangan</p>
                        )}
                    </div>
                </div>

                {/* Selesai & Ke Kasir */}
                <div className="glass-premium rounded-[32px] p-8">
                    <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-500" />
                        Selesai & Ke Kasir
                    </h4>
                    <div className="space-y-4">
                        {paidPatients.length > 0 ? paidPatients.map(p => (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={p.id} 
                                className="flex items-center justify-between p-4 bg-emerald-50/50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/20 hover-lift"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="min-w-[3rem] h-10 px-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black shrink-0 whitespace-nowrap rounded-xl">
                                        {p.number}
                                    </div>
                                    <p className="font-bold text-emerald-900 dark:text-emerald-300">{p.name}</p>
                                </div>
                                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Selesai</div>
                            </motion.div>
                        )) : (
                            <p className="text-xs font-bold text-slate-300 italic text-center py-4">Belum ada penyelesaian baru</p>
                        )}
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Next Queue */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-premium rounded-[40px] p-8 flex flex-col h-full sticky top-12">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                        Daftar Antrean
                    </h3>
                    <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {waitingQueue.length} Tunggu
                    </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {waitingQueue.length > 0 ? (
                        waitingQueue.map((item, idx) => (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id} 
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-[#0E7490]/5 dark:hover:bg-teal-500/5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all group hover-lift"
                        >
                            <div className="flex items-center gap-4">
                                <div className="min-w-[3rem] h-10 px-3 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-sm font-black text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700 group-hover:border-[#0E7490]/20 group-hover:text-[#0E7490] dark:group-hover:text-teal-400 transition-all text-center shrink-0 whitespace-nowrap">
                                    {item.number}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{item.time}</p>
                                </div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-teal-500 transition-colors" />
                        </motion.div>
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Tidak ada antrean tunggu</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Rata-rata</p>
                        <p className="text-xl font-black text-slate-800 dark:text-slate-100">15m</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1">Selesai</p>
                        <p className="text-xl font-black text-emerald-500">{finishedCount}</p>
                    </div>
                </div>
            </div>
          </div>

        </div>

        {/* Footer Info */}
        <footer className="mt-16 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-600 text-[10px] font-black uppercase tracking-widest">
                <Clock className="w-4 h-4" />
                Jam Praktik: 16:30 - 21:30 WITA
            </div>
            <div className="p-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[20px] border border-white/50 dark:border-slate-800 shadow-sm">
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm text-center md:text-right">
                    Harap bersiap saat nomor antrean Anda mendekati urutan panggilan. <br />
                    Terima kasih atas kepercayaan Anda pada layanan kami.
                </p>
            </div>
        </footer>
      </div>
    </div>
  );
}
