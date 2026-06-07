'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, ClipboardList, Activity, ArrowRight } from 'lucide-react';
import { SoapVisit } from '@/app/types';

interface RecordsViewProps {
  visits: SoapVisit[];
  onEdit: (p: any) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onViewDetail: (r: any) => void;
  onOpenEmr?: (p: any) => void;
  showToast?: (message: string, type?: 'success'|'error') => void;
  requestConfirm?: (options: any) => void;
}

export default function RecordsView({ 
  visits, 
  searchTerm, 
  onViewDetail,
  onEdit,
  onDelete,
  onOpenEmr,
  showToast,
  requestConfirm
}: RecordsViewProps) {
  
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredRecords = visits
    .filter(v => 
      (v as any).patientName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.patientId.includes(searchTerm) ||
      v.subjective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.assessmentDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plan?.toLowerCase()?.includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Log Arsip Kunjungan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1 transition-colors">Total {visits.length} Kunjungan Tercatat</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-premium border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        {/* Mobile View: Cards */}
        {mounted && isMobile && (
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredRecords.map((r, i) => (
              <div key={i} className="p-4 space-y-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
                      {new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mt-0.5 block">
                      {new Date(r.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                     <button
                       onClick={() => onOpenEmr?.({ phone: r.patientId, name: (r as any).patientName })}
                       className="px-2.5 py-1.5 bg-[#0E7490]/10 text-[#0E7490] rounded-lg text-[9px] font-black tracking-widest uppercase flex items-center gap-1 hover:bg-[#0E7490] hover:text-white transition-all shrink-0"
                       title="Lihat"
                     >
                       <Activity className="w-3.5 h-3.5" />
                       <span>Lihat</span>
                     </button>
                     <button
                       onClick={() => onEdit(r)}
                       className="p-1.5 text-slate-400 dark:text-slate-550 hover:text-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors shrink-0"
                     >
                       <Pencil className="w-4 h-4" />
                     </button>
                     <button
                       onClick={() => {
                         const action = () => { r.id && onDelete(r.id); };
                         if (requestConfirm) {
                           requestConfirm({
                             title: 'Hapus Arsip Kunjungan?',
                             description: `Hapus kunjungan ${(r as any).patientName} pada tgl ${new Date(r.date).toLocaleDateString('id-ID')}?`,
                             confirmText: 'Ya, Hapus',
                             isDestructive: true,
                             onConfirm: action
                           });
                         } else {
                           if (window.confirm(`Hapus kunjungan ${(r as any).patientName} pada tgl ${new Date(r.date).toLocaleDateString('id-ID')}?`)) {
                             action();
                           }
                         }
                       }}
                       className="p-1.5 text-slate-400 dark:text-slate-550 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors shrink-0"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase mb-0.5">Pasien</span>
                  <p className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">
                    {(r as any).patientName || 'Pasien Anonim'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider transition-colors">{r.patientId}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-[10px] space-y-1 transition-colors">
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Diagnosis (A)</span>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium line-clamp-2 transition-colors">{r.assessmentDescription || '-'}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-[10px] space-y-1 transition-colors">
                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Tindakan (P)</span>
                    <p className="text-blue-700 dark:text-blue-400 font-medium line-clamp-2 transition-colors">{r.plan || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
            {filteredRecords.length === 0 && (
              <div className="p-12 text-center text-slate-400 text-sm italic py-20">
                <ClipboardList className="w-12 h-12 text-slate-205 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Belum ada Arsip Kunjungan</p>
              </div>
            )}
          </div>
        )}

        {/* Desktop View: Table */}
        {mounted && !isMobile && (
          <div className="hidden md:block overflow-x-auto min-w-full hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 transition-colors">
                  <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Tanggal & Waktu</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">ID / Pasien</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">A (Diagnosis)</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">P (Tindakan)</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Aksi & Kelola</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((r, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="block text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
                        {new Date(r.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase transition-colors">
                        {new Date(r.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="block text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">{(r as any).patientName || 'Pasien Anonim'}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase transition-colors">{r.patientId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium line-clamp-2 max-w-[200px] transition-colors">
                        {r.assessmentDescription || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-blue-700 dark:text-blue-400 font-medium line-clamp-2 max-w-[200px] transition-colors">
                        {r.plan || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                         {/* Navigate to Hasil EMR directly maybe? Or open the EMR Page. */}
                         <button
                           onClick={() => onOpenEmr?.({ phone: r.patientId, name: (r as any).patientName })}
                           className="px-3 py-2 bg-[#0E7490]/10 text-[#0E7490] hover:bg-[#0E7490] hover:text-white rounded-lg transition-all text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5"
                           title="Lihat Detail Hasil"
                         >
                           <Activity className="w-3.5 h-3.5" />
                           <span className="hidden sm:inline">Lihat</span>
                         </button>
  
                         {/* EDIT Button */}
                         {/* In this implementation, edit may trigger modal. Assuming onEdit handles r */}
                          <button
                            onClick={() => onEdit(r)}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all"
                            title="Edit Riwayat"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
  
                         {/* DELETE Button */}
                          <button
                            onClick={() => {
                              const action = () => { r.id && onDelete(r.id); };
                              if (requestConfirm) {
                                requestConfirm({
                                  title: 'Hapus Arsip Kunjungan?',
                                  description: `Hapus kunjungan ${(r as any).patientName} pada tgl ${new Date(r.date).toLocaleDateString('id-ID')}?`,
                                  confirmText: 'Ya, Hapus',
                                  isDestructive: true,
                                  onConfirm: action
                                });
                              } else {
                                if (window.confirm(`Hapus kunjungan ${(r as any).patientName} pada tgl ${new Date(r.date).toLocaleDateString('id-ID')}?`)) {
                                  action();
                                }
                              }
                            }}
                            className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                            title="Hapus Kunjungan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                       <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                       <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Belum ada Arsip Kunjungan</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
