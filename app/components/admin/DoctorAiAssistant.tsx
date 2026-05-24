'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, X, Sparkles, Copy, CheckCircle2, 
  AlertCircle, Loader2, FileText, Activity,
  Stethoscope, ClipboardCheck, Zap, BrainCircuit
} from 'lucide-react';
import { callLocalModelAi } from '@/app/actions/aiActions';
import { cn } from '@/lib/utils';
import { OdontogramData, SoapVisit } from '@/app/types';

interface DoctorAiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: {
    name: string;
    age?: number;
    gender?: 'L' | 'P';
    bloodPressure?: string;
    medicalHistory?: string;
    allergies?: string;
    odontogram?: OdontogramData[];
    recentVisits?: SoapVisit[];
  };
  initialInput?: string;
  onApply: (content: string) => void;
}

export default function DoctorAiAssistant({
  isOpen,
  onClose,
  patientData,
  initialInput = '',
  onApply
}: DoctorAiAssistantProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    diagnosa: string;
    confidence: string;
    plan: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [customInput, setCustomInput] = useState(initialInput);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResult(null);
    setErrorMsg(null);

    const odontogramContext = patientData.odontogram
      ?.filter(t => t.condition !== 'SOU')
      .map(t => `Gigi ${t.toothNumber}: ${t.condition}${t.notes ? ` (${t.notes})` : ''}`)
      .join(', ');

    try {
      // Panggil HANYA Local AI (Random Forest)
      const localResult = await callLocalModelAi({
        umur: patientData.age || 30,
        jenis_kelamin: patientData.gender || 'L',
        tekanan_darah: patientData.bloodPressure || '120/80',
        keluhan: customInput || 'Sakit gigi',
        temuan: odontogramContext || 'Pemeriksaan rutin'
      });

      if (localResult && typeof localResult === 'object' && localResult.diagnosa) {
        setResult({
          diagnosa: localResult.diagnosa,
          confidence: localResult.confidence || '0%',
          plan: localResult.plan || 'Rencana perawatan tidak tersedia.'
        });
      } else {
        setErrorMsg("Gagal mendapatkan prediksi. Pastikan Server AI Python (flask_app.py) sudah Anda jalankan di Terminal.");
      }
    } catch (error: any) {
      setErrorMsg(`ERROR: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      const textToCopy = `[DIAGNOSA AI]\n${result.diagnosa}\n(Confidence: ${result.confidence})\n\n[RENCANA PERAWATAN]\n${result.plan}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-6 bg-slate-950/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-4xl h-full md:h-[90vh] rounded-none md:rounded-[40px] overflow-hidden shadow-premium flex flex-col transition-colors border-0 md:border border-slate-200 dark:border-slate-800"
      >
        {/* Top Header */}
        <div className="bg-slate-900 p-4 md:p-8 text-white relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-[24px] bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Bot className="w-5 h-5 md:w-9 md:h-9 text-white" />
              </div>
              <div>
                <h3 className="text-base md:text-2xl font-black tracking-tight leading-none">
                  Ranida AI <span className="text-teal-400 font-medium text-[9px] md:text-sm ml-1 md:ml-2 px-1.5 py-0.5 md:py-1 bg-white/10 rounded-md uppercase tracking-wider md:tracking-widest">Local</span>
                </h3>
                <p className="text-slate-400 text-[8px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-black mt-1 md:mt-2">Analisis Offline & Privat</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
               <div className="flex flex-col items-end mr-1 md:mr-4">
                  <span className="text-[8px] font-black text-teal-500 uppercase tracking-widest leading-none">Pasien</span>
                  <span className="text-sm md:text-lg font-bold text-white leading-tight truncate max-w-[120px] md:max-w-none">{patientData.name}</span>
               </div>
               <button onClick={onClose} className="p-2 md:p-3 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all">
                <X className="w-5 h-5 md:w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Tabs & Configuration */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar Area */}
          <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 p-4 md:p-6 flex flex-row md:flex-col gap-4 md:gap-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 shrink-0 md:overflow-y-auto custom-scrollbar justify-between md:justify-start items-center md:items-stretch">
            <div className="flex items-center md:block gap-4">
              <h4 className="hidden md:block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Mode Sistem</h4>
              <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                <BrainCircuit className="w-4 h-4 md:w-5 md:h-5 text-teal-500 animate-pulse" />
                <span className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200">Local AI Active</span>
              </div>
            </div>

            <div className="md:mt-4 md:pt-4 md:border-t border-slate-200 dark:border-slate-800">
               <h4 className="hidden md:block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1 mb-2">Konteks Otomatis</h4>
               <div className="flex flex-row md:flex-col gap-2 md:space-y-2 flex-wrap justify-end md:justify-start">
                  <div className={cn(
                    "flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:p-0 md:bg-transparent rounded-lg text-[9px] md:text-[10px] font-bold transition-all",
                    patientData.medicalHistory 
                      ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30" 
                      : "text-slate-400 bg-slate-100 dark:bg-slate-800/40"
                  )}>
                    <Activity className="w-3 h-3" />
                    Riwayat
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:p-0 md:bg-transparent rounded-lg text-[9px] md:text-[10px] font-bold transition-all",
                    patientData.allergies 
                      ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30" 
                      : "text-slate-400 bg-slate-100 dark:bg-slate-800/40"
                  )}>
                    <AlertCircle className="w-3 h-3" />
                    Alergi
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:p-0 md:bg-transparent rounded-lg text-[9px] md:text-[10px] font-bold transition-all",
                    (patientData.odontogram?.length || 0) > 0 
                      ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30" 
                      : "text-slate-400 bg-slate-100 dark:bg-slate-800/40"
                  )}>
                    <Zap className="w-3 h-3" />
                    Odontogram
                  </div>
               </div>
            </div>
          </div>

          {/* Main Working Area */}
          <div className="flex-1 bg-white dark:bg-slate-950 flex flex-col overflow-hidden relative">
             <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                {errorMsg && (
                  <div className="mb-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-600 text-xs md:text-sm font-medium">
                    {errorMsg}
                  </div>
                )}

                {!result && !isLoading ? (
                  <div className="h-full flex flex-col max-w-2xl mx-auto py-4 md:py-10 justify-between md:justify-center">
                    <div className="mb-6 md:mb-10 p-4 md:p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl">
                       <h4 className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100 mb-2 md:mb-3">Input Tambahan (Opsional)</h4>
                       <textarea 
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Contoh: Pasien merasa ngilu saat minum air dingin, gusi bengkak di area belakang atas..."
                        className="w-full p-4 md:p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl md:rounded-2xl text-xs md:text-sm focus:ring-2 focus:ring-teal-500 min-h-[120px] md:min-h-[160px] outline-none transition-all dark:text-slate-100"
                       />
                       <p className="mt-2 md:mt-3 text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">AI akan menggabungkan input ini dengan record medis pasien secara otomatis.</p>
                    </div>

                    <button 
                      onClick={handleGenerate}
                      className="w-full py-4 md:py-5 bg-[#0E7490] text-white font-black rounded-xl md:rounded-2xl hover:opacity-90 shadow-xl shadow-teal-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg"
                    >
                      <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                      MULAI ANALISIS PROFESIONAL
                    </button>
                  </div>
                ) : isLoading ? (
                  <div className="h-full flex flex-col items-center justify-center py-10 md:py-20">
                    <div className="relative">
                       <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-teal-500 animate-spin mb-3 md:mb-4" />
                       <Bot className="w-6 h-6 md:w-8 md:h-8 text-teal-400 absolute top-3 left-3 md:top-4 md:left-4" />
                    </div>
                    <h4 className="text-base md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 md:mb-2 animate-pulse">Menghitung Prediksi AI...</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] animate-soft-pulse transition-colors">Memproses data medis secara lokal</p>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500 max-w-3xl mx-auto">
                    {/* Diagnosis & Confidence Row */}
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      <div className="flex-1 p-5 md:p-8 bg-white dark:bg-slate-900 rounded-2xl md:rounded-[32px] border-2 border-teal-500/20 shadow-xl shadow-teal-500/5 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400"></div>
                        <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-4 flex items-center gap-1.5">
                          <Stethoscope className="w-3 h-3" />
                          Prediksi Diagnosa Utama
                        </h4>
                        <p className="text-lg md:text-3xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                          {result?.diagnosa}
                        </p>
                      </div>

                      <div className="w-full md:w-64 p-5 md:p-8 bg-slate-900 rounded-2xl md:rounded-[32px] border border-slate-800 shadow-premium flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 md:gap-0 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent"></div>
                        <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest md:mb-3 relative z-10 shrink-0">Keyakinan AI</h4>
                        <div className="relative flex items-center justify-center shrink-0">
                          <svg className="w-16 h-16 md:w-24 md:h-24 transform -rotate-90">
                            <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-slate-800 md:hidden" />
                            <circle cx="32" cy="32" r="26" stroke="currentColor" strokeWidth="5" fill="transparent" strokeDasharray={163.3} strokeDashoffset={163.3 - (163.3 * (parseFloat(result?.confidence || '0') || 0)) / 100} className="text-teal-400 transition-all duration-1000 ease-out md:hidden" />
                            
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800 hidden md:block" />
                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * (parseFloat(result?.confidence || '0') || 0)) / 100} className="text-teal-400 transition-all duration-1000 ease-out hidden md:block" />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-xs md:text-xl font-black text-white">{parseFloat(result?.confidence || '0').toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Treatment Plan Card */}
                    <div className="p-5 md:p-8 bg-white dark:bg-slate-900 rounded-2xl md:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm relative">
                      <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-4 flex items-center gap-1.5">
                        <ClipboardCheck className="w-3 h-3" />
                        Rekomendasi Tindakan (Plan)
                      </h4>
                      <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                        {result?.plan}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-6">
                      <button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 md:gap-3 py-4 md:py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs md:text-sm font-black rounded-xl md:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
                      >
                        {copied ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
                        {copied ? 'BERHASIL DISALIN!' : 'SALIN HASIL ANALISIS'}
                      </button>
                      <button
                        onClick={() => {
                          const appliedText = `Diagnosa: ${result?.diagnosa}\nRencana Perawatan: ${result?.plan}`;
                          onApply(appliedText);
                          onClose();
                        }}
                        className="flex items-center justify-center gap-2 md:gap-3 py-4 md:py-5 bg-slate-900 dark:bg-teal-600 text-white text-xs md:text-sm font-black rounded-xl md:rounded-2xl hover:bg-slate-800 dark:hover:bg-teal-500 transition-all active:scale-95 shadow-xl shadow-slate-900/20"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        TERAPKAN KE REKAM MEDIS
                      </button>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-950/20 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-rose-100 dark:border-rose-900/30 flex gap-3 md:gap-4 transition-colors">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                      <div>
                         <p className="text-[9px] md:text-xs font-black text-rose-900 dark:text-rose-400 uppercase tracking-widest mb-1 transition-colors">Peringatan Keamanan Pasien (Patient Safety)</p>
                         <p className="text-[10px] md:text-xs text-rose-700 dark:text-rose-400 leading-relaxed font-bold transition-colors">
                          Analisis AI ini hanyalah instrumen pendukung keputusan. Keputusan medis akhir dan tanggung jawab klinis sepenuhnya berada di tangan dokter yang merawat. Harap verifikasi semua obat dan dosis secara manual.
                         </p>
                      </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
