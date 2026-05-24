'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useClinicData } from '@/app/hooks/useClinicData';
import Image from 'next/image';
import { ChevronLeft, Ticket, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/app/components/ThemeToggle';

import dynamic from 'next/dynamic';
const ClinicGallery = dynamic(() => import('@/app/components/ClinicGallery'), { ssr: false });

export default function GalleryPage() {
  const router = useRouter();
  const app = useClinicData('landing');
  const { photos, isStaff, loadingAuth, isSyncing, user, appUser } = app;

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Navigation */}
        <nav className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 md:mb-12">
          <div className="flex items-center justify-between w-full gap-4">
            {/* Left: Back + Logo + Title */}
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
                <p className="text-[7px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Galeri Fasilitas Klinik</p>
              </div>
            </div>

            {/* Right: Beranda + Daftar Antrean */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button onClick={() => router.push('/')} className="hidden sm:flex px-4 md:px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] md:text-xs font-black uppercase tracking-widest items-center justify-center gap-2 text-slate-600 dark:text-slate-400 hover-lift">
                <Ticket className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0E7490]" />
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

        {/* Gallery Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1"
        >
          <ClinicGallery images={photos} />
        </motion.div>
      </div>
    </div>
  );
}
