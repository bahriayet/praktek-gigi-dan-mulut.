'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, ClipboardList } from 'lucide-react';
import { SoapVisit } from '@/app/types';
import SoapForm from '../medical-record/SoapForm';

interface EditVisitModalProps {
  visit: SoapVisit;
  onClose: () => void;
  onSave: (data: Partial<SoapVisit>) => void;
}

export default function EditVisitModal({ visit, onClose, onSave }: EditVisitModalProps) {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async (data: Partial<SoapVisit>) => {
    setIsSaving(true);
    try {
      await onSave(data);
    } finally {
      setIsSaving(false);
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
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-slate-100 dark:bg-slate-950 w-full max-w-4xl h-[90vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col transition-colors duration-300"
      >
        <div className="bg-[#00685d] p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Edit Rekam Medis</h3>
              <p className="text-[10px] text-teal-100 uppercase tracking-widest font-black opacity-80">
                Pasien: {(visit as any).patientName || 'Anonim'} • Tgl: {visit.date}
              </p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} className="p-2 hover:bg-white/10 rounded-full transition-all disabled:opacity-50">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <SoapForm 
            initialData={visit} 
            onSave={handleSave}
            isLoading={isSaving}
          />
        </div>
        
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-500 dark:text-slate-400 font-bold text-sm bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            Batal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
