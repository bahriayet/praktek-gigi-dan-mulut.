'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Plus, Trash2, Camera, Upload, X, Loader2, Home, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface PhotoItem {
  id: string;
  url: string;
  thumbnailUrl?: string; // Sesuai instruksi ekstensi Firebase Resize Images
  title: string;
  desc: string;
  timestamp: any;
}

interface GalleryManagementProps {
  photos: PhotoItem[];
  onAdd: (data: Omit<PhotoItem, 'id' | 'timestamp'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpload: (file: File) => Promise<string | null>;
  heroImageUrl?: string;
  onUpdateHero: (url: string) => Promise<void>;
  showToast?: (message: string, type?: 'success'|'error') => void;
  requestConfirm?: (options: any) => void;
}


// Utility Kompresi (Client-side) tetap dipertahankan untuk efisiensi sebelum upload
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new (window as any).Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          else reject(new Error('Compression failed'));
        }, 'image/jpeg', 0.8);
      };
    };
    reader.onerror = (e) => reject(e);
  });
};

export default function GalleryManagement({ photos, onAdd, onDelete, onUpload, heroImageUrl, onUpdateHero, showToast, requestConfirm }: GalleryManagementProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', desc: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      // Step 1: Compress
      const compressed = await compressImage(selectedFile);
      
      // Step 2: Upload ke Supabase Storage (Bucket 'images')
      const downloadUrl = await onUpload(compressed);

      
      if (!downloadUrl) {
        throw new Error('Gagal mendapatkan URL gambar dari Supabase');
      }
      
      // Step 3: Simpan Metadata ke Firestore (Koleksi 'photos')

      await onAdd({
        url: downloadUrl,
        title: formData.title,
        desc: formData.desc
      });
      
      setIsAdding(false);
      setFormData({ title: '', desc: '' });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error:', error);
      if (showToast) showToast('Gagal mengunggah foto', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <ImageIcon className="w-8 h-8 text-brand-500" />
            Manajemen Foto Real-Time
          </h2>
          <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-widest">Sinkronisasi otomatis dengan Firestore & Storage</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="px-6 py-3 bg-brand-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Unggah Foto
        </button>
      </div>

      {/* Hero Image Management Section */}
      <div className="p-8 bg-gradient-to-br from-brand-500/5 to-indigo-600/5 rounded-[40px] border border-brand-100 dark:border-brand-900/30">
        <div className="flex flex-col md:flex-row items-center gap-8">
           <div className="relative w-full md:w-64 h-40 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl shrink-0">
              <Image 
                src={heroImageUrl || '/images/dental_hero.png'} 
                alt="Hero Preview" 
                fill 
                className="object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 bg-brand-500 text-white text-[8px] font-black uppercase rounded-lg shadow-lg">
                Foto Beranda Aktif
              </div>
           </div>
           <div className="space-y-4 flex-1">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Foto Utama Beranda (Hero)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Ganti foto utama yang tampil di halaman depan (Landing Page). Pilih dari galeri di bawah atau unggah foto baru khusus untuk beranda.
              </p>
              <div className="flex flex-wrap gap-3">
                 <label className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await onUpload(file);
                          if (url) await onUpdateHero(url);
                        }
                      }}
                    />
                    Ganti Foto Utama
                 </label>

              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-premium"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tighter">Unggah Foto Baru</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Judul Foto</label>
                  <input 
                    required
                    disabled={loading}
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Keterangan</label>
                  <textarea 
                    required
                    disabled={loading}
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    value={formData.desc}
                    onChange={e => setFormData({...formData, desc: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative group h-52 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                  <input 
                    required
                    disabled={loading}
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-300 group-hover:text-brand-500 transition-colors" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih File Foto</p>
                    </>
                  )}
                </div>
                <button 
                  disabled={loading || !selectedFile}
                  type="submit"
                  className="w-full py-4 bg-brand-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-brand-500/20 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Camera className="w-4 h-4" /> Simpan ke Firestore</>}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((item) => (
          <motion.div 
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800">
              <Image 
                src={item.thumbnailUrl || item.url} // Gunakan thumbnail dari Firebase Extension jika ada
                alt={item.title} 
                fill 
                className="object-cover transition-transform group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => {
                    if (requestConfirm) {
                      requestConfirm({
                        title: 'Hapus Foto?',
                        description: 'Foto ini akan dihapus secara permanen dari galeri. Lanjutkan?',
                        confirmText: 'Ya, Hapus',
                        isDestructive: true,
                        onConfirm: () => onDelete(item.id)
                      });
                    } else {
                      if (confirm('Hapus foto ini?')) onDelete(item.id);
                    }
                  }}
                  className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onUpdateHero(item.url)}
                  className="p-3 bg-brand-500 text-white rounded-full hover:scale-110 transition-transform"
                  title="Jadikan Foto Utama Beranda"
                >
                  <Home className="w-5 h-5" />
                </button>
              </div>
              {item.thumbnailUrl && (
                <div className="absolute top-4 left-4 px-2 py-1 bg-brand-500/90 text-white text-[8px] font-black uppercase rounded-lg backdrop-blur-sm">
                  Optimized
                </div>
              )}
            </div>
            <div className="p-5">
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{item.title}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 line-clamp-1">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {photos.length === 0 && !isAdding && (
        <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/20 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-700">
          <ImageIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Belum ada foto yang tersimpan</p>
        </div>
      )}
    </div>
  );
}
