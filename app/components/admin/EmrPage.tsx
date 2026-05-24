'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Activity, ClipboardList, PenTool, StickyNote } from 'lucide-react';
import { QueueItem, OdontogramData, SoapVisit, ToothCondition, ToothSurface } from '@/app/types';
import OdontogramViewer from '../medical-record/OdontogramViewer';
import SoapForm from '../medical-record/SoapForm';
import { useCollection } from '@/app/hooks/useFirebase';
import { collection, query, where, orderBy, setDoc, doc, addDoc, serverTimestamp, db, QueryDocumentSnapshot, DocumentData } from '@/lib/firebase';
import { updateDocObj } from '@/lib/firestoreService';
import { cn, getLocalYMD } from '@/lib/utils';

interface EmrPageProps {
  patient: {
    phone: string;
    name: string;
    address?: string;
    birthDate?: string;
    medicalHistory?: string;
    allergies?: string;
    gender?: 'L' | 'P';
    id?: string; // from queue or master
  };
  onBack: () => void;
  showToast?: (message: string, type?: 'success'|'error') => void;
  requestConfirm?: (options: any) => void;
}

type TabType = 'odontogram' | 'soap' | 'notes';

export default function EmrPage({ patient, onBack, showToast, requestConfirm }: EmrPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('odontogram');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Auto-set status to TREATING when EMR is opened
  useEffect(() => {
    if (patient.id && !isUpdatingStatus) {
      const updateStatus = async () => {
        try {
          setIsUpdatingStatus(true);
          // Only update if it's currently WAITING or CALLING
          // We don't want to overwrite if it's already PAID or FINISHED
          await updateDocObj('queues', patient.id!, { 
            status: 'TREATING',
            updatedAt: serverTimestamp() 
          });
        } catch (error) {
          console.error("Failed to auto-update status to TREATING", error);
        }
      };
      updateStatus();
    }
  }, [patient.id, isUpdatingStatus]);

  // Load Odontogram Data
  const [odontogramSnap] = useCollection(
    query(collection(db, 'odontograms'), where('patientId', '==', patient.phone))
  );
  const odontogramData: OdontogramData[] = odontogramSnap 
    ? odontogramSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as OdontogramData))
    : [];

  // Load SOAP Visits
  const [visitsSnap] = useCollection(
    query(collection(db, 'visits'), where('patientId', '==', patient.phone), orderBy('date', 'desc'))
  );
  const visits: SoapVisit[] = visitsSnap
    ? visitsSnap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() } as SoapVisit))
    : [];

  // Note updates
  const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory || '');
  const [allergies, setAllergies] = useState(patient.allergies || '');

  const saveGeneralNotes = async () => {
    try {
      await setDoc(doc(db, 'patients', patient.phone), {
        medicalHistory,
        allergies,
        updatedAt: serverTimestamp()
      }, { merge: true });
      if (showToast) showToast("Catatan medis umum berhasil disimpan!", "success");
    } catch (error) {
      console.error("Failed to update general notes", error);
      if (showToast) showToast("Gagal menyimpan catatan.", "error");
    }
  };

  const handleUpdateTooth = async (toothNumber: number, condition: ToothCondition, surface?: ToothSurface, notes?: string) => {
    try {
      const existing = odontogramData.find(d => d.toothNumber === toothNumber);
      
      if (existing) {
        let updateData: any = {
          updatedAt: serverTimestamp(),
          notes: notes !== undefined ? notes : (existing.notes || '')
        };

        if (surface) {
          // Update specific surface (e.g. CAR on Oklusal)
          const newSurfaces = { ...(existing.surfaces || {}), [surface]: condition };
          updateData.surfaces = newSurfaces;
        } else {
          // Update whole tooth condition (e.g. EXT)
          updateData.condition = condition;
          // Clear surfaces if tooth is missing or extracted for clinical accuracy
          if (['MIS', 'EXT'].includes(condition)) {
             updateData.surfaces = {};
          }
        }

        await setDoc(doc(db, 'odontograms', existing.id), updateData, { merge: true });
      } else {
        // Create new record
        const newRecord: any = {
          patientId: patient.phone,
          toothNumber,
          condition: surface ? 'SOU' : condition,
          surfaces: surface ? { [surface]: condition } : {},
          notes: notes || '',
          updatedAt: serverTimestamp()
        };
        await addDoc(collection(db, 'odontograms'), newRecord);
      }
    } catch (error) {
      console.error("Failed to update odontogram", error);
      if (showToast) showToast("Gagal mengupdate kondisi gigi", "error");
    }
  };

  const handleSaveVisit = async (data: Partial<SoapVisit>) => {
    try {
      await addDoc(collection(db, 'visits'), {
        ...data,
        patientId: patient.phone,
        patientName: patient.name, // Denormalize for easier results view
        date: getLocalYMD(),
        createdAt: serverTimestamp()
      });

      // Clinical Bridge: Update Queue Item with billing info and treatment summary
      if (patient.id) {
        await updateDocObj('queues', patient.id, {
           billingAmount: data.billingAmount || 0,
           treatment: data.assessmentDescription || '',
           status: 'PAID' // Patient moves to payment phase
        });
      }

      if (showToast) showToast("Rekam medis dan data tagihan berhasil disimpan!", "success");
      setActiveTab('soap');
    } catch (error) {
      console.error("Failed to save visit", error);
      if (showToast) showToast("Gagal menyimpan rekam medis", "error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 relative custom-scrollbar transition-colors duration-300">
      {/* Header Area */}
      <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
              <Activity className="w-6 h-6 text-[#0E7490] dark:text-teal-400" />
              EMR: {patient.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1 transition-colors">
              Telp: {patient.phone} | Tgl Lahir: {patient.birthDate || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex overflow-x-auto hide-scrollbar sticky top-[77px] z-10 shadow-sm transition-colors">
        <button
          onClick={() => setActiveTab('odontogram')}
          className={cn(
            "px-6 py-4 font-black border-b-[3px] whitespace-nowrap transition-all flex items-center gap-2",
            activeTab === 'odontogram' 
              ? "border-[#0E7490] text-[#0E7490]" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <PenTool className="w-4 h-4" />
          Odontogram
        </button>
        <button
          onClick={() => setActiveTab('soap')}
          className={cn(
            "px-6 py-4 font-black border-b-[3px] whitespace-nowrap transition-all flex items-center gap-2",
            activeTab === 'soap' 
              ? "border-[#0E7490] text-[#0E7490]" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <ClipboardList className="w-4 h-4" />
          SOAP & Kunjungan
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={cn(
            "px-6 py-4 font-black border-b-[3px] whitespace-nowrap transition-all flex items-center gap-2",
            activeTab === 'notes' 
              ? "border-[#0E7490] text-[#0E7490]" 
              : "border-transparent text-slate-400 hover:text-slate-700"
          )}
        >
          <StickyNote className="w-4 h-4" />
          Catatan Umum
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'odontogram' && (
            <motion.div
              key="odontogram"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl flex items-start gap-4 transition-colors">
                 <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 transition-colors">
                   <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                 </div>
                 <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 transition-colors">Odontogram Interaktif</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed transition-colors">
                      Klik pada ikon gigi untuk mendaftarkan kondisi klinis atau tindakan yang diperlukan. Data akan otomatis tersimpan dalam Electronic Medical Record pasien ini.
                    </p>
                 </div>
              </div>
              <OdontogramViewer 
                patientId={patient.phone}
                data={odontogramData}
                onUpdateTooth={handleUpdateTooth}
              />
            </motion.div>
          )}

          {activeTab === 'soap' && (
            <motion.div
              key="soap"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-5xl mx-auto space-y-8"
            >
              {/* Form Tambah SOAP Baru */}
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4 transition-colors">
                  <ClipboardList className="w-5 h-5 text-[#0E7490] dark:text-teal-400" />
                  Tambah Kunjungan (SOAP)
                </h3>
                <SoapForm 
                  onSave={handleSaveVisit} 
                  medicalAlerts={{
                    history: medicalHistory,
                    allergies: allergies
                  }}
                  patientData={{
                    name: patient.name,
                    age: patient.birthDate ? Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : undefined,
                    gender: patient.gender,
                    medicalHistory: medicalHistory,
                    allergies: allergies,
                    odontogram: odontogramData,
                    recentVisits: visits
                  }}
                  showToast={showToast}
                />

              </div>

              {/* Riwayat SOAP */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 px-2 transition-colors">Riwayat Medis Sebelumnya</h3>
                {visits.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center transition-colors">
                    <p className="text-slate-400 dark:text-slate-500 font-bold">Belum ada riwayat kunjungan (SOAP) untuk pasien ini.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visits.map(visit => (
                      <div key={visit.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#0E7490]/30 dark:hover:border-teal-500/30 transition-all">
                        <div className="flex justify-between items-start mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black transition-colors">
                              {new Date(visit.date).getDate()}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">{new Date(visit.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long' })}</p>
                              {visit.soapTeeth && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-800 dark:bg-slate-700 text-white dark:text-slate-200 text-[10px] uppercase font-black tracking-widest rounded-md transition-colors">
                                  Tindakan Gigi: {visit.soapTeeth}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vital Signs (if any) */}
                        {visit.vitals && (
                          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                             <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors">
                               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Tensi</span>
                               <span className="font-bold text-slate-800 dark:text-slate-200">{visit.vitals.bloodPressure || '-'}</span>
                             </div>
                             <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors">
                               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Nadi</span>
                               <span className="font-bold text-slate-800 dark:text-slate-200">{visit.vitals.heartRate ? `${visit.vitals.heartRate} bpm` : '-'}</span>
                             </div>
                             <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors">
                               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Suhu</span>
                               <span className="font-bold text-slate-800 dark:text-slate-200">{visit.vitals.temperature ? `${visit.vitals.temperature} °C` : '-'}</span>
                             </div>
                             <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-colors">
                               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Nyeri</span>
                               <span className="font-bold text-slate-800 dark:text-slate-200">{visit.vitals.painScale ? `Skala ${visit.vitals.painScale}` : '-'}</span>
                             </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                             <div>
                               <span className="text-[11px] font-black text-orange-500 uppercase tracking-wider block mb-1.5 transition-colors">S (Subjective)</span>
                               <p className="text-sm text-slate-700 dark:text-slate-300 bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 transition-colors">{visit.subjective || '-'}</p>
                             </div>
                             <div>
                               <span className="text-[11px] font-black text-blue-500 uppercase tracking-wider block mb-1.5 transition-colors">O (Objective)</span>
                               <p className="text-sm text-slate-700 dark:text-slate-300 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 transition-colors">{visit.objective || '-'}</p>
                             </div>
                           </div>
                           <div className="space-y-4">
                             <div>
                               <span className="text-[11px] font-black text-red-500 uppercase tracking-wider block mb-1.5 transition-colors">A (Assessment / Diagnosis)</span>
                               <p className="text-sm text-slate-700 dark:text-slate-100 bg-red-50/50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30 font-bold transition-colors">{visit.assessmentDescription || '-'}</p>
                             </div>
                             <div>
                               <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1.5 transition-colors">P (Plan / Tindakan)</span>
                               <p className="text-sm text-slate-700 dark:text-emerald-100 bg-[#0E7490]/5 dark:bg-teal-500/10 p-4 rounded-2xl border border-[#0E7490]/10 dark:border-teal-500/20 font-bold text-[#0E7490] dark:text-teal-400 transition-colors">{visit.plan || '-'}</p>
                             </div>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-amber-50 dark:bg-amber-950/20 p-6 md:p-8 rounded-[32px] border border-amber-200/50 dark:border-amber-900/30 shadow-sm relative overflow-hidden transition-colors">
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 dark:bg-amber-900/10 rounded-bl-[100px] -mr-10 -mt-10" />
                
                <h3 className="text-lg font-black text-amber-900 dark:text-amber-400 mb-6 flex items-center gap-2 relative z-10 transition-colors">
                  <StickyNote className="w-5 h-5" />
                  Catatan Medis Khusus
                </h3>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <label className="text-[11px] font-black text-amber-700/70 dark:text-amber-500/50 uppercase tracking-widest block mb-2 transition-colors">Riwayat Penyakit Penyerta (Komorbiditas)</label>
                    <textarea
                      className="w-full p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-900 outline-none transition-all resize-y min-h-[120px] text-sm font-medium dark:text-slate-100"
                      placeholder="Contoh: Hipertensi, Diabetes, Asma..."
                      value={medicalHistory}
                      onChange={e => setMedicalHistory(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-amber-700/70 dark:text-amber-500/50 uppercase tracking-widest block mb-2 transition-colors">Alergi (Obat / Makanan)</label>
                    <textarea
                      className="w-full p-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-amber-400 dark:focus:ring-amber-900 outline-none transition-all resize-y min-h-[120px] text-sm font-medium dark:text-slate-100"
                      placeholder="Contoh: Alergi Amoxicillin, Alergi Bius..."
                      value={allergies}
                      onChange={e => setAllergies(e.target.value)}
                    />
                  </div>
                  
                  <button 
                    onClick={saveGeneralNotes}
                    className="w-full py-4 bg-amber-500 text-white font-black rounded-xl hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20"
                  >
                    SIMPAN CATATAN UMUM
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
