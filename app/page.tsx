'use client';
import { useRouter } from 'next/navigation';

import React, { useState, useEffect } from 'react';
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
import ThemeToggle from '@/app/components/ThemeToggle';
import dynamic from 'next/dynamic';

const GalleryManagement = dynamic(() => import('@/app/components/admin/GalleryManagement'), { ssr: false });
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
import { Ticket, Clock, MapPin, Bot, ShieldAlert, CheckCircle2, AlertCircle, Sparkles, Activity, LayoutDashboard, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { cn, getLocalYMD } from '@/lib/utils';

export default function RootPage() {
  const router = useRouter();
  const app = useClinicData('landing');
  
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


    photos, handleAddPhoto, handleDeletePhoto,
    articles
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
  const [patientSubView, setPatientSubView] = useState<'portal' | 'gallery'>('portal');

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
    const todayQueue = queue.filter(q => q.date === getLocalYMD() && (q.status === 'WAITING' || q.status === 'CALLING' || q.status === 'TREATING'));
    mainContent = (
      <LandingPage
        onNavigate={(view) => {
           if (view === 'landing') return;
           if (view === 'clinic') {
             router.push('/admin');
           } else {
             router.push(`/${view}`);
           }
        }}
        onGallery={() => { router.push('/gallery'); }}
        isStaff={isStaff}
        queueCount={todayQueue.length}
        clinicConfig={clinicConfig}
        photos={photos || []}
        articles={articles}
      />
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
      {!(loadingAuth || isSyncing || (user && !appUser)) && (
        <FloatingWhatsApp phoneNumber="+6282235308936" />
      )}
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
                u.volume = 0.1;
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
