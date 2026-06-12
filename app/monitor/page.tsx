'use client';

import { useRouter } from 'next/navigation';
import React, { Suspense } from 'react';
import { useClinicData } from '@/app/hooks/useClinicData';
import LiveMonitor from '@/app/components/LiveMonitor';
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp';

export default function MonitorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    }>
      <MonitorPageContent />
    </Suspense>
  );
}

function MonitorPageContent() {
  const router = useRouter();
  const app = useClinicData('monitor');
  
  const {
    queue,
    loadingAuth,
    isSyncing,
    user,
    appUser,
    clinicConfig
  } = app;

  if (loadingAuth || isSyncing || (user && !appUser)) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 transition-colors duration-500">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      <LiveMonitor queue={queue} onBack={() => router.push('/')} clinicConfig={clinicConfig} />
      <FloatingWhatsApp phoneNumber="+6282235308936" />
    </div>
  );
}
