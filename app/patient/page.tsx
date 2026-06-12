'use client';

import { useRouter } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClinicData } from '@/app/hooks/useClinicData';

// Components
import PatientPortal from '@/app/components/PatientPortal';
import TicketView from '@/app/components/modals/TicketView';
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp';

// Shared Icons/UI
import { Home, LayoutDashboard, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function PatientPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    }>
      <PatientPageContent />
    </Suspense>
  );
}

function PatientPageContent() {
  const router = useRouter();
  const app = useClinicData('patient');
  
  const {
    activeView,
    user,
    loadingAuth,
    appUser,
    isStaff,
    isSyncing,
    toast,
    showToast,
    queue,
    sendWhatsAppNotification,
    clinicConfig
  } = app;

  const [showTicket, setShowTicket] = useState<any>(null);

  if (loadingAuth || isSyncing || (user && !appUser)) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 transition-colors duration-500">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-brand-500 flex items-center justify-center p-6 md:p-8 shadow-2xl border border-brand-500">
          <div className="relative w-full h-full">
            <Image src="/images/logo-ranida.png" alt="Logo" fill className="object-contain" priority />
          </div>
        </div>
        <div className="mt-12 text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter leading-none">
            Praktek Gigi <span className="text-[#0E7490]">Ranida</span>
          </h2>
          <div className="flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#0E7490] animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-[#0E7490] animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-[#0E7490] animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col min-h-screen">
          <nav className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 md:mb-12">
            <div className="flex items-center justify-between w-full gap-4">
              {/* Left Side: Back + Logo + Title */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button 
                  onClick={() => router.push('/')} 
                  className="sm:hidden w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm text-slate-500 hover:text-brand-500 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-brand-500 flex flex-shrink-0 items-center justify-center p-2 md:p-4 shadow-xl border border-brand-500">
                   <div className="relative w-full h-full">
                     <Image src="/images/logo-ranida.png" alt="Logo" fill className="object-contain" />
                   </div>
                </div>
                <div className="hidden min-[400px]:block">
                   <h1 className="text-sm md:text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-none">Praktek Gigi Ranida</h1>
                   <p className="text-[7px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Official Patient Portal</p>
                </div>
              </div>

              {/* Right Side: Desktop Beranda + Admin Dashboard */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button onClick={() => router.push('/')} className="hidden sm:flex px-4 md:px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] md:text-xs font-black uppercase tracking-widest items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover-lift">
                  <Home className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0E7490]" />
                  <span>BERANDA</span>
                </button>

                {isStaff && (
                  <button 
                    onClick={() => router.push('/admin')} 
                    className="w-10 h-10 md:w-14 md:h-14 bg-slate-900 dark:bg-brand-500 text-white rounded-xl md:rounded-2xl flex flex-shrink-0 items-center justify-center shadow-lg transition-transform active:scale-90"
                    title="Dashboard Admin"
                  >
                    <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                )}
              </div>
            </div>
          </nav>
          
          <div className="flex flex-col items-center justify-start flex-1 w-full mt-4 md:mt-8">
            <div className="text-center mb-10 max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter mb-4">
                Portal Pasien <span className="text-brand-500">Ranida</span>
              </h2>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                Silakan daftar antrean Anda di bawah ini, atau cek status tiket Anda jika sudah mendaftar.
              </p>
            </div>
            <div className="w-full max-w-4xl">
              <PatientPortal onShowTicket={(t) => setShowTicket(t)} queue={queue} clinicConfig={clinicConfig} sendWhatsAppNotification={sendWhatsAppNotification} showToast={showToast} />
            </div>
          </div>
        </div>
      </div>

      {/* Global Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl z-[500] flex items-center gap-3",
              toast.type === 'error' ? "bg-red-500 text-white" : "bg-slate-900 text-white"
            )}
          >
            {toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTicket && (
          <TicketView 
            ticket={showTicket} 
            onClose={() => setShowTicket(null)} 
            onViewMonitor={() => {
              if ('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance("Membuka suara");
                u.lang = 'id-ID';
                u.volume = 0.1;
                window.speechSynthesis.speak(u);
              }
              router.push('/monitor');
              setTimeout(() => setShowTicket(null), 100);
            }} 
          />
        )}
      </AnimatePresence>

      {activeView !== 'clinic' && <FloatingWhatsApp phoneNumber="+6282235308936" />}
    </div>
  );
}
