'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Pencil, Trash2, Users, ClipboardList, ShieldAlert, HeartPulse, User, MapPin, MessageSquare } from 'lucide-react';
import { Patient } from '@/app/types';
import { cn } from '@/lib/utils';
import { getWhatsAppLink } from '@/lib/whatsappHelper';

import { containerVariants, itemVariants, pageVariants } from '@/app/constants/animations';

interface PatientsViewProps {
  patients: Patient[];
  onEdit: (p: any) => void;
  onDeleteMaster: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  onOpenEmr?: (p: any) => void;
  onUpdate?: (id: string, data: Partial<Patient>) => Promise<void>;
}

export default function PatientsView({ 
  patients, 
  onEdit, 
  onDeleteMaster, 
  searchTerm, 
  setSearchTerm,
  onOpenEmr,
  onUpdate
}: PatientsViewProps) {

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

  const filteredPatients = patients.filter(p => 
    (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (p.phone || '').includes(searchTerm)
  );

  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-4 md:space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Direktori Pasien</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-1 transition-colors">Total {patients.length} Pasien Terdaftar</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-premium overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        {/* Mobile View: Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:hidden divide-y divide-slate-50 dark:divide-slate-800"
        >
          {filteredPatients.map((p) => (
            <motion.div variants={itemVariants} key={p.id} className="p-5 space-y-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 transition-colors">{p.name}</h3>
                      {p.gender && (
                        <span className={cn(
                          "px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded shrink-0",
                          p.gender === 'L' 
                            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                            : "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                        )}>
                          {p.gender === 'L' ? 'L' : 'P'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{p.phone}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => {
                      const link = getWhatsAppLink(p.phone, `Halo *${p.name}*, kami dari *Praktek Gigi Ranida*...`);
                      window.open(link, '_blank');
                    }} 
                    className="p-2 text-emerald-500 hover:text-emerald-600 transition-colors hover-lift"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button onClick={() => onEdit(p)} className="p-2 text-slate-400 hover:text-teal-600 transition-colors hover-lift">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteMaster(p.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors hover-lift">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {p.address && (
                <div className="flex items-start gap-2 px-1 text-[11px] text-slate-500 transition-colors">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                  <span className="line-clamp-2">{p.address}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[10px] space-y-1 transition-colors">
                  <div className="font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500">
                    Riw. Penyakit
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{p.medicalHistory || 'Tidak ada'}</p>
                </div>
                <div className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-[10px] space-y-1 transition-colors">
                  <div className="font-bold uppercase tracking-widest text-slate-450 dark:text-slate-500">
                    Alergi
                  </div>
                  <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">{p.allergies || 'Tidak ada'}</p>
                </div>
              </div>

              <button 
                onClick={() => onOpenEmr && onOpenEmr(p)}
                className="w-full py-3 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 hover-lift"
              >
                <ClipboardList className="w-4 h-4" />
                BUKA REKAM MEDIS (EMR)
              </button>
            </motion.div>
          ))}
          {filteredPatients.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center text-slate-400 text-sm italic py-20">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              Pasien tidak ditemukan
            </motion.div>
          )}
        </motion.div>

        {/* Desktop View: Table */}
        {mounted && !isMobile && (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">
                  <th className="px-8 py-5">Identitas Pasien</th>
                  <th className="px-4 py-5">Alamat</th>
                  <th className="px-4 py-5">Riwayat Penyakit</th>
                  <th className="px-4 py-5">Alergi</th>
                  <th className="px-4 py-5">Kunjungan/Jadwal Terakhir</th>
                  <th className="px-8 py-5 text-right">Aksi</th>
                </tr>
              </thead>
              <motion.tbody 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-slate-50"
              >
                {filteredPatients.map((p) => (
                  <motion.tr 
                    variants={itemVariants}
                    key={p.id} 
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all border-b border-slate-50 dark:border-slate-800 last:border-0"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-none transition-colors">{p.name}</p>
                            {p.gender && (
                              <span className={cn(
                                "px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider rounded shrink-0",
                                p.gender === 'L' 
                                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" 
                                  : "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400"
                              )}>
                                {p.gender === 'L' ? 'L' : 'P'}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider transition-colors">{p.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="max-w-[200px]">
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium line-clamp-2 transition-colors">
                          {p.address || '-'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      {p.medicalHistory ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold ring-1 ring-red-100 dark:ring-red-900/30 transition-colors">
                          <HeartPulse className="w-3.5 h-3.5" />
                          {p.medicalHistory}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600 font-medium italic transition-colors">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      {p.allergies ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold ring-1 ring-amber-100 dark:ring-amber-900/30 transition-colors">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {p.allergies}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300 dark:text-slate-600 font-medium italic transition-colors">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-4 py-5 text-xs text-slate-500 dark:text-slate-400 font-bold transition-colors">
                      {p.lastVisit || '-'}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onOpenEmr && onOpenEmr(p)}
                          className="px-4 py-2 bg-[#0E7490]/10 text-[#0E7490] text-[10px] font-black rounded-xl hover:bg-[#0E7490] hover:text-white transition-all flex items-center gap-2 hover-lift"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          EMR
                        </button>
                        <button 
                          onClick={() => {
                            const link = getWhatsAppLink(p.phone, `Halo *${p.name}*, kami dari *Praktek Gigi Ranida*...`);
                            window.open(link, '_blank');
                          }} 
                          className="p-2 text-emerald-500 hover:text-emerald-600 transition-colors hover-lift"
                          title="Hubungi via WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onEdit(p)} 
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors hover-lift"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDeleteMaster(p.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors hover-lift"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
            {filteredPatients.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-20 text-center text-slate-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-10" />
                <p className="text-sm font-bold uppercase tracking-widest italic">Data pasien tidak ditemukan</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
