'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClinicUser } from '@/app/types';
import { cn } from '@/lib/utils';
import { Pencil, Check, X } from 'lucide-react';

interface StaffViewProps {
  users: ClinicUser[];
  onUpdateRole: (uid: string, role: 'admin' | 'doctor' | 'patient') => void;
  onUpdateName: (uid: string, name: string) => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
  requestConfirm?: (options: any) => void;
}

export default function StaffView({ users, onUpdateRole, onUpdateName }: StaffViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const startEdit = (u: ClinicUser) => {
    setEditingId(u.id);
    setEditingName(u.displayName || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveEdit = (uid: string) => {
    const trimmed = editingName.trim();
    if (trimmed) {
      onUpdateName(uid, trimmed);
    }
    setEditingId(null);
    setEditingName('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 md:space-y-8"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Manajemen Staf</h2>
            <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest font-semibold transition-colors">Access Control &amp; Roles</p>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="md:hidden divide-y divide-gray-50 dark:divide-slate-800">
          {users.map((u) => (
            <div key={u.id} className="py-2.5 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs shrink-0 transition-colors">
                  {u.displayName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0 flex-1">
                  {editingId === u.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(u.id); if (e.key === 'Escape') cancelEdit(); }}
                        className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-cyan-500 w-full"
                        placeholder="Masukkan nama..."
                      />
                      <button onClick={() => saveEdit(u.id)} className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors shrink-0"><Check className="w-3 h-3" /></button>
                      <button onClick={cancelEdit} className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg hover:bg-red-200 transition-colors shrink-0"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate transition-colors">{u.displayName || <span className="text-slate-400 italic font-normal">User Tanpa Nama</span>}</p>
                      <button onClick={() => startEdit(u)} className="p-1 text-slate-400 hover:text-cyan-500 transition-colors shrink-0"><Pencil className="w-3 h-3" /></button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 break-all transition-colors">{u.email}</p>
                </div>
                <span className={cn(
                  "shrink-0 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider transition-colors",
                  u.role === 'admin' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" :
                    u.role === 'doctor' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" :
                      "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500"
                )}>
                  {u.role || 'patient'}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => onUpdateRole(u.id, 'doctor')}
                  className="px-2 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 active:scale-95 transition-all text-center"
                >
                  DOKTER
                </button>
                <button
                  onClick={() => onUpdateRole(u.id, 'admin')}
                  className="px-2 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[9px] font-bold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 active:scale-95 transition-all text-center"
                >
                  ADMIN
                </button>
                <button
                  onClick={() => onUpdateRole(u.id, 'patient')}
                  className="px-2 py-2 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-95 transition-all text-center"
                >
                  RESET
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm italic">Data staf tidak ditemukan</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100 dark:border-slate-800 transition-colors">
                <th className="pb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Nama / Email</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Peran</th>
                <th className="pb-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs transition-colors">
                        {u.displayName?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        {editingId === u.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(u.id); if (e.key === 'Escape') cancelEdit(); }}
                              className="text-sm font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-cyan-500 w-48"
                              placeholder="Masukkan nama..."
                            />
                            <button onClick={() => saveEdit(u.id)} className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="Simpan"><Check className="w-4 h-4" /></button>
                            <button onClick={cancelEdit} className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg hover:bg-red-200 transition-colors" title="Batal"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors">
                              {u.displayName || <span className="text-slate-400 italic font-normal">User Tanpa Nama</span>}
                            </p>
                            <button
                              onClick={() => startEdit(u)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-cyan-500 transition-all"
                              title="Edit nama"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 break-all transition-colors">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      u.role === 'admin' ? "bg-purple-100 text-purple-600" :
                        u.role === 'doctor' ? "bg-blue-100 text-blue-600" :
                          "bg-gray-100 text-slate-600"
                    )}>
                      {u.role || 'patient'}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2 text-[10px]">
                      <button
                        onClick={() => onUpdateRole(u.id, 'doctor')}
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                      >
                        Dokter
                      </button>
                      <button
                        onClick={() => onUpdateRole(u.id, 'admin')}
                        className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => onUpdateRole(u.id, 'patient')}
                        className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
