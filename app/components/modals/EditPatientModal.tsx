'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, UserCircle, Phone, MessageSquare, FileText, Wallet, Bot, MapPin, Calendar, Activity, ShieldAlert } from 'lucide-react';
import { QueueItem } from '@/app/types';
import { getLocalYMD } from '@/lib/utils';
import dynamic from 'next/dynamic';
const DoctorAiAssistant = dynamic(() => import('../admin/DoctorAiAssistant'), { ssr: false });



interface EditPatientModalProps {
  patient: QueueItem;
  onClose: () => void;
  onSave: (data: Partial<QueueItem>) => void;
}


export default function EditPatientModal({ patient, onClose, onSave }: EditPatientModalProps) {

  const [formData, setFormData] = useState({
    name: patient.name || '',
    phone: patient.phone || '',
    complaint: patient.complaint || '',
    treatment: patient.treatment || '',
    billingAmount: patient.billingAmount || 0,
    status: patient.status || 'WAITING',
    date: patient.date || getLocalYMD(),
    address: patient.address || '',
    birthDate: patient.birthDate || '',
    medicalHistory: patient.medicalHistory || '',
    allergies: patient.allergies || ''
  });


  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const isNew = patient.id === 'new';

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
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors duration-300"
      >
        <div className="bg-gradient-to-r from-brand-500 to-brand-500 p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-lg font-bold">{isNew ? 'Input Data Antrean Pasien' : 'Edit Data Pasien'}</h3>
            <p className="text-[10px] text-slate-200 uppercase tracking-widest font-bold mt-1">Manajemen Pasien & Antrean</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1 custom-scrollbar transition-colors">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Nama Lengkap</label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Alamat Lengkap</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm dark:text-slate-100 dark:placeholder:text-slate-600"
                  placeholder="Nama jalan / kota"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Tanggal Lahir</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm uppercase dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Nomor WhatsApp</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Status Antrean</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-100 appearance-none"
              >
                <option value="WAITING">Menunggu</option>
                <option value="CALLING">Dipanggil</option>
                <option value="SKIPPED">Dilewati</option>
                <option value="FINISHED">Selesai</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Tanggal Periksa</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-slate-700 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Keluhan Pasien</label>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/20 hover:shadow-brand-500/30 transition-all group scale-90"
                title="Tanya AI Asisten"
              >
                <Bot className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-wider">Robot AI</span>
              </button>
            </div>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
              <textarea
                value={formData.complaint}
                onChange={(e) => setFormData({ ...formData, complaint: e.target.value })}
                rows={2}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Tindakan Medis</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
              <input
                type="text"
                value={formData.treatment}
                onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-slate-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Biaya / Tagihan (Rp)</label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 font-bold transition-colors" />
              <input
                type="number"
                value={formData.billingAmount}
                onChange={(e) => setFormData({ ...formData, billingAmount: parseInt(e.target.value) || 0 })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3 transition-colors">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Riwayat Medis Umum (Penyakit Bawaan)</label>
              <div className="relative">
                <Activity className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
                <textarea
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 bg-red-50 dark:bg-rose-950/20 border border-red-100 dark:border-rose-900/30 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all resize-none text-sm text-red-900 dark:text-rose-200 placeholder:text-red-300 dark:placeholder:text-rose-900"
                  placeholder="Contoh: Asma, Hipertensi (Opsional)"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 transition-colors">Alergi (Obat/Makanan)</label>
              <div className="relative">
                <ShieldAlert className="absolute left-3 top-3 w-4 h-4 text-slate-400 dark:text-slate-500 transition-colors" />
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none text-sm text-amber-900 dark:text-amber-200 placeholder:text-amber-300 dark:placeholder:text-amber-900"
                  placeholder="Contoh: Alergi Amoxicillin, Alergi Bius (Opsional)"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0 transition-colors">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold text-sm bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Batal
            </button>
            <button
              onClick={() => onSave(formData)}
              className="flex-[2] py-3 bg-brand-500 dark:bg-brand-500 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all"
            >
              {isNew ? 'Tambah Pasien ke Antrean' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </motion.div>

      {isAiModalOpen && (
        <DoctorAiAssistant 
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          patientData={{
            name: formData.name || 'Pasien',
            medicalHistory: formData.medicalHistory
          }}
          initialInput={formData.complaint}
          onApply={(content) => {
            setFormData({ ...formData, treatment: content });
            setIsAiModalOpen(false);
          }}
        />
      )}

    </motion.div>
  );
}
