'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Activity, ClipboardList, MapPin } from 'lucide-react';
import { QueueItem, OdontogramData, SoapVisit, ToothCondition, ToothSurface } from '@/app/types';
import OdontogramViewer from '../medical-record/OdontogramViewer';
import SoapForm from '../medical-record/SoapForm';
import { useCollection } from '@/app/hooks/useFirebase';
import { collection, query, where, orderBy, setDoc, doc, addDoc, serverTimestamp, db, QueryDocumentSnapshot, DocumentData } from '@/lib/firebase';
import { updateDocObj } from '@/lib/firestoreService';
import { cn } from '@/lib/utils';

interface MedicalRecordModalProps {
  patient: {
    phone: string;
    name: string;
    address?: string;
    birthDate?: string;
    medicalHistory?: string;
    allergies?: string;
    id?: string;
  };
  onClose: () => void;
}

type TabType = 'odontogram' | 'soap';

export default function MedicalRecordModal({ patient, onClose }: MedicalRecordModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('odontogram');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleUpdateTooth = async (toothNumber: number, condition: ToothCondition, surface?: ToothSurface, notes?: string) => {
    try {
      // Cari apakah sudah ada data untuk gigi ini
      const existing = odontogramData.find(d => d.toothNumber === toothNumber);
      
      if (existing) {
        let updateData: any = {
          updatedAt: serverTimestamp(),
          notes: notes !== undefined ? notes : (existing.notes || '')
        };

        if (surface) {
          // Update specific surface
          updateData[`surfaces.${surface}`] = condition;
        } else {
          // Update whole tooth condition
          updateData.condition = condition;
          // If setting to a non-surface condition like MIS/EXT, maybe clear surfaces?
          // For now just set the main condition.
        }

        await setDoc(doc(db, 'odontograms', existing.id), updateData, { merge: true });
      } else {
        await addDoc(collection(db, 'odontograms'), {
          patientId: patient.phone,
          toothNumber,
          condition: surface ? 'SOU' : condition,
          surfaces: surface ? { [surface]: condition } : {},
          notes: notes || '',
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Failed to update odontogram", error);
      alert("Gagal mengupdate kondisi gigi");
    }
  };

  const handleSaveVisit = async (data: Partial<SoapVisit>) => {
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'visits'), {
        ...data,
        patientId: patient.phone,
        patientName: patient.name,
        address: patient.address,
        date: new Date().toISOString(),
        createdAt: serverTimestamp()
      });
      alert("Catatan medis berhasil disimpan!");
      // Switch back to odontogram or just leave it? We can leave it on soap tab.
    } catch (error) {
      console.error("Failed to save visit", error);
      alert("Gagal menyimpan rekam medis");
    } finally {
      setIsSaving(false);
    }
  };

  // Local state for basic patient medical history updates
  const [medicalHistory, setMedicalHistory] = useState(patient.medicalHistory || '');
  const saveMedicalHistory = async () => {
    if (medicalHistory !== patient.medicalHistory) {
      // Update queue item if it has an ID
      if (patient.id && activeTab === 'odontogram') { // simplistic check
         try { await updateDocObj('queues', patient.id, { medicalHistory }); } catch(e) {}
      }
      
      // Update master patient record
      try {
        await setDoc(doc(db, 'patients', patient.phone), {
          medicalHistory,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error("Failed to update master patient history", error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-slate-100 dark:bg-slate-950 w-full max-w-5xl h-[95vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-colors duration-300"
      >
        {/* Header */}
        <div className="bg-[#0E7490] p-4 md:p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 md:w-6 md:h-6" /> 
              Rekam Medis: {patient.name}
            </h3>
            <p className="text-xs md:text-sm text-emerald-100 font-medium mt-1">
              Alamat: {patient.address || '-'} | Tgl Lahir: {patient.birthDate || '-'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all bg-white/5">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-slate-900 px-4 pt-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex overflow-x-auto hide-scrollbar transition-colors">
          <button
            onClick={() => setActiveTab('odontogram')}
            className={cn(
              "px-6 py-3 font-bold border-b-2 whitespace-nowrap transition-all",
              activeTab === 'odontogram' 
                ? "border-[#0E7490] dark:border-teal-400 text-[#0E7490] dark:text-teal-400" 
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            Odontogram
          </button>
          <button
            onClick={() => setActiveTab('soap')}
            className={cn(
              "px-6 py-3 font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2",
              activeTab === 'soap' 
                ? "border-emerald-600 dark:border-teal-400 text-emerald-600 dark:text-teal-400" 
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
            )}
          >
            Riwayat SOAP
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-full text-[10px] transition-colors">
              {visits.length} Kunjungan
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'odontogram' && (
              <motion.div
                key="odontogram"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Riwayat Alergi / Umum */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2 transition-colors">Riwayat Medis Umum / Alergi</label>
                  <textarea
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    onBlur={saveMedicalHistory}
                    placeholder="Contoh: Alergi Amoxicillin, Asma, Diabetes..."
                    className="w-full text-sm p-3 bg-red-50/30 dark:bg-rose-950/20 border border-red-100 dark:border-rose-900/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00685d]/30 dark:focus:ring-teal-500/30 min-h-[60px] dark:text-rose-200 dark:placeholder:text-rose-900 transition-colors duration-300"
                  />
                </div>

                {/* Kunjungan Terakhir Preview */}
                {visits.length > 0 && (
                  <div className="bg-emerald-50/50 dark:bg-teal-900/10 p-4 rounded-2xl border border-emerald-100/50 dark:border-teal-900/30 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-[11px] font-bold text-emerald-700 dark:text-teal-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
                        <Activity className="w-3.5 h-3.5" />
                        Ringkasan Kunjungan Terakhir
                      </label>
                      <button 
                        onClick={() => setActiveTab('soap')}
                        className="text-[10px] font-bold text-[#0E7490] dark:text-teal-400 hover:underline uppercase tracking-tighter transition-colors"
                      >
                        Lihat Semua Riwayat ({visits.length})
                      </button>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-emerald-100 dark:border-teal-900/30 transition-colors">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 transition-colors">
                        {new Date(visits[0].date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-800 transition-colors">
                        {visits[0].vitals?.bloodPressure && (
                          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            TD: <span className="text-slate-800 dark:text-slate-100">{visits[0].vitals.bloodPressure}</span>
                          </div>
                        )}
                        {visits[0].vitals?.temperature && (
                          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Suhu: <span className="text-slate-800 dark:text-slate-100">{visits[0].vitals.temperature}°C</span>
                          </div>
                        )}
                        {visits[0].vitals?.heartRate && (
                          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Nadi: <span className="text-slate-800 dark:text-slate-100">{visits[0].vitals.heartRate}</span>
                          </div>
                        )}
                         {visits[0].soapTeeth && (
                          <div className="text-[10px] font-bold text-rose-600">
                            Gigi: <span className="text-rose-700">{visits[0].soapTeeth}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 transition-colors"><span className="font-bold text-slate-800 dark:text-slate-100 transition-colors">Diagnosis:</span> {visits[0].assessmentDescription || '-'}</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2 mt-1 transition-colors"><span className="font-bold text-slate-800 dark:text-slate-100 transition-colors">Rencana/Plan:</span> {visits[0].plan || '-'}</p>
                    </div>
                  </div>
                )}

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
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Form Tambah Kunjungan Baru */}
                <div className="order-2 lg:order-1">
                  <SoapForm 
                    onSave={handleSaveVisit} 
                    isLoading={isSaving}
                    medicalAlerts={{
                      history: medicalHistory,
                      allergies: patient.allergies
                    }}
                  />
                  {isSaving && <p className="text-sm font-bold text-[#0E7490] dark:text-teal-400 mt-2 animate-pulse text-center transition-colors">Menyimpan catatan...</p>}
                </div>

                {/* Histori Kunjungan Sebelumnya */}
                <div className="order-1 lg:order-2 space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 border-b dark:border-slate-800 pb-2 transition-colors">Riwayat Kunjungan Sebelumnya</h4>
                  {visits.length === 0 ? (
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 border-dashed p-8 text-center text-slate-500 dark:text-slate-600 transition-colors">
                      <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="font-semibold text-sm">Belum ada riwayat medis (SOAP).</p>
                    </div>
                  ) : (
                    <div className="space-y-4 pr-1">
                      {visits.map(visit => (
                        <div key={visit.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm group hover:shadow-md dark:hover:border-teal-500/30 transition-all">
                          <div className="flex items-center gap-2 mb-3 border-b border-slate-100 dark:border-slate-800 pb-2 transition-colors">
                            <Calendar className="w-4 h-4 text-emerald-600 dark:text-teal-500" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                              {new Date(visit.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                          
                          <div className="space-y-4 text-sm">
                            {/* Vitals Summary in History */}
                            {visit.vitals && (visit.vitals.bloodPressure || visit.vitals.temperature) && (
                              <div className="flex flex-wrap gap-x-4 gap-y-1 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 mb-1 transition-colors">
                                {visit.vitals.bloodPressure && (
                                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">TD: <span className="text-slate-800 dark:text-slate-100">{visit.vitals.bloodPressure}</span></div>
                                )}
                                {visit.vitals.temperature && (
                                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Suhu: <span className="text-slate-800 dark:text-slate-100">{visit.vitals.temperature}°C</span></div>
                                )}
                                {visit.vitals.heartRate && (
                                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Nadi: <span className="text-slate-800 dark:text-slate-100">{visit.vitals.heartRate}</span></div>
                                )}
                                {visit.vitals.respiratoryRate && (
                                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">RR: <span className="text-slate-800 dark:text-slate-100">{visit.vitals.respiratoryRate}</span></div>
                                )}
                              </div>
                            )}

                            {(['subjective', 'objective', 'intraOral', 'assessmentDescription', 'soapTeeth', 'plan'] as const).map(field => {
                              // Special handling for IntraOral object
                              if (field === 'intraOral' && visit.intraOral) {
                                const findings = Object.entries(visit.intraOral)
                                  .filter(([_, val]) => val && val.toLowerCase() !== 'normal')
                                  .map(([key, val]) => `${key}: ${val}`);
                                
                                if (findings.length === 0) return null;

                                return (
                                  <div key={field} className="grid grid-cols-[20px_1fr] gap-2 items-start">
                                    <div className="w-5 h-5 rounded flex items-center justify-center font-black text-[10px] bg-emerald-50 dark:bg-teal-900/30 text-emerald-600 dark:text-teal-400 border border-emerald-100 dark:border-teal-900/50 transition-colors">
                                      IO
                                    </div>
                                    <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug pt-0.5 transition-colors">
                                      <span className="font-bold text-slate-800 dark:text-slate-200 transition-colors">Intraoral:</span> {findings.join(', ')}
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={field} className="grid grid-cols-[20px_1fr] gap-2 items-start">
                                  <div className={cn(
                                    "w-5 h-5 rounded flex items-center justify-center font-black text-[10px] transition-colors",
                                    field === 'subjective' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" :
                                    field === 'objective' ? "bg-emerald-100 dark:bg-teal-900/30 text-emerald-700 dark:text-teal-400" :
                                    field === 'assessmentDescription' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" :
                                    field === 'soapTeeth' ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400" :
                                    "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                                  )}>
                                    {field === 'soapTeeth' ? 'G' : field.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="text-slate-600 dark:text-slate-400 leading-snug pt-0.5 transition-colors">
                                    {field === 'soapTeeth' ? (
                                      <><span className="font-bold text-slate-800 dark:text-slate-200 transition-colors">Gigi:</span> {visit.soapTeeth || '-'}</>
                                    ) : field === 'assessmentDescription' && visit.assessmentIcd10 ? (
                                      <><span className="font-bold text-slate-800 dark:text-slate-200 transition-colors">[{visit.assessmentIcd10}]</span> {visit.assessmentDescription}</>
                                    ) : (
                                      (visit as any)[field] || '-'
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                            {visit.address && (
                              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                                <MapPin className="w-3.5 h-3.5 text-[#0E7490] dark:text-teal-500" />
                                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                  {visit.address}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
