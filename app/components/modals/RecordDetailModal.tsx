'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList, Activity, Download, CheckCircle2, MessageSquare, MapPin } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { QueueItem } from '@/app/types';
import { formatMedicalRecordMessage, getWhatsAppLink } from '@/lib/whatsappHelper';

interface RecordDetailModalProps {
  record: QueueItem;
  onClose: () => void;
  sendWhatsAppNotification?: (phone: string, message: string) => Promise<boolean>;
}

export default function RecordDetailModal({ 
  record, 
  onClose, 
  sendWhatsAppNotification
}: RecordDetailModalProps) {
  const recordRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!recordRef.current || isDownloading) return;
    setIsDownloading(true);
    
    const element = recordRef.current;
    
    try {
      // Force stable print class during capture to prevent mobile collapse
      element.classList.add('print-stable');
      
      // Wait for layout to stabilize with the new class
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: 800,
        height: element.scrollHeight, // Capture full height
      });
      
      const link = document.createElement('a');
      link.download = `rekam-medis-${record.name}-${record.date}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Gagal mengunduh rekam medis.');
    } finally {
      // Remove forced class and restore original view
      element.classList.remove('print-stable');
      setIsDownloading(false);
    }
  };

  const [isSendingWA, setIsSendingWA] = useState(false);
  const handleShareText = async () => {
    if (isSendingWA) return;
    setIsSendingWA(true);
    try {
      const message = formatMedicalRecordMessage(record);
      if (sendWhatsAppNotification) {
        await sendWhatsAppNotification(record.phone, message);
      } else {
        const link = getWhatsAppLink(record.phone, message);
        window.open(link, '_blank');
      }
    } catch (error) {
      console.error('Share error:', error);
      const link = getWhatsAppLink(record.phone, formatMedicalRecordMessage(record));
      window.open(link, '_blank');
    } finally {
      setIsSendingWA(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300"
      >
        <div className="bg-[#0E7490] p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Detail Rekam Medis</h3>
              <p className="text-[10px] text-teal-100 uppercase tracking-widest font-black opacity-80">Praktek Gigi Dan Mulut • Arsip Digital</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-slate-50 dark:bg-slate-950 transition-colors">
          {/* Main Record Area for Display and Export */}
          <div 
            ref={recordRef} 
            className="bg-white p-4 md:p-8 rounded-xl shadow-sm border border-slate-50 mx-auto"
            style={{ width: '100%', maxWidth: '800px', minWidth: '320px' }}
          >
             {/* KOP SURAT (OFFICIAL HEADER) - Visible in Print/Export */}
             <div className="border-b-4 border-[#0E7490] pb-6 mb-8 flex items-center justify-between print-header">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0E7490] flex items-center justify-center text-white shadow-lg">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-[#0E7490] tracking-tighter uppercase leading-none">Praktek Gigi</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Dan Mulut - Lombok Timur</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1 italic">Professional & Friendly Dental Care</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Digital Record ID</p>
                  <p className="text-sm font-black text-slate-800 mt-0.5">#{record.id.slice(-6).toUpperCase()}</p>
                </div>
             </div>

             <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 print-header">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas Pasien</p>
                    <h4 className="text-3xl font-black text-slate-800">{record.name}</h4>
                  </div>
                   <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                       <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                       <span>{record.phone}</span>
                    </div>
                    {record.address && (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
                         <MapPin className="w-3.5 h-3.5 text-slate-400" />
                         <span>{record.address}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-left md:text-right space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Kunjungan</p>
                    <p className="text-xl font-black text-slate-800">{record.date}</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 rounded-full border border-teal-100 text-xs font-bold">
                    No. Antrean {record.number} • {record.time}
                  </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print-grid">
                {/* Vitals Section */}
                {record.vitals && (record.vitals.bloodPressure || record.vitals.temperature || record.vitals.heartRate) && (
                  <div className="md:col-span-2 bg-slate-50 p-6 rounded-[32px] border border-slate-100 space-y-4">
                    <div className="flex items-center gap-2.5 text-[#0E7490]">
                      <div className="w-8 h-8 rounded-xl bg-[#0E7490]/10 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Tanda-Tanda Vital (TTV)</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {record.vitals.bloodPressure && (
                        <div className="bg-white p-3 rounded-2xl border border-slate-200/50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Tekanan Darah</p>
                          <p className="text-sm font-black text-slate-800">{record.vitals.bloodPressure} <span className="text-[10px] font-normal text-slate-400">mmHg</span></p>
                        </div>
                      )}
                      {record.vitals.temperature && (
                        <div className="bg-white p-3 rounded-2xl border border-slate-200/50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Suhu Tubuh</p>
                          <p className="text-sm font-black text-slate-800">{record.vitals.temperature} <span className="text-[10px] font-normal text-slate-400">°C</span></p>
                        </div>
                      )}
                      {record.vitals.heartRate && (
                        <div className="bg-white p-3 rounded-2xl border border-slate-200/50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Nadi (HR)</p>
                          <p className="text-sm font-black text-slate-800">{record.vitals.heartRate} <span className="text-[10px] font-normal text-slate-400">bpm</span></p>
                        </div>
                      )}
                      {record.vitals.respiratoryRate && (
                        <div className="bg-white p-3 rounded-2xl border border-slate-200/50">
                          <p className="text-[9px] font-bold text-slate-400 uppercase">Pernapasan</p>
                          <p className="text-sm font-black text-slate-800">{record.vitals.respiratoryRate} <span className="text-[10px] font-normal text-slate-400">x/m</span></p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Intraoral Findings */}
                {record.intraOral && Object.values(record.intraOral).some(v => v && v !== 'Normal') && (
                  <div className="md:col-span-2 bg-[#f0f9f8] p-6 rounded-[32px] border border-emerald-100/50 space-y-4">
                    <div className="flex items-center gap-2.5 text-[#0E7490]">
                      <div className="w-8 h-8 rounded-xl bg-[#0E7490]/10 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Pemeriksaan Jaringan Lunak (Intraoral)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(record.intraOral)
                        .filter(([_, val]) => val && val !== 'Normal')
                        .map(([key, val]) => (
                          <div key={key} className="bg-white/80 backdrop-blur px-3 py-1.5 rounded-xl border border-emerald-200/50 flex items-center gap-2">
                            <span className="text-[10px] font-black text-emerald-700 uppercase">{key}:</span>
                            <span className="text-xs font-bold text-slate-700">{val}</span>
                          </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-[#f8fafa] p-6 rounded-[32px] border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0E7490]">
                    <div className="w-8 h-8 rounded-xl bg-[#0E7490]/10 flex items-center justify-center font-bold text-xs">S</div>
                    <span className="text-xs font-black uppercase tracking-widest">Anamnesa (Subjektif)</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed italic break-words">&quot;{record.subjective || record.complaint || '-'}&quot;</p>
                </div>
                
                <div className="bg-[#f8fafa] p-6 rounded-[32px] border border-slate-100 space-y-4">
                  <div className="flex items-center gap-2.5 text-[#0E7490]">
                    <div className="w-8 h-8 rounded-xl bg-[#0E7490]/10 flex items-center justify-center font-bold text-xs">O</div>
                    <span className="text-xs font-black uppercase tracking-widest">Pemeriksaan Fisik (Objektif)</span>
                  </div>
                  <div className="space-y-2">
                    {record.soapTeeth && (
                      <p className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg inline-block">Gigi: {record.soapTeeth}</p>
                    )}
                    <p className="text-sm text-slate-700 leading-relaxed break-words">{record.objective || '-'}</p>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2.5 text-teal-400">
                    <div className="w-8 h-8 rounded-xl bg-teal-400/10 flex items-center justify-center font-bold text-xs">A</div>
                    <span className="text-xs font-black uppercase tracking-widest">Diagnosis (Assessment)</span>
                  </div>
                  <div className="space-y-2">
                    {record.assessmentIcd10 && (
                      <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 text-[10px] font-black rounded-full border border-teal-400/20">{record.assessmentIcd10}</span>
                    )}
                    <p className="text-sm text-teal-50 font-bold leading-relaxed break-words">{record.assessmentDescription || record.treatment || '-'}</p>
                  </div>
                </div>

                <div className="bg-[#0E7490] p-6 rounded-[32px] border border-emerald-800 space-y-4 shadow-lg shadow-emerald-900/10">
                  <div className="flex items-center gap-2.5 text-white">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs">P</div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Rencana Terapi (Plan)</span>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed break-words">{record.plan || record.treatment || '-'}</p>
                </div>
             </div>

             <div className="pt-8 border-t-2 border-dashed border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-6 print-header print-space-y">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100">
                      <CheckCircle2 className="w-6 h-6" />
                   </div>
                   <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-[#0E7490] uppercase tracking-widest">Status</p>
                      <p className="text-xs font-bold text-slate-500">Telah Selesai & Diarsipkan</p>
                   </div>
                </div>
                <div className="text-center sm:text-right bg-[#0E7490] px-8 py-4 rounded-3xl text-white shadow-xl shadow-[#00685d]/20 self-stretch sm:self-auto">
                   <p className="text-[10px] font-bold text-teal-100 uppercase tracking-widest mb-1">Total Layanan</p>
                   <p className="text-3xl font-black tracking-tighter">Rp {(record.billingAmount || 0).toLocaleString('id-ID')}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 shrink-0 transition-colors">
          <button onClick={onClose} className="py-4 px-6 text-slate-500 dark:text-slate-400 font-bold text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95">Tutup</button>
          
          <div className="flex flex-1 gap-3">
            <button 
              onClick={handleShareText}
              disabled={isSendingWA}
              className="flex-1 py-4 bg-emerald-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isSendingWA ? 'Mengirim...' : 'Kirim WA'}</span>
            </button>

            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 py-4 bg-slate-900 dark:bg-teal-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-teal-700 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isDownloading ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Cetak
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
