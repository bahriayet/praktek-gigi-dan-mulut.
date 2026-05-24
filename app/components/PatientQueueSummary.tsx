'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { QueueItem } from '@/app/types';
import { getLocalYMD } from '@/lib/utils';

interface PatientQueueSummaryProps {
  queue: QueueItem[];
}

export default function PatientQueueSummary({ queue }: PatientQueueSummaryProps) {
  const currentCalling = queue.find(q => q.status === 'CALLING');
  const currentlyTreating = queue.find(q => q.status === 'TREATING');
  const activePatient = currentCalling || currentlyTreating;
  
  const waitingQueue = queue.filter(q => q.status === 'WAITING' && q.date === getLocalYMD());
  
  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[40px] blur opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[40px] p-6 md:p-10 border border-white/50 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-teal-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status Ruang Periksa</h3>
                <p className="text-slate-800 dark:text-slate-100 font-bold text-sm">Monitor Antrean Sekarang</p>
              </div>
            </div>
            {activePatient && (
              <div className="px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-teal-100 dark:border-teal-900/30">
                {currentCalling ? 'Panggilan' : 'Pemeriksaan'}
              </div>
            )}
          </div>

          <div className="bg-slate-900 dark:bg-slate-800 rounded-[32px] p-6 md:p-10 text-center shadow-2xl shadow-slate-900/20 relative overflow-hidden group/card transition-all">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
            <div className="absolute top-0 right-0 p-6 opacity-30 group-hover/card:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-16 h-16 text-teal-500" />
            </div>
            <motion.h4 
                key={activePatient?.number || 'empty'}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-2 whitespace-nowrap"
            >
              {activePatient ? activePatient.number : '---'}
            </motion.h4>
            <p className="text-teal-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-4">
              {activePatient ? activePatient.name : 'Menunggu Panggilan Berikutnya'}
            </p>
            <div className="flex items-center justify-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest">
                <div className={activePatient ? "w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" : "w-1.5 h-1.5 rounded-full bg-slate-700 dark:bg-slate-600"} />
                {currentCalling ? 'Silakan Masuk ke Ruangan' : (currentlyTreating ? 'Sedang Diperiksa' : 'Harap Menunggu')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[32px] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-12 h-12 text-slate-800" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Antrean Berikutnya</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800 dark:text-slate-100">{waitingQueue.length}</span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Pasien</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 rounded-[32px] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-12 h-12 text-slate-800" />
          </div>
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-500" />
             </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Est. Waktu Tunggu</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800 dark:text-slate-100">~{waitingQueue.length * 15}</span>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Menit</span>
          </div>
        </motion.div>
      </div>

      <div className="bg-slate-900 rounded-[32px] p-6 border border-slate-800 shadow-xl shadow-slate-900/10">
        <div className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-[0.1em] flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping shrink-0" />
          <span>Saat ini sedang melayani pasien nomor antrean <span className="text-white font-black">{activePatient?.number || '---'}</span></span>
        </div>
      </div>
    </div>
  );
}
