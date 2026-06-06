'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  FileText, 
  ClipboardCheck, 
  Activity, 
  Stethoscope,
  ChevronRight,
  Download,
  Share2,
  Calendar,
  Phone,
  MapPin
} from 'lucide-react';
import { SoapVisit, QueueItem } from '@/app/types';
import { cn } from '@/lib/utils';
import { domToPng } from 'modern-screenshot';
import { formatMedicalRecordMessage, getWhatsAppLink } from '@/lib/whatsappHelper';

interface HasilEmrViewProps {
  visits: SoapVisit[]; // EMR Results
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  sendWhatsAppNotification?: (phone: string, message: string) => Promise<boolean>;
  showToast?: (message: string, type?: 'success'|'error') => void;
  requestConfirm?: (options: any) => void;
  onOpenEmr: (p: any) => void;
}

// Sub-component for each EMR Card to manage its own state and refs
function EmrRecordCard({ 
  record, 
  onOpenEmr, 
  sendWhatsAppNotification,
  showToast 
}: { 
  record: SoapVisit, 
  onOpenEmr: (p: any) => void,
  sendWhatsAppNotification?: (phone: string, message: string) => Promise<boolean>,
  showToast?: (message: string, type?: 'success'|'error') => void
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleExport = async (type: 'download' | 'print') => {
    if (!cardRef.current || isExporting) return;
    setIsExporting(true);

    const element = cardRef.current;
    try {
      // Add a class for stable rendering during capture
      element.classList.add('export-stable');
      
      // Wait for layout
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await domToPng(element, {
        scale: 2,
        backgroundColor: '#ffffff',
        width: 800,
        height: element.scrollHeight,
      });

      if (type === 'download') {
        const link = document.createElement('a');
        link.download = `EMR-${(record as any).patientName}-${record.date}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Print behavior: open in new tab and trigger print
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`<html><body style="margin:0;display:flex;justify-content:center;align-items:center;"><img src="${dataUrl}" style="max-width:100%;height:auto;"/></body></html>`);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
          };
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      if (showToast) showToast('Gagal mengekspor dokumen.', 'error');
    } finally {
      element.classList.remove('export-stable');
      setIsExporting(false);
    }
  };

  const handleShare = () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      // Cast SoapVisit to QueueItem because formatMedicalRecordMessage expects it
      // They share similar fields (name, phone, date, subjective, assessmentDescription)
      const mockQueueItem: any = {
        name: (record as any).patientName || 'Pasien',
        phone: record.patientId,
        date: record.date,
        vitals: record.vitals,
        subjective: record.subjective,
        assessmentDescription: record.assessmentDescription,
        billingAmount: record.billingAmount,
        treatment: (record as any).treatment || record.plan
      };

      const message = formatMedicalRecordMessage(mockQueueItem);
      
      if (sendWhatsAppNotification) {
        sendWhatsAppNotification(record.patientId, message);
        if (showToast) showToast('Ringkasan medis sedang dikirim via WhatsApp...', 'success');
      } else {
        const link = getWhatsAppLink(record.patientId, message);
        window.open(link, '_blank');
      }
    } catch (error) {
      console.error('Share error:', error);
      if (showToast) showToast('Gagal membagikan ke pasien.', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium dark:shadow-none overflow-hidden group hover:border-[#0E7490]/40 dark:hover:border-teal-500/40 transition-all"
    >
      <div className="flex flex-col lg:flex-row">
        {/* Visual Left Side - Information Panel */}
        <div className="lg:w-1/3 bg-slate-50 dark:bg-slate-800/50 p-8 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00685d] to-emerald-600 p-0.5 shadow-lg shadow-teal-900/10 dark:shadow-none transition-all group-hover:scale-105">
                 <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[14px] flex items-center justify-center text-[#0E7490] dark:text-teal-400 font-black text-xl transition-colors">
                   {record.patientName?.charAt(0) || 'P'}
                 </div>
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none transition-colors">{record.patientName}</h4>
                <div className="flex flex-col gap-1.5 mt-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5" /> ID: {record.patientId}
                  </p>
                  {record.address && (
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 line-clamp-1 transition-colors flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" /> {record.address}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="py-4 border-y border-slate-200/50 dark:border-slate-700 space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Tanggal Periksa</span>
                 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                   {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                 </span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Gigi Terlibat</span>
                 <span className="text-xs font-black text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded transition-colors">
                   {record.soapTeeth || 'General'}
                 </span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               {record.vitals && (
                 <>
                   <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                     <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5 transition-colors">Tensi</span>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">{record.vitals.bloodPressure || '-'}</span>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                     <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5 transition-colors">Suhu</span>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">{record.vitals.temperature || '-'} °C</span>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                     <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5 transition-colors">Nadi</span>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">{record.vitals.heartRate || '-'} x/m</span>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                     <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5 transition-colors">Nafas</span>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">{record.vitals.respiratoryRate || '-'} x/m</span>
                   </div>
                   <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors col-span-2">
                     <span className="block text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase mb-0.5 transition-colors">Skala Nyeri</span>
                     <span className="text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors">{record.vitals.painScale || '-'} / 10 (VAS)</span>
                   </div>
                 </>
               )}
               <div className="bg-[#0E7490] dark:bg-teal-900/40 p-3 rounded-2xl shadow-sm col-span-2 transition-colors border border-[#0E7490]/20">
                 <span className="block text-[8px] font-black text-emerald-100 dark:text-emerald-500 uppercase mb-1 transition-colors">Total Layanan</span>
                 <span className="text-sm font-black text-white dark:text-teal-400">Rp{(record.billingAmount || 0).toLocaleString()}</span>
               </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
             <button 
                onClick={() => handleExport('download')}
                disabled={isExporting}
                className="w-full py-3.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0E7490] dark:hover:bg-teal-600 transition-all shadow-lg active:scale-95 disabled:opacity-50"
             >
               <Download className={cn("w-4 h-4", isExporting && "animate-spin")} />
               {isExporting ? 'Proses...' : 'Simpan'}
             </button>
          </div>
        </div>

        {/* Right Side - Medical Findings (The part to be exported) */}
        <div className="flex-1 p-8 bg-white dark:bg-slate-900 relative transition-colors">
           {/* Export-Only Visual Container (Rendered off-screen for capture) */}
           <div className="absolute -left-[9999px] top-0 pointer-events-none">
             <div 
               ref={cardRef} 
               className="p-12 bg-white text-slate-800 space-y-10" 
               style={{ width: '800px', fontFamily: 'Arial, sans-serif', color: 'black' }}
             >
                <div className="text-center mb-12">
                   <h1 className="text-2xl font-bold uppercase tracking-wide text-slate-800">KLINIK GIGI DIGITAL - LAPORAN EMR TERPADU</h1>
                   <p className="text-sm mt-4 text-slate-800">ID Laporan: {new Date(record.date).getTime()}</p>
                </div>
                 <div className="space-y-4">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800">DATA PASIEN & TANDA-TANDA VITAL (TTV)</h2>
                    <div className="grid grid-cols-[150px_10px_1fr] gap-y-3 text-base text-slate-800">
                       <div className="font-semibold">Nama</div><div className="font-semibold">:</div><div className="font-medium text-slate-800">{record.patientName}</div>
                       <div className="font-semibold">Tanggal</div><div className="font-semibold">:</div><div className="text-slate-800">{new Date(record.date).toISOString().split('T')[0]}</div>
                       {record.vitals && (
                         <>
                           <div className="font-semibold">TTV Lengkap</div><div className="font-semibold">:</div>
                           <div className="text-slate-800">
                             TD: {record.vitals.bloodPressure || '-'} mmHg | 
                             S: {record.vitals.temperature || '-'} °C | 
                             N: {record.vitals.heartRate || '-'} x/mnt | 
                             RR: {record.vitals.respiratoryRate || '-'} x/mnt | 
                             Nyeri (VAS): {record.vitals.painScale || '-'}
                           </div>
                         </>
                       )}
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800">HASIL ANALISIS CONVERSATIONAL AI</h2>
                    <div className="space-y-4 text-base text-slate-800">
                       <p><span className="font-semibold">Keluhan Pasien:</span> {record.subjective}</p>
                       <p className="text-red-600 font-bold">Diagnosa AI : {record.assessmentDescription}</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800">REKOMENDASI TINDAKAN MEDIS</h2>
                    <p className="italic text-base whitespace-pre-line text-slate-800">{record.plan}</p>
                 </div>

                 <div className="mt-24 text-right text-xs text-slate-800 pt-8 border-t border-gray-300">
                    Disahkan secara digital oleh: AI Medical Assistant System
                 </div>
              </div>
           </div>

           {/* Visible Dashboard Visuals */}
           <div className="absolute top-8 right-8 flex items-center gap-2">
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-700 text-[10px] font-black tracking-widest transition-colors">
                ID: {new Date(record.date).getTime()}
              </div>
           </div>

           <div className="space-y-8 pt-4">
              <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-6">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wider">KLINIK GIGI DIGITAL - LAPORAN EMR TERPADU</h3>
              </div>

              <div>
                 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-widest mb-4">DATA PASIEN & TTV</h4>
                 <div className="grid grid-cols-[100px_10px_1fr] gap-y-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
                    <div>Nama</div><div>:</div><div className="font-bold text-slate-800 dark:text-slate-100">{record.patientName}</div>
                    <div>Tanggal</div><div>:</div><div>{new Date(record.date).toISOString().split('T')[0]}</div>
                    {record.vitals && (
                      <>
                        <div>Tanda Vital</div><div>:</div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          TD: <span className="text-rose-600 dark:text-rose-400">{record.vitals.bloodPressure || '-'}</span> | 
                          S: <span className="text-rose-600 dark:text-rose-400">{record.vitals.temperature || '-'}°C</span> | 
                          N: {record.vitals.heartRate || '-'} x/m | 
                          RR: {record.vitals.respiratoryRate || '-'} x/m | 
                          Nyeri: {record.vitals.painScale || '-'} (VAS)
                        </div>
                      </>
                    )}
                 </div>
              </div>

              <div>
                 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-widest mb-4">HASIL ANALISIS CONVERSATIONAL AI</h4>
                 <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <p><span className="font-medium text-slate-600 dark:text-slate-400">Keluhan Pasien:</span> {record.subjective}</p>
                    <p className="text-rose-600 dark:text-rose-400 font-medium"><span className="text-rose-600 dark:text-rose-400">Diagnosa AI :</span> {record.assessmentDescription}</p>
                 </div>
              </div>

              <div>
                 <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-widest mb-4">REKOMENDASI TINDAKAN MEDIS</h4>
                 <p className="text-sm text-slate-700 dark:text-slate-300 italic whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    {record.plan}
                 </p>
              </div>
           </div>

           {/* Footer Actions */}
           <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6 transition-colors">
              <div className="flex items-center gap-4 w-full sm:w-auto">
                 <button 
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black hover:bg-emerald-700 transition-all uppercase tracking-widest shadow-lg shadow-emerald-600/10 active:scale-95 disabled:opacity-50"
                 >
                    <Share2 className={cn("w-3.5 h-3.5", isSharing && "animate-spin")} />
                    Bagikan
                 </button>
              </div>
              <button 
                 onClick={() => onOpenEmr({ phone: record.patientId, name: record.patientName, address: record.address })}
                 className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all uppercase tracking-widest border border-slate-100 dark:border-slate-700"
              >
                 Riwayat Lengkap
                 <ChevronRight className="w-4 h-4 ml-1" />
              </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HasilEmrView({ 
  visits, 
  searchTerm, 
  setSearchTerm,
  onOpenEmr,
  sendWhatsAppNotification,
  showToast
}: HasilEmrViewProps) {
  
  const filteredRecords = visits
    .filter(v => 
      v.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.patientId.includes(searchTerm) ||
      v.assessmentDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plan?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-3 transition-colors">
            <div className="w-10 h-10 rounded-2xl bg-[#0E7490]/10 dark:bg-teal-500/10 flex items-center justify-center transition-colors">
              <ClipboardCheck className="w-6 h-6 text-[#0E7490] dark:text-teal-400" />
            </div>
            Hasil Pemeriksaan EMR
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 ml-13 transition-colors">Digital Medical Records Archive</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
          <input 
            type="text"
            placeholder="Cari Pasien / Diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-[#00685d]/5 dark:focus:ring-teal-500/10 focus:bg-white dark:focus:bg-slate-900 dark:text-slate-100 transition-all font-bold placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>
      </div>
      
      {filteredRecords.length === 0 ? (
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 p-20 text-center flex flex-col items-center justify-center transition-colors">
          <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-200 dark:text-slate-700 mb-6 transition-colors">
            <FileText className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 transition-colors">Data Kosong</h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm leading-relaxed transition-colors">
            Hasil pemeriksaan otomatis akan muncul di sini setelah diagnosis disimpan oleh dokter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 pb-20">
          {filteredRecords.map((r) => (
            <EmrRecordCard key={r.id} record={r} onOpenEmr={onOpenEmr} sendWhatsAppNotification={sendWhatsAppNotification} showToast={showToast} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
