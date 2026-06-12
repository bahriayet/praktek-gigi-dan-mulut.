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
import AuditLogView from '@/app/components/admin/AuditLogView';
import ArticleManagement from '@/app/components/admin/ArticleManagement';

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
import { Ticket, Clock, MapPin, Bot, ShieldAlert, CheckCircle2, AlertCircle, Sparkles, Activity, LayoutDashboard, Image as ImageIcon, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { db, collection, addDoc, serverTimestamp, query, where, getDocs } from '@/lib/firebase';
import { updateDocObj } from '@/lib/firestoreService';
import { cn, getLocalYMD } from '@/lib/utils';

export default function AdminPage() {
  const router = useRouter();
  const app = useClinicData('clinic');
  
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
    handleUpdateUserRole, handleUpdateUserName, handleDeletePatientMaster,
    handleDeleteVisit, handleUpdateVisit,
    sendWhatsAppNotification, uploadToSupabase,
    handleFactoryReset, clinicConfig, updateClinicConfig, handleUpdateHeroImage,


    photos, handleAddPhoto, handleDeletePhoto,
    articles, handleDeleteArticle, handleUpdateArticle
  } = app;



  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [editingInventory, setEditingInventory] = useState<any>(null);
  const [viewingRecord, setViewingRecord] = useState<any>(null);
  const [editingVisit, setEditingVisit] = useState<any>(null);
  const [deletingItem, setDeletingItem] = useState<{id: string, type: 'patient'|'inventory'|'visit'|'queue'} | null>(null);
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

  const handleAdminSearch = (val: string) => {
    const lowerVal = val.toLowerCase();
    if (lowerVal.endsWith('-d')) {
      const stripped = val.slice(0, -2).trim();
      setSearchTerm(stripped);
      setAdminSubView('patients');
    } else if (lowerVal.endsWith('-r')) {
      const stripped = val.slice(0, -2).trim();
      setSearchTerm(stripped);
      setAdminSubView('records');
    } else {
      setSearchTerm(val);
    }
  };

  // Content Selection Logic
  let mainContent;

  if (loadingAuth || isSyncing || (user && !appUser)) {
    mainContent = (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8 transition-colors duration-500">
        <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[40px] bg-brand-600 flex items-center justify-center p-6 md:p-8 shadow-2xl border border-brand-500">
          <div className="relative w-full h-full">
            <Image src="/images/logo-ranida.png" alt="Logo" fill className="object-contain" priority />
          </div>
        </div>
        <div className="mt-12 text-center space-y-4">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
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
  } else if (activeView === 'clinic') {
    if (!user) {
      mainContent = (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <button 
            onClick={() => router.push('/')}
            className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
          >
            ← Beranda
          </button>
          <ClinicLogin onLogin={handleLogin} onRegister={handleRegister} />
        </div>
      );
    } else if (appUser && appUser.role === 'patient') {
      mainContent = (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 text-center max-w-md shadow-premium border border-slate-100 dark:border-slate-800">
             <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-6" />
             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Akses Ditolak</h2>
             <p className="text-sm text-slate-500 mb-8">
               Akun Anda ({user.email}) tidak memiliki izin akses sebagai Admin/Staf.
             </p>
             
             <div className="mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-left">Upgrade ke Admin</p>
                <div className="space-y-3">
                  <input 
                    id="master-upgrade-pw"
                    type="password" 
                    placeholder="Masukkan Password Master"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button 
                    onClick={async () => {
                      const pw = (document.getElementById('master-upgrade-pw') as HTMLInputElement).value;
                      if (pw === 'praktek-gigi-ranida') {
                        // Trigger sync with pending role
                        handleLogin(undefined, pw); // This will set pending role and refresh
                        showToast('Memproses upgrade role...', 'success');
                      } else {
                        showToast('Password Master Salah', 'error');
                      }
                    }}
                    className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl text-xs hover:bg-brand-700 transition-all"
                  >
                    Verifikasi & Upgrade
                  </button>
                </div>
             </div>

             <button 
                onClick={handleLogout}
                className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-slate-700 transition-all"
             >
               Keluar dari Akun
             </button>
          </div>
        </div>
      );
    } else {
      const handleNavigation = (view: View) => {
        if (view === 'landing') router.push('/');
        else if (view === 'patient') router.push('/patient');
        else if (view === 'monitor') router.push('/monitor');
        else setActiveView(view);
      };

      mainContent = (
        <main className="flex min-h-screen bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
          <AdminSidebar 
            userRole={userRole} activeSubView={adminSubView} setActiveSubView={setAdminSubView}
            setActiveView={handleNavigation} onLogout={handleLogout} showToast={showToast}
            isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onFactoryReset={handleFactoryReset}
          />
          <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <AdminTopBar 
              user={user} userRole={userRole} activeView={activeView} setActiveView={handleNavigation}
              searchTerm={searchTerm} setSearchTerm={handleAdminSearch}
              toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onOpenAiAssistant={() => setIsAiModalGlobalOpen(true)}
            />
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              <AnimatePresence mode="wait">
                {adminSubView === 'dashboard' && <ClinicDashboard key="d" queue={queue} inventory={inventory} setActiveSubView={setAdminSubView} onAddPatient={() => handleNavigation('patient')} sendWhatsAppNotification={sendWhatsAppNotification} onOpenEmr={handleOpenEmr} clinicConfig={clinicConfig} updateClinicConfig={updateClinicConfig} showToast={showToast} requestConfirm={requestConfirm} />}
                {adminSubView === 'patients' && <PatientsView key="p" patients={patients} onEdit={setEditingPatient} onDeleteMaster={(id) => setDeletingItem({id, type:'patient'})} onOpenEmr={handleOpenEmr} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
                {adminSubView === 'records' && <RecordsView key="r" visits={visits} onViewDetail={setViewingRecord} onEdit={setEditingVisit} onDelete={(id) => setDeletingItem({id, type:'visit'})} onOpenEmr={handleOpenEmr} searchTerm={searchTerm} setSearchTerm={setSearchTerm} showToast={showToast} requestConfirm={requestConfirm} />}
                {adminSubView === 'hasil-emr' && <HasilEmrView key="h" visits={visits} onOpenEmr={handleOpenEmr} searchTerm={searchTerm} setSearchTerm={setSearchTerm} sendWhatsAppNotification={sendWhatsAppNotification} showToast={showToast} requestConfirm={requestConfirm} />}
                {adminSubView === 'gallery' && (
                  <div className="min-h-[400px]">
                    <GalleryManagement 
                      key="g" 
                      photos={photos || []} 
                      onAdd={handleAddPhoto} 
                      onDelete={handleDeletePhoto} 
                      onUpload={uploadToSupabase} 
                      heroImageUrl={clinicConfig?.heroImageUrl}
                      onUpdateHero={handleUpdateHeroImage}
                      showToast={showToast}
                      requestConfirm={requestConfirm}
                    />

                  </div>
                )}




                {adminSubView === 'emr' && managingEmr && <EmrPage key="e" patient={managingEmr} onBack={handleCloseEmr} showToast={showToast} requestConfirm={requestConfirm} />}
                {adminSubView === 'inventory' && <InventoryView key="i" inventory={inventory} onEdit={setEditingInventory} onDelete={(id) => setDeletingItem({id, type:'inventory'})} onAdd={() => setEditingInventory({} as any)} />}
                {adminSubView === 'finance' && <FinanceView key="f" finishedQueue={queue} onAdd={() => setAdminSubView('dashboard')} onEdit={setEditingVisit} onDelete={(id) => setDeletingItem({id, type:'queue'})} searchTerm={searchTerm} setSearchTerm={setSearchTerm} showToast={showToast} requestConfirm={requestConfirm} />}
                {adminSubView === 'staff' && <StaffView key="s" users={users} onUpdateRole={handleUpdateUserRole} onUpdateName={handleUpdateUserName} showToast={showToast} requestConfirm={requestConfirm} />}
                {adminSubView === 'articles' && (
                  <ArticleManagement 
                    key="art" 
                    articles={articles} 
                    onDelete={handleDeleteArticle} 
                    onUpdate={handleUpdateArticle} 
                    showToast={showToast} 
                    requestConfirm={requestConfirm} 
                  />
                )}
                {adminSubView === 'audit-log' && <AuditLogView key="a" showToast={showToast} requestConfirm={requestConfirm} />}
              </AnimatePresence>
            </div>
          </div>
        </main>
      );
    }
  } else {
    // Fallback if somehow activeView is wrong, though shouldn't happen
    mainContent = null;
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

    </div>
  );

  function renderModals() {
    return (
      <AnimatePresence>
        {editingPatient && <EditPatientModal patient={editingPatient} onSave={(data) => handleUpdatePatient(editingPatient.id!, data)} onClose={() => setEditingPatient(null)} />}
        {editingInventory && <EditInventoryModal item={editingInventory} onSave={(data) => handleUpdateInventory(editingInventory.id!, data)} onClose={() => setEditingInventory(null)} />}
        {viewingRecord && <RecordDetailModal record={viewingRecord} onClose={() => setViewingRecord(null)} sendWhatsAppNotification={sendWhatsAppNotification} />}
        {editingVisit && (
          <EditVisitModal 
            visit={editingVisit} 
            onSave={async (data) => {
              const toYMD = (dateStr: string) => {
                if (!dateStr) return '';
                if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
                try {
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return dateStr;
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  return `${year}-${month}-${day}`;
                } catch (e) {
                  return dateStr;
                }
              };

              const patientPhone = editingVisit.phone || editingVisit.patientId;
              const targetDateYMD = toYMD(editingVisit.date);

              if (adminSubView === 'finance') {
                // 1. Update queue item in queues collection
                await updateDocObj('queues', editingVisit.id!, {
                  billingAmount: data.billingAmount,
                  treatment: data.assessmentDescription || data.plan || ''
                });
                showToast('Transaksi keuangan diupdate');

                // 2. Query and sync matching visit document in visits collection
                try {
                  const q = query(
                    collection(db, 'visits'),
                    where('patientId', '==', patientPhone)
                  );
                  const snap = await getDocs(q);
                  const matchingDoc = snap.docs.find(d => toYMD(d.data().date) === targetDateYMD);
                  if (matchingDoc) {
                    await updateDocObj('visits', matchingDoc.id, {
                      billingAmount: data.billingAmount,
                      assessmentDescription: data.assessmentDescription || '',
                      plan: data.plan || ''
                    });
                  }
                } catch (e) {
                  console.error("Gagal sinkronisasi data keuangan ke visits:", e);
                }
              } else {
                // 1. Update visit in visits collection
                await handleUpdateVisit(editingVisit.id!, data);

                // 2. Query and sync matching queue item in queues collection
                try {
                  const q = query(
                    collection(db, 'queues'),
                    where('phone', '==', patientPhone)
                  );
                  const snap = await getDocs(q);
                  const matchingDoc = snap.docs.find(d => toYMD(d.data().date) === targetDateYMD);
                  if (matchingDoc) {
                    await updateDocObj('queues', matchingDoc.id, {
                      billingAmount: data.billingAmount,
                      treatment: data.assessmentDescription || data.plan || ''
                    });
                  }
                } catch (e) {
                  console.error("Gagal sinkronisasi data rekam medis ke queues:", e);
                }
              }
              setEditingVisit(null);
            }} 
            onClose={() => setEditingVisit(null)} 
          />
        )}
        {showTicket && (
          <TicketView 
            ticket={showTicket} 
            onClose={() => setShowTicket(null)} 
            onViewMonitor={() => {
              setShowTicket(null);
              router.push('/monitor');
            }} 
          />
        )}
        {deletingItem && (
          <ConfirmDeleteModal 
            title={`Hapus ${deletingItem.type === 'patient' ? 'Pasien' : deletingItem.type === 'inventory' ? 'Item' : deletingItem.type === 'queue' ? 'Transaksi' : 'Kunjungan'}?`}
            description={`Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.`}
            onConfirm={async () => {
              if (deletingItem.type === 'patient') await handleDeletePatientMaster(deletingItem.id);
              else if (deletingItem.type === 'inventory') await handleDeleteInventory(deletingItem.id);
              else if (deletingItem.type === 'queue') await handleDeletePatient(deletingItem.id);
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
