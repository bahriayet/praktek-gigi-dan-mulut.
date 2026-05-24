import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  title, 
  description, 
  onConfirm, 
  onClose,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  isDestructive = false
}) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[600] bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 transition-colors duration-300"
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-colors ${isDestructive ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-500'}`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 transition-colors">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">{description}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`flex-1 px-6 py-3 text-white font-bold rounded-xl text-sm shadow-lg transition-all active:scale-95 ${isDestructive ? 'bg-red-600 shadow-red-200 hover:bg-red-700 dark:shadow-none' : 'bg-brand-500 shadow-brand-500/20 hover:bg-brand-600'}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
