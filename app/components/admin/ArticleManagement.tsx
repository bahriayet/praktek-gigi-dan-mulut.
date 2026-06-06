'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit3, 
  X, 
  Check, 
  FileText, 
  Eye, 
  Search,
  CheckCircle,
  EyeOff
} from 'lucide-react';
import { Article } from '@/app/types';

interface ArticleManagementProps {
  articles: Article[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string | undefined, updates: Partial<Article>) => Promise<void>;
  showToast?: (message: string, type?: 'success' | 'error') => void;
  requestConfirm?: (options: any) => void;
}

const CATEGORIES = ['Kebersihan', 'Pencegahan', 'Perawatan', 'Gigi Anak', 'Umum'];

export default function ArticleManagement({
  articles = [],
  onDelete,
  onUpdate,
  showToast,
  requestConfirm
}: ArticleManagementProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isPreviewOpen, setIsPreviewOpen] = useState<Article | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState('Kebersihan');
  const [published, setPublished] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenAdd = () => {
    setEditingArticle(null);
    setTitle('');
    setSummary('');
    setCategory('Kebersihan');
    setPublished(true);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (article: Article) => {
    setEditingArticle(article);
    setTitle(article.title);
    setSummary(article.summary);
    setCategory(article.category || 'Kebersihan');
    setPublished(article.published !== undefined ? article.published : true);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) {
      if (showToast) showToast('Judul dan Ringkasan harus diisi', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        category,
        published
      };

      await onUpdate(editingArticle?.id, payload);
      setIsFormOpen(false);
      setEditingArticle(null);
      setTitle('');
      setSummary('');
    } catch (error) {
      console.error('Error saving article:', error);
      if (showToast) showToast('Gagal menyimpan artikel', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      await onUpdate(article.id, { published: !article.published });
      if (showToast) {
        showToast(
          `Artikel ${!article.published ? 'diterbitkan' : 'disimpan sebagai draf'}`,
          'success'
        );
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      if (showToast) showToast('Gagal mengubah status publikasi', 'error');
    }
  };

  const handleDelete = (id: string) => {
    if (requestConfirm) {
      requestConfirm({
        title: 'Hapus Artikel?',
        description: 'Apakah Anda yakin ingin menghapus artikel edukasi ini? Tindakan ini tidak dapat dibatalkan.',
        confirmText: 'Ya, Hapus',
        isDestructive: true,
        onConfirm: () => onDelete(id)
      });
    } else {
      if (confirm('Hapus artikel ini?')) {
        onDelete(id);
      }
    }
  };

  // Filtering
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-brand-500" />
            Edukasi Kesehatan Gigi
          </h2>
          <p className="text-sm text-slate-500 mt-1 uppercase font-bold tracking-widest">
            Kelola artikel yang tampil pada Landing Page
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-6 py-3 bg-brand-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> Tulis Artikel
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari artikel..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs outline-none focus:ring-2 focus:ring-brand-500/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'All'
                ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
            }`}
          >
            Semua Kategori
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/10'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Form Dialog/Overlay */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
                  {editingArticle ? 'Edit Artikel' : 'Tulis Artikel Baru'}
                </h3>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Judul Artikel
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="Contoh: Manfaat Membersihkan Karang Gigi"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Category selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Kategori Artikel
                  </label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Konten / Ringkasan Edukasi
                  </label>
                  <textarea
                    required
                    rows={8}
                    placeholder="Tulis artikel atau edukasi kesehatan di sini..."
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                  />
                </div>

                {/* Publish Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100 block">
                      Terbitkan Langsung
                    </span>
                    <span className="text-xs text-slate-500">
                      Jika aktif, artikel akan langsung tampil secara publik di landing page.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex gap-4 shrink-0 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-brand-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Artikel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Dialog */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-premium w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                    Preview Tampilan
                  </span>
                </div>
                <button
                  onClick={() => setIsPreviewOpen(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-500">
                      Kategori: {isPreviewOpen.category || 'Kebersihan'}
                    </span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                      {isPreviewOpen.title}
                    </h3>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line font-medium">
                  {isPreviewOpen.summary}
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  onClick={() => setIsPreviewOpen(null)}
                  className="w-full py-3.5 bg-slate-900 dark:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all active:scale-95"
                >
                  Tutup Preview
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Grid List of articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <motion.div
            key={article.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="group bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
          >
            <div className="p-6 space-y-4 flex-1">
              {/* Header */}
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-wider rounded-lg">
                    {article.category || 'Kebersihan'}
                  </span>
                  <button
                    onClick={() => handleTogglePublish(article)}
                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 ${
                      article.published
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    }`}
                    title={article.published ? 'Klik untuk simpan ke Draf' : 'Klik untuk Terbitkan'}
                  >
                    {article.published ? (
                      <>
                        <CheckCircle className="w-2.5 h-2.5" /> Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-2.5 h-2.5" /> Draft
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Title & summary */}
              <div className="space-y-2">
                <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight line-clamp-2 leading-tight">
                  {article.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
              <button
                onClick={() => setIsPreviewOpen(article)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-brand-500 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(article)}
                  className="p-2 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Edit Artikel"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Hapus Artikel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/10 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {searchTerm || selectedCategory !== 'All' ? 'Artikel tidak ditemukan' : 'Belum ada artikel edukasi'}
          </p>
        </div>
      )}
    </div>
  );
}
