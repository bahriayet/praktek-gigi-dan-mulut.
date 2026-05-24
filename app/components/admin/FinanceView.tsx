'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Download, 
  Wallet, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search,
  ArrowRightCircle
} from 'lucide-react';
import { QueueItem } from '@/app/types';
import { cn, getLocalYMD } from '@/lib/utils';
import { updateDocObj } from '@/lib/firestoreService';

interface FinanceViewProps {
  finishedQueue: QueueItem[];
  onAdd: () => void;
  onEdit: (patient: QueueItem) => void;
  onDelete: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  showToast?: (message: string, type?: 'success'|'error') => void;
  requestConfirm?: (options: any) => void;
}

export default function FinanceView({ finishedQueue, onAdd, onEdit, onDelete, searchTerm, setSearchTerm, showToast, requestConfirm }: FinanceViewProps) {
  const filteredQueue = finishedQueue.filter(q => 
    q.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (q.billingAmount || 0).toString().includes(searchTerm) ||
    q.treatment?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPayments = filteredQueue.filter(q => q.status === 'PAID');
  const finalizedPayments = filteredQueue.filter(q => q.status === 'FINISHED');

  const totalRevenue = finalizedPayments.reduce((sum, q) => sum + (q.billingAmount || 0), 0);
  const pendingRevenue = pendingPayments.reduce((sum, q) => sum + (q.billingAmount || 0), 0);
  
  const handleFinalize = async (id: string) => {
    const action = async () => {
      await updateDocObj('queues', id, { status: 'FINISHED' });
      if (showToast) showToast('Pembayaran dikonfirmasi selesai', 'success');
    };

    if (requestConfirm) {
      requestConfirm({
        title: 'Konfirmasi Pembayaran',
        description: 'Pasien ini sudah menyelesaikan pembayaran?',
        confirmText: 'Ya, Selesai',
        onConfirm: action
      });
    } else {
      if (window.confirm('Pasien ini sudah menyelesaikan pembayaran?')) {
        await action();
      }
    }
  };

  const handleDownloadCSV = () => {
    if (finalizedPayments.length === 0) {
      if (showToast) showToast('Tidak ada data transaksi final yang tersedia.', 'error');
      return;
    }

    const headers = ['No. Antrean', 'Nama', 'Nomor WA', 'Tanggal', 'Waktu', 'Tindakan', 'Biaya'];
    const rows = finalizedPayments.map(q => [
      q.number,
      q.name,
      `'${q.phone}`, 
      q.date,
      q.time,
      q.treatment || '-',
      q.billingAmount || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        const str = String(cell).replace(/"/g, '""');
        return `"${str}"`;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Finansial_${getLocalYMD()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Manajemen Keuangan</h2>
          <p className="text-[10px] md:text-sm text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-[0.2em] font-bold transition-colors">Laporan Transaksi & Konfirmasi Kasir</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="px-5 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Unduh Laporan
          </button>
          <button
            onClick={onAdd}
            className="px-6 py-3 bg-[#0E7490] text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#004d45] transition-all shadow-xl shadow-[#00685d]/20 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Tambah Manual
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-[32px] shadow-2xl relative overflow-hidden group border border-transparent dark:border-slate-800 transition-colors">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#0E7490]/20 rounded-full blur-2xl group-hover:bg-[#0E7490]/30 transition-all" />
          <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-[0.2em] mb-4">Total Pendapatan Final</p>
          <div className="flex items-baseline gap-2">
            <span className="text-teal-400 font-black text-xl">Rp</span>
            <h3 className="text-4xl font-black text-white tracking-tighter">{totalRevenue.toLocaleString('id-ID')}</h3>
          </div>
          <div className="mt-6 flex items-center gap-2">
             <div className="px-2 py-1 bg-emerald-500/10 rounded-md text-[9px] font-black text-emerald-400 uppercase tracking-widest">Confirmed</div>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{finalizedPayments.length} Pasien Selesai</p>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-8 rounded-[32px] border border-white dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none relative overflow-hidden group transition-colors">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Piutang Menunggu (Pending)</p>
          <div className="flex items-baseline gap-2">
            <span className="text-amber-500 font-black text-xl">Rp</span>
            <h3 className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tighter transition-colors">{pendingRevenue.toLocaleString('id-ID')}</h3>
          </div>
          <div className="mt-6 flex items-center gap-2">
             <div className="px-2 py-1 bg-amber-100 rounded-md text-[9px] font-black text-amber-600 uppercase tracking-widest">Waiting</div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{pendingPayments.length} Antrean Pembayaran</p>
          </div>
        </div>

        <div className="bg-emerald-50/50 dark:bg-emerald-500/10 p-8 rounded-[32px] border border-emerald-100/50 dark:border-emerald-500/20 relative overflow-hidden hidden lg:block transition-colors">
           <div className="flex items-start justify-between">
              <div>
                 <p className="text-[10px] font-black text-emerald-700/60 dark:text-emerald-400/60 uppercase tracking-[0.2em] mb-4">Laju Layanan</p>
                 <h3 className="text-4xl font-black text-emerald-900 dark:text-emerald-100 tracking-tighter transition-colors">8.4<span className="text-xl">m</span></h3>
                 <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400 font-bold uppercase tracking-widest mt-2 transition-colors">Rata-rata Waktu Bayar</p>
              </div>
              <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm transition-colors">
                 <Clock className="w-6 h-6" />
              </div>
           </div>
        </div>
      </div>

      {/* Main Sections Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Pending Payments Column */}
        <div className="xl:col-span-5 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 transition-colors">
               <Wallet className="w-4 h-4 text-amber-500" /> Konfirmasi Kasir
            </h3>
            <div className="px-2 py-1 bg-amber-500 text-white rounded-lg text-[9px] font-black">{pendingPayments.length}</div>
          </div>

          <div className="space-y-4">
             {pendingPayments.map((p) => (
               <motion.div 
                 layout
                 key={p.id} 
                 className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border border-amber-100 dark:border-amber-900/30 shadow-xl shadow-amber-500/5 dark:shadow-none hover:border-amber-400 dark:hover:border-amber-600 transition-all group"
               >
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-sm border border-amber-100 dark:border-amber-900/30 transition-colors">
                          {p.number}
                       </div>
                       <div>
                          <h4 className="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight transition-colors">{p.name}</h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">{p.time}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tagihan</p>
                       <p className="text-lg font-black text-amber-600 tracking-tighter leading-none mt-1">Rp {(p.billingAmount || 0).toLocaleString('id-ID')}</p>
                    </div>
                 </div>

                 <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-5 text-[11px] font-medium text-slate-500 dark:text-slate-400 italic block line-clamp-1 transition-colors">
                   &quot;{p.treatment || 'Konsultasi Gigi'}&quot;
                 </div>

                 <button
                    onClick={() => handleFinalize(p.id)}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 group-hover:scale-[1.02]"
                 >
                    Konfirmasi Selesai <CheckCircle2 className="w-4 h-4" />
                 </button>
               </motion.div>
             ))}
             {pendingPayments.length === 0 && (
               <div className="py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-800">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200 dark:text-slate-700">
                     <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Semua pembayaran beres</p>
               </div>
             )}
          </div>
        </div>

        {/* History Column */}
        <div className="xl:col-span-7 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest flex items-center gap-2 transition-colors">
                 <Clock className="w-4 h-4 text-emerald-500" /> Riwayat Hari Ini
              </h3>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600 transition-colors" />
                 <input 
                   type="text" 
                   placeholder="Cari transaksi..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold w-[180px] focus:w-[240px] transition-all outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
                 />
              </div>
           </div>

           <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[40px] border border-white dark:border-slate-800 shadow-premium dark:shadow-none overflow-hidden transition-colors">
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 transition-colors">
                     <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pasien</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tindakan</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Jumlah</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aksi</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                     {finalizedPayments.map((q) => (
                       <tr key={q.id} className="hover:bg-white dark:hover:bg-slate-800 transition-colors group">
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-center text-[10px] font-black text-emerald-700 dark:text-emerald-400 transition-colors">
                                   {q.number}
                                </div>
                                <div>
                                   <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate max-w-[120px] transition-colors">{q.name}</p>
                                   <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase transition-colors">{q.time}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5">
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px] transition-colors">{q.treatment || '-'}</p>
                          </td>
                          <td className="px-6 py-5">
                             <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Rp {(q.billingAmount || 0).toLocaleString('id-ID')}</p>
                          </td>
                          <td className="px-6 py-5">
                             <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEdit(q)} className="p-2 text-slate-400 hover:text-[#0E7490] hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"><Pencil className="w-4 h-4" /></button>
                                <button onClick={() => onDelete(q.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                             </div>
                          </td>
                       </tr>
                     ))}
                     {finalizedPayments.length === 0 && (
                       <tr>
                          <td colSpan={4} className="px-6 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-[0.2em] opacity-40">Belum ada riwayat transaksi</td>
                       </tr>
                     )}
                  </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
