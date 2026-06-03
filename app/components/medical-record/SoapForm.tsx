'use client';

import React, { useState } from 'react';
import { SoapVisit, Vitals, IntraOralExam } from '@/app/types';
import { Search, Activity, Eye, FileText, ClipboardList, Bot, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const POPULAR_ICD10 = [
  { code: 'K00.6', name: 'Disturbances in tooth eruption', desc: 'Gangguan erupsi gigi / gigi susu belum lepas' },
  { code: 'K01.1', name: 'Impacted teeth', desc: 'Gigi bungsu terpendam atau tumbuh miring' },
  { code: 'K02', name: 'Karies gigi', desc: 'Gigi berlubang, ngilu saat makan manis/dingin' },
  { code: 'K03', name: 'Other diseases of hard tissues of teeth', desc: 'Abrasi, erosi, hipersensitivitas gigi' },
  { code: 'K04', name: 'Penyakit Pulpa dan jaringan periapikal', desc: 'Pulpitis, nekrosis pulpa, abses periapikal' },
  { code: 'K05', name: 'Penyakit gusi dan periodontal', desc: 'Gingivitis, periodontitis, gusi berdarah/bengkak' },
  { code: 'K07', name: 'Dentofacial anomalies', desc: 'Maloklusi, gangguan TMJ, sakit sendi rahang' },
  { code: 'K08', name: 'Gangguan gigi dan jaringan penunjang lainnya', desc: 'Kehilangan gigi, edentulous, perlu gigi tiruan' },
  { code: 'K12', name: 'Stomatitis and related lesions', desc: 'Sariawan, luka di mulut yang berulang' },
  { code: 'K13.0', name: 'Diseases of lips', desc: 'Cheilitis, bibir pecah-pecah, luka sudut mulut' },
  { code: 'L51', name: 'Erythema multiforme', desc: 'Lesi target di kulit dengan luka oral luas' },
  { code: 'R51', name: 'Sakit kepala', desc: 'Nyeri kepala yang berhubungan dengan area dental' },
  { code: 'S02.5', name: 'Fracture of tooth', desc: 'Gigi patah/retak akibat trauma atau benturan' }
];

export const DENTAL_PROCEDURES = [
  { id: 'scaling', name: 'Scaling & Polishing', category: 'Preventif', icon: '✨', price: 250000 },
  { id: 'filling_comp', name: 'Tambalan Composite (Light Cure)', category: 'Konservasi', icon: '🦷', price: 350000 },
  { id: 'filling_gic', name: 'Tambalan GIC', category: 'Konservasi', icon: '🦷', price: 200000 },
  { id: 'extraction_perm', name: 'Pencabutan Gigi Permanen', category: 'Bedah', icon: '💉', price: 300000 },
  { id: 'extraction_decid', name: 'Pencabutan Gigi Susu', category: 'Bedah', icon: '💉', price: 150000 },
  { id: 'extraction_comp', name: 'Pencabutan Komplikasi/Odontektomi', category: 'Bedah', icon: '🔪', price: 1500000 },
  { id: 'rct_open', name: 'PSA - Open Bur / Trepanasi', category: 'Konservasi', icon: '🔋', price: 200000 },
  { id: 'rct_prep', name: 'PSA - Preparasi Saluran Akar', category: 'Konservasi', icon: '🧹', price: 250000 },
  { id: 'rct_obtu', name: 'PSA - Obturasi / Pengisian', category: 'Konservasi', icon: '🏁', price: 300000 },
  { id: 'denture_rem', name: 'Gigi Tiruan Lepasan (per rahang)', category: 'Prostodonti', icon: '😁', price: 1000000 },
  { id: 'medication', name: 'Pemberian Obat Saja', category: 'Medikasi', icon: '💊', price: 50000 },
];

interface SoapFormProps {
  initialData?: Partial<SoapVisit>;
  medicalAlerts?: {
    history?: string;
    allergies?: string;
  };
  onSave: (data: Partial<SoapVisit>) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  patientData?: {
    name: string;
    age?: number;
    gender?: 'L' | 'P';
    medicalHistory?: string;
    allergies?: string;
    odontogram?: any[];
    recentVisits?: any[];
  };
  showToast?: (message: string, type?: 'success'|'error') => void;
}


import DoctorAiAssistant from '@/app/components/admin/DoctorAiAssistant';

export default function SoapForm({ initialData = {}, medicalAlerts, onSave, readOnly = false, isLoading = false, patientData, showToast }: SoapFormProps) {
  const [formData, setFormData] = useState<Partial<SoapVisit>>({
    subjective: initialData.subjective || '',
    vitals: initialData.vitals || { bloodPressure: '', heartRate: '', respiratoryRate: '', temperature: '', painScale: '' },
    intraOral: initialData.intraOral || { mucosa: '', gingiva: '', palatum: '', tongue: '', tonsils: '' },
    objective: initialData.objective || '',
    assessmentIcd10: initialData.assessmentIcd10 || '',
    assessmentDescription: initialData.assessmentDescription || '',
    plan: initialData.plan || '',
    soapTeeth: initialData.soapTeeth || '',
    billingAmount: initialData.billingAmount || 0,
  });

  const [activeTab, setActiveTab] = useState<'anamnesa' | 'fisik' | 'diagnosis'>('anamnesa');
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);
  const [icdSearch, setIcdSearch] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [aiResult, setAiResult] = useState<{
    diagnosa: string;
    confidence: string;
    plan: string;
    rawInput: any;
  } | null>(null);

  // State for AI Assistant


  const filteredIcd10 = POPULAR_ICD10.filter(item => 
    item.code.toLowerCase().includes(icdSearch.toLowerCase()) || 
    item.name.toLowerCase().includes(icdSearch.toLowerCase())
  );

  const handleChange = (field: keyof SoapVisit, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVitalChange = (field: keyof Vitals, value: string) => {
    setFormData(prev => ({
      ...prev,
      vitals: { ...prev.vitals, [field]: value }
    }));
  };

  const handleIntraOralChange = (field: keyof IntraOralExam, value: string) => {
    setFormData(prev => ({
      ...prev,
      intraOral: { ...prev.intraOral, [field]: value }
    }));
  };

  const handleSelectIcd = (code: string, name: string) => {
    setFormData(prev => ({
      ...prev,
      assessmentIcd10: code,
      assessmentDescription: name
    }));
    setIcdSearch("");
    setShowIcdDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Fungsi untuk memanggil AI Python (Flask) buatan Anda
  const handleCekDiagnosaAI = async () => {
    try {
      setIsAiThinking(true);
      setAiResult(null);
      
      const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://127.0.0.1:5000/diagnosa';
      
      const payload = {
        umur: patientData?.age || 30,
        jenis_kelamin: patientData?.gender || 'L',
        tekanan_darah: formData.vitals?.bloodPressure || '120/80',
        keluhan: formData.subjective,
        temuan: formData.objective
      };

      const response = await fetch(FLASK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const hasil = await response.json();
      
      if (hasil.status === 'error') {
        throw new Error(hasil.message);
      }
      
      const aiDiagnosa = hasil.diagnosa || "Diagnosa tidak terdeteksi";
      const aiPlan = hasil.plan || "";
      const confidence = hasil.confidence || "0%";
      
      setAiResult({
        diagnosa: aiDiagnosa,
        confidence: confidence,
        plan: aiPlan,
        rawInput: payload
      });

      // Cari kode ICD-10 yang cocok
      const matchedIcd = POPULAR_ICD10.find(
         item => item.name.toLowerCase() === aiDiagnosa.toLowerCase() || 
                 aiDiagnosa.toLowerCase().includes(item.name.toLowerCase())
      );

      // Update form secara otomatis
      setFormData(prev => ({
        ...prev,
        assessmentDescription: aiDiagnosa,
        ...(aiPlan ? { plan: aiPlan } : {}),
        ...(matchedIcd ? { assessmentIcd10: matchedIcd.code } : {})
      }));

    } catch (error: any) {
      console.error("Gagal terhubung ke AI:", error);
      if (showToast) showToast(`Gagal terhubung ke Server AI: ${error.message || 'Pastikan server sudah berjalan'}`, 'error');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSendAiFeedback = async () => {
    if (!aiResult) return;
    
    setIsSendingFeedback(true);
    try {
      const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://127.0.0.1:5000/diagnosa';
      const FLASK_FEEDBACK_URL = FLASK_API_URL.replace('/diagnosa', '/feedback');
      const response = await fetch(FLASK_FEEDBACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...aiResult.rawInput,
          diagnosa_ai: aiResult.diagnosa,
          diagnosa_benar: formData.assessmentDescription,
          perawatan_benar: formData.plan
        })
      });
      
      if (response.ok) {
        setFeedbackSent(true);
        if (showToast) showToast("✅ Terima kasih! Koreksi Anda telah disimpan untuk meningkatkan kecerdasan AI Ranida.", "success");
        setTimeout(() => setFeedbackSent(false), 3000);
      }
    } catch (e) {
      console.error("Gagal mengirim feedback:", e);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
      {/* Clinical Alert Banner */}
      {(medicalAlerts?.history || medicalAlerts?.allergies) && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border-b border-rose-100 dark:border-rose-900/30 p-4 flex items-center gap-4 transition-colors">
          <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0 animate-pulse">
            <Activity className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
               <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded uppercase tracking-widest">Medical Alert</span>
               {medicalAlerts.allergies && <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded uppercase tracking-widest">Allergy</span>}
            </div>
            <p className="text-xs text-rose-900 dark:text-rose-200 font-bold mt-1 transition-colors">
              {medicalAlerts.history && <span className="mr-3">Riwayat: {medicalAlerts.history}</span>}
              {medicalAlerts.allergies && <span className="text-rose-600 dark:text-rose-400">Alergi: {medicalAlerts.allergies}</span>}
            </p>
          </div>
        </div>
      )}

      <div className="bg-slate-50 dark:bg-slate-800 p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors">
        <div>
          <h4 className="font-black text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2 transition-colors">
            <ClipboardList className="w-5 h-5 text-[#0E7490] dark:text-teal-400" />
            Dokumentasi Klinis (SOAP)
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">Standar Rekam Medis Elektronik Kedokteran Gigi</p>
        </div>
        {!readOnly && (
          <div className="flex items-center gap-3">
            {patientData && null}
            <button 
              type="submit" 
              disabled={isLoading}
              className={cn(
                "bg-[#0E7490] dark:bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-[#0E7490]/20 dark:shadow-none hover:bg-[#0c647d] dark:hover:bg-teal-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2",
                isLoading && "opacity-50 cursor-not-allowed scale-100 hover:scale-100"
              )}
            >
              {isLoading ? 'Menyimpan...' : 'Simpan Rekam Medis'}
            </button>
          </div>

        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        {[
          { id: 'anamnesa', label: 'Anamnesa (S)', mobLabel: 'S (Anamnesa)', icon: Search },
          { id: 'fisik', label: 'Pemeriksaan (O)', mobLabel: 'O (Fisik)', icon: Activity },
          { id: 'diagnosis', label: 'Diagnosis & Plan (A/P)', mobLabel: 'A/P (Diagnosa)', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 text-[10px] sm:text-xs font-black uppercase tracking-normal sm:tracking-wider transition-all border-b-2",
              activeTab === tab.id 
                ? "border-[#0E7490] dark:border-teal-400 text-[#0E7490] dark:text-teal-400" 
                : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="inline sm:hidden">{tab.mobLabel}</span>
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        {/* Tab 1: Anamnesa (Subjective) */}
        {activeTab === 'anamnesa' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                <div className="w-2 h-6 bg-blue-500 rounded-full" />
                S: Keluhan Utama (Chief Complaint)
              </label>
              <textarea
                value={formData.subjective}
                onChange={(e) => handleChange('subjective', e.target.value)}
                disabled={readOnly}
                placeholder="Tuliskan keluhan pasien secara mendetail..."
                className="w-full text-base p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#0E7490]/10 focus:border-[#0E7490]/30 dark:focus:border-teal-500/30 min-h-[150px] transition-all dark:text-slate-100 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Pemeriksaan (Objective) */}
        {activeTab === 'fisik' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-colors">
            {/* Vitals Section */}
            <div className="space-y-4">
              <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                <div className="w-2 h-6 bg-red-500 rounded-full" />
                Tanda-Tanda Vital (TTV)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'bloodPressure', label: 'Tek. Darah (TD)', placeholder: '120/80', unit: 'mmHg' },
                  { id: 'heartRate', label: 'Nadi (N)', placeholder: '80', unit: 'x/mnt' },
                  { id: 'respiratoryRate', label: 'Nafas (RR)', placeholder: '20', unit: 'x/mnt' },
                  { id: 'temperature', label: 'Suhu (S)', placeholder: '36.5', unit: '°C' },
                  { id: 'painScale', label: 'Skala Nyeri', placeholder: '0-10', unit: 'VAS' },
                ].map(vital => (
                  <div key={vital.id} className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase px-1 transition-colors">{vital.label}</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={(formData.vitals as any)?.[vital.id] || ''}
                        onChange={(e) => handleVitalChange(vital.id as any, e.target.value)}
                        disabled={readOnly}
                        placeholder={vital.placeholder}
                        className="w-full text-sm font-bold p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0E7490]/20 dark:focus:ring-teal-500/20 dark:text-slate-100 dark:placeholder:text-slate-600 transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 dark:text-slate-500">{vital.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>


            {/* Extra Objective Notes */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase px-1 transition-colors">Temuan Klinis Tambahan (O)</label>
              <textarea
                value={formData.objective}
                onChange={(e) => handleChange('objective', e.target.value)}
                disabled={readOnly}
                placeholder="Hasil pemeriksaan klinis lainnya..."
                className="w-full text-sm p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[100px] dark:text-slate-100 dark:placeholder:text-slate-600 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Diagnosis & Plan */}
        {activeTab === 'diagnosis' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Assessment Section */}
            <div className="space-y-4 bg-amber-50/30 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100/50 dark:border-amber-900/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
                <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                  <div className="w-2 h-6 bg-amber-500 rounded-full" />
                  A: Assessment & Diagnosis ICD-10
                </label>
                
                {/* Tombol PC/Laptop: Sejajar dengan Header A, ukuran besar mirip Simpan Rekam Medis */}
                <button 
                  type="button" 
                  onClick={handleCekDiagnosaAI}
                  disabled={isAiThinking || readOnly}
                  className="hidden sm:flex bg-purple-600 dark:bg-purple-700 text-white px-6 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-purple-600/20 hover:bg-purple-700 dark:hover:bg-purple-600 hover:scale-105 active:scale-95 transition-all items-center gap-2 disabled:opacity-50"
                >
                  <Bot className={cn("w-4 h-4", isAiThinking && "animate-spin")} />
                  {isAiThinking ? 'AI Sedang Berpikir...' : 'Tanya Asisten AI (Flask)'}
                </button>
              </div>

              {/* Tombol HP/Smartphone: Tampil lebar di bawah header A dan di atas Kode ICD-10, nyaman ditekan */}
              <button 
                type="button" 
                onClick={handleCekDiagnosaAI}
                disabled={isAiThinking || readOnly}
                className="flex sm:hidden w-full text-xs font-black bg-purple-600 dark:bg-purple-700 text-white py-3 rounded-xl items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-md shadow-purple-900/10"
              >
                <Bot className={cn("w-4 h-4", isAiThinking && "animate-spin")} />
                {isAiThinking ? 'AI Sedang Berpikir...' : 'Tanya Asisten AI (Flask)'}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase px-1 mb-1 block transition-colors">Kode ICD-10</label>
                  <div 
                    className={cn(
                      "flex justify-between items-center w-full p-3 bg-white dark:bg-slate-800 border rounded-xl shadow-sm transition-all cursor-pointer",
                      formData.assessmentIcd10 
                        ? "border-amber-500 dark:border-amber-600 text-amber-700 dark:text-amber-500 font-bold" 
                        : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500"
                    )}
                    onClick={() => !readOnly && setShowIcdDropdown(!showIcdDropdown)}
                  >
                    {formData.assessmentIcd10 || 'Pilih Kode'}
                    {!readOnly && <Search className="w-4 h-4 opacity-50" />}
                  </div>

                  {/* ICD-10 Dropdown */}
                  {!readOnly && showIcdDropdown && (
                    <div className="absolute z-30 top-full left-0 w-full md:w-[450px] mt-2 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 transition-colors">
                        <input 
                          type="text" 
                          placeholder="Cari diagnosis (contoh: Karies, Pulpitis)..." 
                          value={icdSearch}
                          onChange={(e) => setIcdSearch(e.target.value)}
                          className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-amber-500 dark:text-slate-100 dark:placeholder:text-slate-600 shadow-sm transition-colors"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {filteredIcd10.length === 0 ? (
                          <div className="p-8 text-center text-sm text-slate-500">Diagnosis tidak ditemukan.</div>
                        ) : (
                          filteredIcd10.map(item => (
                            <div 
                              key={item.code} 
                              onClick={() => handleSelectIcd(item.code, item.name)}
                              className="p-4 hover:bg-amber-50 cursor-pointer border-b border-slate-50 transition-colors"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-black text-amber-600 text-sm tracking-tight">{item.code}</span>
                                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{item.name}</span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{item.desc}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase px-1 mb-1.5 block transition-colors">Nama Diagnosis Lengkap</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.assessmentDescription}
                      onChange={(e) => handleChange('assessmentDescription', e.target.value)}
                      disabled={readOnly || (formData.assessmentIcd10 !== '' && formData.assessmentIcd10 !== 'Lainnya')}
                      placeholder="Diagnosis..."
                      className="w-full text-base font-bold p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:text-slate-100 dark:placeholder:text-slate-600 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* AI Result Visualization Card */}
              {aiResult && (
                <div className="mt-4 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl border border-purple-100 dark:border-purple-800 shadow-sm animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-black text-purple-900 dark:text-purple-300 text-sm">Ranida Clinical Engine</h5>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest">Prediksi Berbasis Data</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className={cn(
                         "text-xs font-black px-3 py-1 rounded-full",
                         parseFloat(aiResult.confidence) > 80 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                         parseFloat(aiResult.confidence) > 50 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" :
                         "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"
                       )}>
                         Confidence: {aiResult.confidence}
                       </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-white dark:border-slate-700 transition-colors">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Diagnosis AI</span>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100">{aiResult.diagnosa}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-slate-800/50 p-3 rounded-2xl border border-white dark:border-slate-700 transition-colors">
                      <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Saran Perawatan AI</span>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{aiResult.plan}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-purple-100 dark:border-purple-800 pt-4 transition-colors">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">Apakah hasil ini kurang tepat? Bantu AI belajar dengan mengoreksinya lalu klik tombol di samping.</p>
                    <button 
                      type="button"
                      onClick={handleSendAiFeedback}
                      disabled={isSendingFeedback || feedbackSent}
                      className={cn(
                        "text-[10px] font-black border px-4 py-2 rounded-xl transition-all flex items-center gap-2",
                        feedbackSent 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                          : "bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20",
                        (isSendingFeedback || feedbackSent) && "opacity-80 cursor-not-allowed"
                      )}
                    >
                      {isSendingFeedback ? (
                        <><Bot className="w-3 h-3 animate-spin" /> Mengirim...</>
                      ) : feedbackSent ? (
                        <><CheckCircle2 className="w-3 h-3" /> Berhasil Tersimpan!</>
                      ) : (
                        'Koreksi AI & Simpan Data'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Treated Teeth */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                  <div className="w-2 h-6 bg-rose-500 rounded-full" />
                  Gigi Terlibat
                </label>
                <input
                  type="text"
                  value={formData.soapTeeth}
                  onChange={(e) => handleChange('soapTeeth', e.target.value)}
                  disabled={readOnly}
                  placeholder="Contoh: 11, 24, 46"
                  className="w-full text-sm font-bold p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-slate-100 dark:placeholder:text-slate-600 transition-colors"
                />
              </div>

                {/* Plan Section */}
                <div className="md:col-span-3 space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2 transition-colors">
                      <div className="w-2 h-6 bg-purple-500 rounded-full" />
                      P: Plan & Rencana Perawatan
                    </label>
                  </div>
                  <textarea
                    value={formData.plan}
                    onChange={(e) => handleChange('plan', e.target.value)}
                    disabled={readOnly}
                    placeholder="Tindakan yang dilakukan, medikasi, instruksi pasien..."
                    className="w-full text-sm p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl min-h-[120px] focus:ring-purple-500/10 focus:border-purple-500/30 dark:focus:border-teal-500/30 dark:text-slate-100 dark:placeholder:text-slate-600 transition-all font-medium"
                  />
                  
                  {/* Procedure Quick Picks */}
                  {!readOnly && (
                     <div className="space-y-4 mt-4">
                       <div className="flex flex-wrap gap-2">
                         {DENTAL_PROCEDURES.map(proc => (
                           <button
                             key={proc.id}
                             type="button"
                             onClick={() => {
                                const currentPlan = formData.plan || '';
                                const newPlan = currentPlan.includes(proc.name) 
                                  ? currentPlan 
                                  : (currentPlan ? `${currentPlan}\n- ${proc.name}` : `- ${proc.name}`);
                                
                                setFormData(prev => ({
                                   ...prev,
                                   plan: newPlan,
                                   billingAmount: (prev.billingAmount || 0) + (proc.price || 0)
                                }));
                             }}
                             className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-[#00685d] dark:hover:border-teal-400 hover:text-[#00685d] dark:hover:text-teal-400 transition-all flex items-center gap-1.5 shadow-sm group"
                           >
                             <span>{proc.icon}</span>
                             {proc.name}
                             <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#00685d]/50 dark:text-teal-400/50">
                               (+Rp{(proc.price || 0).toLocaleString()})
                             </span>
                           </button>
                         ))}
                       </div>

                       <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
                          <div className="text-xs font-bold text-slate-500 dark:text-slate-500 transition-colors">
                             Sesuaikan Total Billing (jika diperlukan diskon atau biaya tambahan manual)
                          </div>
                          <div className="flex items-center gap-3">
                             <label className="text-xs font-black text-slate-400 dark:text-slate-600 transition-colors">RP.</label>
                             <input 
                               type="number" 
                               value={formData.billingAmount || 0}
                               onChange={(e) => handleChange('billingAmount', parseInt(e.target.value) || 0)}
                               className="w-32 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-black text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0E7490] dark:focus:border-teal-400 transition-colors"
                             />
                          </div>
                       </div>
                     </div>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>
      {isAiOpen && patientData && (
        <DoctorAiAssistant 
          isOpen={isAiOpen}
          onClose={() => setIsAiOpen(false)}
          patientData={{
            ...patientData,
            bloodPressure: formData.vitals?.bloodPressure
          } as any}
          initialInput={formData.subjective}
          onApply={(res: string) => {
             // Smart detection: if result contains "P (Plan)" or "A (Assessment)"
             // We'll just append it to plan for now or let the user copy/paste sections
             handleChange('plan', formData.plan ? `${formData.plan}\n\nAI Suggestion:\n${res}` : `AI Suggestion:\n${res}`);
          }}
        />
      )}
    </form>

  );
}
