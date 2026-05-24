'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Clock, Ticket, Monitor } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import Image from 'next/image';
import { QueueItem } from '@/app/types';
import { cn } from '@/lib/utils';


interface TicketViewProps {
  ticket: QueueItem;
  onClose: () => void;
  onViewMonitor: () => void;
}

export default function TicketView({ ticket, onClose, onViewMonitor }: TicketViewProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!ticketRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const dataUrl = await domToPng(ticketRef.current, {
        scale: 3,
        backgroundColor: '#ffffff',
        quality: 1,
      });
      const link = document.createElement('a');
      link.download = `tiket-antrean-${ticket.number}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Gagal mengunduh tiket. Coba tangkap layar manual.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl overflow-y-auto"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative border border-white/20 transition-colors duration-300"
        >
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl z-20 transition-all text-slate-500 dark:text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>

          <div ref={ticketRef} className="p-8 pb-4 bg-white dark:bg-slate-900 transition-colors">
            <div className="relative border-[6px] border-brand-500 rounded-[32px] p-6 text-center space-y-6 overflow-hidden bg-brand-500 dark:bg-slate-900 transition-colors">
              {/* Header Decorations */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-2 bg-brand-500 rounded-b-xl" />
              
              <div className="pt-2 flex flex-col items-center">
                <div className="w-20 h-20 bg-brand-500 rounded-[1.5rem] mb-4 flex items-center justify-center relative overflow-hidden">
                  <Image src="/images/logo-ranida.png" alt="Logo" fill className="object-contain p-4" />
                </div>
                <h2 className="text-2xl font-black text-brand-500 tracking-tighter uppercase leading-none">Praktek Gigi Ranida</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Official Patient Pass</p>
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                </div>
              </div>

              <div className="relative py-4">
                <div className="absolute inset-0 bg-brand-500/5 rounded-3xl -rotate-1" />
                <div className="relative z-10 transition-transform group-hover:scale-105 duration-500">
                  <p className="text-[10px] font-black text-brand-500/60 uppercase tracking-widest mb-1">Nomor Antrean</p>
                  <div className="text-[72px] font-black text-brand-500 leading-none tracking-tighter">
                    {ticket.number}
                  </div>
                </div>
              </div>

              {/* Premium Divider */}
              <div className="relative px-2">
                 <div className="border-t-2 border-dashed border-slate-100 dark:border-slate-800 w-full transition-colors" />
              </div>

              <div className="space-y-4 px-2">
                <div className="flex justify-between items-end border-b border-slate-50 dark:border-slate-800 pb-2 transition-colors">
                  <div className="text-left">
                    <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Identitas Pasien</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">{ticket.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Waktu</span>
                    <span className="text-xs font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-lg">{ticket.time}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left transition-colors">
                   <div className="flex items-center gap-2 mb-1.5 transition-colors">
                      <Clock className="w-3 h-3 text-brand-500" />
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Detail Keluhan:</span>
                   </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed italic transition-colors">&quot;{ticket.complaint}&quot;</p>
                </div>
              </div>

              {/* Footer Patterns */}
              <div className="pt-2 opacity-30 flex justify-center gap-1.5">
                 {[1,3,2,4,2,3,1,2,5,3,2,4,1,3].map((h, i) => (
                  <div key={i} className="bg-brand-500 rounded-full" style={{ width: '2px', height: `${12 + h*2}px` }} />
                 ))}
              </div>
              
              <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Praktek Gigi Ranida • 2026</p>
            </div>
          </div>

          <div className="p-8 pt-2 space-y-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95",
                isDownloading ? "bg-slate-200 text-slate-400" : "bg-brand-500 text-white shadow-brand-900/20"
              )}
            >
              {isDownloading ? (
                 <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Simpan Ke Galeri
                </>
              )}
            </button>
            
            <button
              onClick={onViewMonitor}
              className="w-full py-3.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Monitor className="w-3.5 h-3.5" />
              Pantau Live
            </button>
            
            <p className="text-[9px] text-slate-400 text-center uppercase tracking-wider">
              Harap tunjukkan tiket ini saat tiba di resepsionis.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
