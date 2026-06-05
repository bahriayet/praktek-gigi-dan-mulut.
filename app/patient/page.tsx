'use client';
import { useRouter } from 'next/navigation';

import React, { useState, useEffect, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useClinicData } from '@/app/hooks/useClinicData';
import { View } from '@/app/types';

// Components
import ClinicLogin from '@/app/components/ClinicLogin';
import LiveMonitor from '@/app/components/LiveMonitor';
import PatientPortal from '@/app/components/PatientPortal';
import LandingPage from '@/app/components/LandingPage';

import AdminSidebar from '@/app/components/admin/AdminSidebar';
import AdminTopBar from '@/app/components/admin/AdminTopBar';
import ClinicDashboard from '@/app/components/admin/ClinicDashboard';
import PatientsView from '@/app/components/admin/PatientsView';
import RecordsView from '@/app/components/admin/RecordsView';
import InventoryView from '@/app/components/admin/InventoryView';
import FinanceView from '@/app/components/admin/FinanceView';
import StaffView from '@/app/components/admin/StaffView';
import EmrPage from '@/app/components/admin/EmrPage';
import HasilEmrView from '@/app/components/admin/HasilEmrView';

const GalleryManagement = dynamic(() => import('@/app/components/admin/GalleryManagement'), { ssr: false });


import ThemeToggle from '@/app/components/ThemeToggle';

import dynamic from 'next/dynamic';

const DoctorAiAssistant = dynamic(() => import('@/app/components/admin/DoctorAiAssistant'), { ssr: false });
const ClinicGallery = dynamic(() => import('@/app/components/ClinicGallery'), { ssr: false });



// Modals
import EditPatientModal from '@/app/components/modals/EditPatientModal';
import EditInventoryModal from '@/app/components/modals/EditInventoryModal';
import RecordDetailModal from '@/app/components/modals/RecordDetailModal';
import ConfirmDeleteModal from '@/app/components/modals/ConfirmDeleteModal';
import TicketView from '@/app/components/modals/TicketView';
import EditVisitModal from '@/app/components/modals/EditVisitModal';
import FloatingWhatsApp from '@/app/components/FloatingWhatsApp';
import ConfirmModal from '@/app/components/modals/ConfirmModal';

// Shared Icons/UI
import { Home, Clock, MapPin, Bot, ShieldAlert, CheckCircle2, AlertCircle, Sparkles, Activity, LayoutDashboard, Image as ImageIcon, ChevronLeft, Ticket } from 'lucide-react';
import Image from 'next/image';
import { cn, getLocalYMD } from '@/lib/utils';

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
    activeView, setActiveView,
    adminSubView, setAdminSubView,
    isSidebarOpen, setIsSidebarOpen,
    user, loadingAuth, appUser, userRole, isStaff, isSyncing,
    toast, setToast, showToast,
    queue, inventory, users, patients, visits,
    handleLogin, handleRegister, handleLogout,
    handleDeletePatient, handleUpdatePatient,
    handleDeleteInventory, handleUpdateInventory,
    handleUpdateUserRole, handleDeletePatientMaster,
    handleDeleteVisit, handleUpdateVisit,
    sendWhatsAppNotification, uploadToSupabase,
    handleFactoryReset, clinicConfig, updateClinicConfig, handleUpdateHeroImage,


    photos, handleAddPhoto, handleDeletePhoto
  } = app;



  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [editingInventory, setEditingInventory] = useState<any>(null);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: 'patient'|'inventory'|'visit'} | null>(null);
  const [showTicket, setShowTicket] = useState<any>(null);
  const [managingEmr, setManagingEmr] = useState<any>(null);
  const [isAiModalGlobalOpen, setIsAiModalGlobalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  } | null>(null);

  const requestConfirm = (options: {
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
  }) => {
    setConfirmDialog(options);
  };

  const [lastMainView, setLastMainView] = useState<View>('landing');

  // Track the last "main" view (landing, patient or clinic) to handle the back button from monitor
  useEffect(() => {
    if (activeView === 'landing' || activeView === 'patient' || activeView === 'clinic') {
      setLastMainView(activeView);
    }
  }, [activeView]);


  const handleOpenEmr = (p: any) => {
    setManagingEmr(p);
    setAdminSubView('emr');
  };

  const handleCloseEmr = () => {
    setManagingEmr(null);
    setAdminSubView('dashboard');
  };

  // Content Selection Logic
  let mainContent;

  if (loadingAuth || isSyncing || (user && !appUser)) {
    mainContent = (
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
  } else {
    mainContent = (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col min-h-screen">
          <nav className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 md:mb-12">
          {/* Header Section: Logo + Title + Mobile ThemeToggle */}
          {/* Spaced Row Layout for both Mobile & Desktop */}
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
    );
  }


  return (
    <div className="relative">
      {mainContent}
      
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


      {renderModals()}
      {confirmDialog && (
        <ConfirmModal
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
          onClose={() => setConfirmDialog(null)}
          confirmText={confirmDialog.confirmText}
          cancelText={confirmDialog.cancelText}
          isDestructive={confirmDialog.isDestructive}
        />
      )}
      {activeView !== 'clinic' && <FloatingWhatsApp phoneNumber="+6282235308936" />}
    </div>
  );

  function renderModals() {
    return (
      <AnimatePresence>
        {editingPatient && <EditPatientModal patient={editingPatient} onSave={(data) => handleUpdatePatient(editingPatient.id!, data)} onClose={() => setEditingPatient(null)} />}
        {editingInventory && <EditInventoryModal item={editingInventory} onSave={(data) => handleUpdateInventory(editingInventory.id!, data)} onClose={() => setEditingInventory(null)} />}
        {viewingRecord && <RecordDetailModal record={viewingRecord} onClose={() => setViewingRecord(null)} sendWhatsAppNotification={sendWhatsAppNotification} />}
        {editingVisit && <EditVisitModal visit={editingVisit} onSave={(data) => handleUpdateVisit(editingVisit.id!, data)} onClose={() => setEditingVisit(null)} />}
        {showTicket && (
          <TicketView 
            ticket={showTicket} 
            onClose={() => setShowTicket(null)} 
            onViewMonitor={() => {
              // Membuka kunci suara browser saat navigasi
              if ('speechSynthesis' in window) {
                const u = new SpeechSynthesisUtterance("Membuka suara");
                u.lang = 'id-ID';
                u.volume = 0.1; // Suara pelan saja saat aktivasi
                window.speechSynthesis.speak(u);
              }
              router.push('/monitor');
              setTimeout(() => setShowTicket(null), 100);
            }} 
          />
        )}
        {deletingItem && (
          <ConfirmDeleteModal 
            title={`Hapus ${deletingItem.type === 'patient' ? 'Pasien' : deletingItem.type === 'inventory' ? 'Item' : 'Kunjungan'}?`}
            description={`Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.`}
            onConfirm={async () => {
              if (deletingItem.type === 'patient') await handleDeletePatientMaster(deletingItem.id);
              else if (deletingItem.type === 'inventory') await handleDeleteInventory(deletingItem.id);
              else await handleDeleteVisit(deletingItem.id);
              setDeletingItem(null);
            }}
            onClose={() => setDeletingItem(null)}
          />
        )}
        {isAiModalGlobalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
             <div className="w-full max-w-4xl h-[80vh] relative">
               <button onClick={() => setIsAiModalGlobalOpen(false)} className="absolute -top-12 right-0 text-white p-2 hover:bg-white/10 rounded-full transition-colors"><ShieldAlert className="w-6 h-6 rotate-45" /></button>
               <DoctorAiAssistant 
                  isOpen={isAiModalGlobalOpen} 
                  onClose={() => setIsAiModalGlobalOpen(false)} 
                  patientData={{ name: 'Clinical Context' }} 
                  onApply={() => {}} 
               />
             </div>
          </div>
        )}
      </AnimatePresence>
    );
  }
}
