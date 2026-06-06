'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Search, 
  User, 
  Tag, 
  RefreshCw,
  Database,
  Trash2,
  Archive,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { archiveAndDeleteOldLogs } from '@/lib/firestoreService';

interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: string;
  docId: string | null;
  userId: string;
  userName: string;
  userEmail: string;
  summary: string;
  timestamp: Timestamp | null;
}

interface AuditLogViewProps {
  showToast?: (message: string, type?: 'success' | 'error') => void;
  requestConfirm?: (options: any) => void;
}

export default function AuditLogView({ showToast, requestConfirm }: AuditLogViewProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [collectionFilter, setCollectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [limitCount, setLimitCount] = useState<number>(150);

  // Archive modal state
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveDays, setArchiveDays] = useState<number>(90);
  const [archiving, setArchiving] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const logsRef = collection(db, 'auditLogs');
      const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snap = await getDocs(q);
      const fetchedLogs = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AuditLog[];
      setLogs(fetchedLogs);
    } catch (e) {
      console.error("Gagal mengambil log audit:", e);
      if (showToast) showToast("Gagal memuat log aktivitas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [limitCount]);

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const { deletedCount } = await archiveAndDeleteOldLogs(archiveDays);
      setShowArchiveModal(false);
      if (deletedCount === 0) {
        if (showToast) showToast(`Tidak ada log lebih dari ${archiveDays} hari yang ditemukan.`, 'error');
      } else {
        if (showToast) showToast(`✅ Berhasil! ${deletedCount} log diarsipkan & dihapus dari Firestore.`, 'success');
        fetchLogs(); // refresh tampilan
      }
    } catch (e) {
      console.error('Gagal mengarsipkan log:', e);
      if (showToast) showToast('Gagal mengarsipkan log. Coba lagi.', 'error');
    } finally {
      setArchiving(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesCollection = collectionFilter === 'all' || log.collection === collectionFilter;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      log.userName?.toLowerCase().includes(searchLower) ||
      log.userEmail?.toLowerCase().includes(searchLower) ||
      log.summary?.toLowerCase().includes(searchLower) ||
      log.collection?.toLowerCase().includes(searchLower);

    return matchesAction && matchesCollection && matchesSearch;
  });

  const formatTime = (ts: Timestamp | null) => {
    if (!ts) return '-';
    try {
      const date = ts.toDate ? ts.toDate() : new Date(ts as any);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return '-';
    }
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
      case 'UPDATE':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30';
      case 'DELETE':
        return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-100 dark:border-slate-800';
    }
  };

  const getCollectionBadgeClass = (col: string) => {
    switch (col) {
      case 'patients':
        return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/10';
      case 'queues':
        return 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/10';
      case 'visits':
        return 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/10';
      case 'inventory':
        return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/10';
      case 'users':
        return 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-900/10';
      default:
        return 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800';
    }
  };

  const getFriendlyCollection = (col: string) => {
    switch (col) {
      case 'patients': return 'Pasien';
      case 'queues': return 'Antrean';
      case 'visits': return 'Rekam Medis';
      case 'inventory': return 'Stok';
      case 'users': return 'Staf';
      case 'config': return 'Konfigurasi';
      default: return col;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-4 md:space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
        <div>
          <h2 className="text-lg md:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Log Aktivitas Klinik</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Audit trail perubahan data klinis oleh tim dan staf medis.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 active:scale-95 transition-all"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span>Segarkan Log</span>
          </button>
          <button
            onClick={() => setShowArchiveModal(true)}
            className="w-full sm:w-auto bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2.5 active:scale-95 transition-all"
          >
            <Archive className="w-4 h-4" />
            <span>Arsipkan &amp; Hapus Lama</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between transition-colors duration-300">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 w-full text-xs md:text-sm focus:ring-2 focus:ring-brand-500/20 outline-none dark:text-slate-200 dark:placeholder:text-slate-500 transition-all"
            placeholder="Cari log atau nama staf..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-600 dark:text-slate-300 outline-none font-bold cursor-pointer"
            >
              <option value="all">Semua Aksi</option>
              <option value="CREATE">CREATE (Tambah)</option>
              <option value="UPDATE">UPDATE (Edit)</option>
              <option value="DELETE">DELETE (Hapus)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={collectionFilter}
              onChange={(e) => setCollectionFilter(e.target.value)}
              className="bg-transparent border-none text-xs text-slate-600 dark:text-slate-300 outline-none font-bold cursor-pointer"
            >
              <option value="all">Semua Data</option>
              <option value="patients">Pasien</option>
              <option value="queues">Antrean</option>
              <option value="visits">Rekam Medis</option>
              <option value="inventory">Stok</option>
              <option value="users">Staf</option>
              <option value="config">Konfigurasi</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400">Limit:</span>
            <select
              value={limitCount}
              onChange={(e) => setLimitCount(Number(e.target.value))}
              className="bg-transparent border-none text-xs text-slate-600 dark:text-slate-300 outline-none font-bold cursor-pointer"
            >
              <option value="50">50</option>
              <option value="150">150</option>
              <option value="300">300</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800 transition-colors duration-300">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-10 h-10 text-brand-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Memuat Log Aktivitas...</p>
          </div>
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", getActionBadgeClass(log.action))}>
                          {log.action}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider", getCollectionBadgeClass(log.collection))}>
                          {getFriendlyCollection(log.collection)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold">{formatTime(log.timestamp)}</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                    {log.summary}
                  </p>

                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="text-[11px] font-medium leading-none">
                      <span className="text-slate-700 dark:text-slate-200 font-bold block">{log.userName}</span>
                      <span className="text-slate-400 block mt-0.5">{log.userEmail}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredLogs.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm italic">Tidak ada log aktivitas yang ditemukan</div>
              )}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto no-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 transition-colors">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Waktu</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Staf / Pengguna</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Aksi</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kategori Data</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ringkasan Aktivitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatTime(log.timestamp)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 font-black text-[10px]">
                            {(log.userName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="text-xs">
                            <span className="text-slate-800 dark:text-slate-200 font-bold block">{log.userName}</span>
                            <span className="text-slate-400 block mt-0.5 text-[10px]">{log.userEmail}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", getActionBadgeClass(log.action))}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", getCollectionBadgeClass(log.collection))}>
                          {getFriendlyCollection(log.collection)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate md:max-w-md">
                        {log.summary}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                        Tidak ada log aktivitas yang ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Archive Modal ── */}
      <AnimatePresence>
        {showArchiveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget && !archiving) setShowArchiveModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 w-full max-w-md overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-rose-50 dark:bg-rose-950/30 border-b border-rose-100 dark:border-rose-900/40 p-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center shrink-0">
                    <Archive className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Arsipkan &amp; Hapus Log Lama</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">File backup akan otomatis diunduh sebelum dihapus</p>
                  </div>
                </div>
                {!archiving && (
                  <button onClick={() => setShowArchiveModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mt-0.5">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Warning box */}
                <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                    Log yang dihapus dari Firestore <span className="font-black">tidak dapat dikembalikan</span>. Pastikan file arsip berhasil terunduh sebelum menutup halaman.
                  </p>
                </div>

                {/* Period selector */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Hapus log lebih dari:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[30, 60, 90, 180].map(days => (
                      <button
                        key={days}
                        onClick={() => setArchiveDays(days)}
                        className={cn(
                          'py-3 rounded-2xl text-xs font-black transition-all border',
                          archiveDays === days
                            ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800'
                        )}
                      >
                        {days}h
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                    Akan menghapus semua log yang dibuat sebelum <span className="font-bold text-slate-600 dark:text-slate-300">{new Date(Date.now() - archiveDays * 86400000).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                </div>

                {/* Info list */}
                <div className="space-y-2">
                  {[
                    'File .json akan otomatis diunduh ke komputer Anda',
                    'Log di Firestore akan dihapus secara permanen',
                    'Data pasien & rekam medis tidak terpengaruh',
                  ].map((info, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-600 dark:text-slate-400">{info}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => setShowArchiveModal(false)}
                  disabled={archiving}
                  className="flex-1 py-3 rounded-2xl text-xs font-black text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleArchive}
                  disabled={archiving}
                  className="flex-1 py-3 rounded-2xl text-xs font-black text-white bg-rose-500 hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-rose-500/20 active:scale-95"
                >
                  {archiving ? (
                    <><RefreshCw className="w-4 h-4 animate-spin" /><span>Memproses...</span></>
                  ) : (
                    <><Trash2 className="w-4 h-4" /><span>Arsipkan &amp; Hapus</span></>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
