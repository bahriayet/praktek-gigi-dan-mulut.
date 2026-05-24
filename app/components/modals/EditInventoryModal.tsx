'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Pill } from 'lucide-react';
import { InventoryItem } from '@/app/types';
import { cn } from '@/lib/utils';

interface EditInventoryModalProps {
  item: InventoryItem;
  onClose: () => void;
  onSave: (data: Partial<InventoryItem>) => void;
}

export default function EditInventoryModal({ item, onClose, onSave }: EditInventoryModalProps) {
  const [formData, setFormData] = useState({
    name: item.name || '',
    stock: item.stock || 0,
    unit: item.unit || 'Pcs'
  });

  const status: 'Safe' | 'Low' | 'Out of Stock' =
    formData.stock <= 0 ? 'Out of Stock' :
      formData.stock < 10 ? 'Low' : 'Safe';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 w-full max-w-[calc(100vw-32px)] sm:max-w-md rounded-[32px] overflow-hidden shadow-2xl transition-colors duration-300"
      >
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center shadow-lg">
          <div>
            <h3 className="text-lg font-bold transition-colors"> {!item.id ? 'Tambah Barang' : 'Edit Barang'}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1 transition-colors">Stok & Inventaris Praktek</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 space-y-5 transition-colors">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Nama Barang / Matkes</label>
            <div className="relative">
              <Pill className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Amoxicillin 500mg"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-slate-100 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Jumlah Stok</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-slate-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Satuan</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-slate-100 appearance-none"
              >
                <option value="Pcs">Pcs</option>
                <option value="Box">Box</option>
                <option value="Botol">Botol</option>
                <option value="Tablet">Tablet</option>
                <option value="Strip">Strip</option>
                <option value="Tube">Tube</option>
                <option value="Ampul">Ampul</option>
                <option value="Vial">Vial</option>
                <option value="Masker">Masker</option>
                <option value="Sarung Tangan">Sarung Tangan</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex justify-between items-center border border-slate-100 dark:border-slate-800 transition-colors">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider transition-colors">Status Stok:</span>
            <span className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
              status === 'Low' ? "bg-orange-100 text-orange-600" :
                status === 'Out of Stock' ? "bg-red-100 text-red-600" :
                  "bg-green-100 text-green-600"
            )}>{status}</span>
          </div>
          <div className="pt-4 flex gap-3 transition-colors">
            <button onClick={onClose} className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold text-sm bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Batal</button>
            <button onClick={() => onSave({ ...formData, status })} className="flex-[2] py-3 bg-teal-600 dark:bg-teal-500 text-white font-bold rounded-xl shadow-lg shadow-teal-600/20 dark:shadow-none hover:bg-teal-700 dark:hover:bg-teal-600 transition-all active:scale-[0.98]">Simpan Perubahan</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
