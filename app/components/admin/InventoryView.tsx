'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { InventoryItem } from '@/app/types';
import { cn } from '@/lib/utils';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function InventoryView({ inventory, onEdit, onDelete, onAdd }: InventoryViewProps) {
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight transition-colors">Stok Inventori</h2>
        <button
          onClick={onAdd}
          className="w-full sm:w-auto bg-[#0E7490] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#00685d]/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Barang</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-slate-800 transition-colors duration-300">
        {/* Mobile View: Cards */}
        {mounted && isMobile && (
          <div className="md:hidden divide-y divide-gray-100 dark:divide-slate-800">
            {inventory.map((item) => (
              <div key={item.id} className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors">{item.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 transition-colors">{item.stock} {item.unit}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onEdit(item)} className="p-2 text-blue-600 bg-blue-50 rounded-lg">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl transition-colors">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Status Stok</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase transition-colors",
                    item.status === 'Low' ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" :
                      item.status === 'Out of Stock' ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  )}>{item.status}</span>
                </div>
              </div>
            ))}
            {inventory.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm italic">Belum ada data barang</div>
            )}
          </div>
        )}

        {/* Desktop View: Table */}
        {mounted && !isMobile && (
          <div className="hidden md:block overflow-x-auto no-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-800 transition-colors">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nama Barang</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Stok</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Satuan</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-800 dark:text-slate-100 transition-colors">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 transition-colors">{item.stock}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 transition-colors">{item.unit}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-[10px] font-bold uppercase transition-colors",
                        item.status === 'Low' ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" :
                          item.status === 'Out of Stock' ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                            "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                      )}>{item.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm italic">Belum ada data barang</td>
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
