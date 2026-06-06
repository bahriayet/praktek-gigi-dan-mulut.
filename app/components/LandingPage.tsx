'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Calendar,
  Activity,
  Bot,
  Clock,
  MapPin,
  Phone,
  ChevronRight,
  Sparkles,
  Shield,
  Heart,
  Image as ImageIcon,
  Star,
  ArrowRight,
  ShieldAlert,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/app/components/ThemeToggle';
import { View, Article } from '@/app/types';

interface LandingPageProps {
  onNavigate: (view: View) => void;
  onGallery: () => void;
  isStaff?: boolean;
  queueCount?: number;
  clinicConfig?: any;
  photos?: any[];
  articles?: Article[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function LandingPage({ onNavigate, onGallery, isStaff, queueCount = 0, clinicConfig, photos, articles = [] }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    
    // Beri sedikit waktu agar menu tertutup sebelum scroll dimulai (lebih stabil di HP)
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const offset = 80;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const hasArticles = articles.some(a => a.published);
  const navLinks = [
    { label: 'Layanan', id: 'layanan' },
    { label: 'Cara Kerja', id: 'cara-kerja' },
    ...(hasArticles ? [{ label: 'Artikel', id: 'edukasi' }] : []),
    { label: 'Fasilitas', id: 'fasilitas' },
    { label: 'Tentang', id: 'tentang' },
  ];
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* ─── NAVBAR ─── */}
      <nav className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled 
          ? "backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/50 dark:border-slate-800/50 shadow-lg shadow-slate-200/20 dark:shadow-none" 
          : "bg-transparent border-b border-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 md:h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-brand-600 flex items-center justify-center p-1.5 md:p-2 shadow-lg border border-brand-500">
              <div className="relative w-full h-full">
                <Image src="/images/logo-ranida.png" alt="Logo Klinik Gigi Ranida" fill className="object-contain" />
              </div>
            </div>
            <div>
              <div className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                Praktek Gigi <span className="text-brand-600">Ranida</span>
              </div>
              <p className="text-[8px] md:text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">
                Praktek Mandiri Terapis Gigi
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="px-4 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-brand-600 dark:hover:text-brand-400 transition-colors rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/5"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-500" />
            
            <Link href="/patient" className="hidden md:flex px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brand-600/20 items-center gap-2 transition-all">
              <Calendar className="w-3.5 h-3.5" />
              Daftar Antrean
            </Link>

            {isStaff && (
              <Link href="/admin" className="hidden md:flex px-4 py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg hover-lift items-center gap-2">
                Admin
              </Link>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/5 hover:text-brand-600 transition-all"
                  >
                    {link.label}
                  </button>
                ))}
                
                <Link 
                  href="/monitor"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-500/5 hover:text-brand-600 transition-all flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-emerald-500" /> Live Monitor
                </Link>

                {isStaff && (
                  <Link 
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
                  >
                    🔒 Dashboard Admin
                  </Link>
                )}

                <div className="pt-2">
                  <Link 
                    href="/patient"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3.5 bg-brand-600 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Daftar Antrean
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 md:pt-20 pb-16 md:pb-28">
          
          {clinicConfig?.isClosed && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-8 bg-gradient-to-tr from-brand-600 to-brand-400 rounded-[32px] text-white shadow-2xl shadow-brand-500/30 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden hover-lift"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <ShieldAlert className="w-32 h-32" />
              </div>
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                 <ShieldAlert className="w-10 h-10" />
              </div>
              <div className="text-center sm:text-left z-10">
                 <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Klinik Sedang Tutup</h3>
                 <p className="text-sm md:text-base font-medium opacity-90 leading-relaxed mt-2 max-w-2xl">
                    {clinicConfig?.holidayMessage || "Kami sedang tidak beroperasi saat ini. Silakan cek kembali nanti atau hubungi admin via WhatsApp."}
                 </p>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-8 text-center lg:text-left"
            >

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter"
              >
                Senyum Sehat{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">
                  Dimulai Dari Sini.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto lg:mx-0 leading-relaxed"
              >
                Daftar antrean online, pantau giliran Anda secara real-time, dan dapatkan perawatan gigi terbaik dengan teknologi modern.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => onNavigate('patient')}
                  className="group px-8 py-4 md:py-5 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-brand-600/25 hover:shadow-brand-600/40 transition-all duration-300 flex items-center justify-center gap-3 hover-lift"
                >
                  <Calendar className="w-5 h-5" />
                  Daftar Antrean
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('monitor')}
                  className="group px-8 py-4 md:py-5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-black text-xs md:text-sm uppercase tracking-[0.2em] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 hover-lift"
                >
                  <Activity className="w-5 h-5 text-brand-600" />
                  Live Monitor
                </button>
              </motion.div>

              {/* Queue Counter */}
              {queueCount > 0 && (
                <motion.div variants={fadeUp} custom={4} className="flex items-center gap-3 justify-center lg:justify-start">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black">{queueCount}</span> pasien dalam antrean hari ini
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-[40px] md:rounded-[48px] overflow-hidden shadow-2xl shadow-slate-300/30 dark:shadow-none border border-slate-100 dark:border-slate-800">
                <Image
                  src={clinicConfig?.heroImageUrl || "/images/dental_hero.png"}
                  alt="Fasilitas Klinik Gigi Premium"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── MEDICAL SERVICES ─── */}
      <section id="layanan" className="relative py-20 md:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-4">
              Layanan Medis
            </motion.p>
            <motion.h3 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Perawatan Gigi Terbaik
            </motion.h3>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { title: 'Konsultasi & Periksa', desc: 'Pemeriksaan rutin dan konsultasi keluhan gigi dan mulut.', icon: '🩺' },
              { title: 'Pembersihan Karang', desc: 'Scaling untuk mencegah radang gusi dan bau mulut.', icon: '✨' },
              { title: 'Penambalan Gigi', desc: 'Penambalan estetik dengan bahan komposit berkualitas.', icon: '🦷' },
              { title: 'Pencabutan Gigi', desc: 'Pencabutan gigi susu, dewasa, atau impaksi gigi bungsu.', icon: '💉' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all group">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform">{s.icon}</div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{s.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── DIGITAL FEATURES ─── */}
      <section id="fitur-digital" className="relative py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-4">
              Fasilitas Digital
            </motion.p>
            <motion.h3 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Kemudahan dalam Genggaman
            </motion.h3>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {[
              {
                icon: <Calendar className="w-7 h-7" />,
                title: 'Antrean Online',
                desc: 'Daftar dari rumah, dapatkan nomor antrean, dan datang tepat waktu tanpa menunggu lama.',
                color: 'brand',
                action: () => onNavigate('patient'),
              },
              {
                icon: <Activity className="w-7 h-7" />,
                title: 'Live Monitoring',
                desc: 'Pantau status antrean secara real-time lengkap dengan notifikasi suara saat giliran Anda.',
                color: 'emerald',
                action: () => onNavigate('monitor'),
              },
              {
                icon: <ImageIcon className="w-7 h-7" />,
                title: 'Galeri Klinik',
                desc: 'Lihat fasilitas modern dan peralatan canggih yang kami gunakan untuk perawatan Anda.',
                color: 'indigo',
                action: onGallery,
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                onClick={f.action}
                className={cn(
                  'group glass-premium rounded-[32px] p-8 md:p-10 cursor-pointer transition-all duration-500 hover-lift border-glow relative overflow-hidden'
                )}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-brand-500/10 transition-colors duration-500" />
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110',
                    f.color === 'brand' && 'bg-brand-500/10 text-brand-600',
                    f.color === 'emerald' && 'bg-emerald-500/10 text-emerald-600',
                    f.color === 'indigo' && 'bg-indigo-500/10 text-indigo-600'
                  )}
                >
                  {f.icon}
                </div>
                <h4 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{f.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{f.desc}</p>
                <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-widest group-hover:gap-3 transition-all">
                  <span>Buka</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="cara-kerja" className="py-20 md:py-28 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-4">
              Cara Kerja
            </motion.p>
            <motion.h3 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              3 Langkah Mudah
            </motion.h3>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { step: '01', title: 'Daftar Online', desc: 'Isi formulir pendaftaran antrean melalui portal pasien kami.' },
              { step: '02', title: 'Pantau Antrean', desc: 'Cek posisi antrean Anda secara real-time dari mana saja.' },
              { step: '03', title: 'Datang & Periksa', desc: 'Tiba di klinik tepat waktu dan langsung mendapat perawatan.' },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} className="relative text-center">
                <div className="text-[80px] md:text-[100px] font-black text-slate-100 dark:text-slate-800/50 leading-none select-none">{s.step}</div>
                <div className="mt-[-30px] md:mt-[-40px] relative z-10">
                  <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{s.title}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── ARTICLES SECTION ─── */}
      {articles.filter(a => a.published).length > 0 && (
        <section id="edukasi" className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/50 dark:border-slate-800/50 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} custom={0} className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.3em] mb-4">
                Edukasi Kesehatan Gigi
              </motion.p>
              <motion.h3 variants={fadeUp} custom={1} className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                Tips & Artikel Bermanfaat
              </motion.h3>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {articles
                .filter(a => a.published)
                .slice(0, 3)
                .map((art, i) => (
                  <motion.div
                    key={art.id}
                    variants={fadeUp}
                    custom={i}
                    className="group bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all flex flex-col justify-between hover-lift duration-300"
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                          {art.category || 'Kebersihan'}
                        </span>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight line-clamp-2 leading-tight group-hover:text-brand-600 transition-colors">
                          {art.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-4 font-medium">
                          {art.summary}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => setSelectedArticle(art)}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors flex items-center gap-1.5"
                      >
                        Baca Selengkapnya <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── GALLERY PREVIEW ─── */}
      <section id="fasilitas" className="py-20 md:py-28 bg-white dark:bg-slate-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="flex flex-col items-center gap-8 mb-16 text-center"
          >
            <div className="flex flex-col items-center">
              <motion.p variants={fadeUp} custom={0} className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.3em] mb-4">
                Fasilitas Klinik
              </motion.p>
              <motion.h3 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Kenyamanan Anda <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500 dark:from-brand-400 dark:to-teal-400">Prioritas Kami</span>
              </motion.h3>
            </div>
            <motion.button 
              variants={fadeUp} custom={2}
              onClick={onGallery}
              className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white rounded-2xl text-sm font-bold transition-all flex items-center gap-3 border border-slate-200 dark:border-white/10 backdrop-blur-sm"
            >
              Lihat Semua Foto <ChevronRight className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </motion.button>
          </motion.div>

          {photos && photos.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="flex flex-wrap justify-center gap-4 md:gap-6"
            >
              {photos.slice(0, 4).map((p, i) => (
                <motion.div 
                  key={i} 
                  variants={fadeUp} 
                  custom={i} 
                  className="relative aspect-square w-[calc(50%-1rem)] md:w-[calc(25%-1.5rem)] min-w-[150px] max-w-[280px] rounded-3xl overflow-hidden group border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl"
                >
                  <Image src={p.url} alt={p.title || 'Galeri'} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-sm">{p.title || 'Fasilitas'}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="w-full sm:w-64 h-64 shrink-0 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700/50" />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── ABOUT ─── */}
      <section id="tentang" className="py-20 md:py-28 bg-slate-50/50 dark:bg-slate-900/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="max-w-4xl mx-auto text-center space-y-12"
          >
            <motion.div variants={fadeUp} custom={0} className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-4">Tentang Kami</p>
                <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Pelayanan Kesehatan Gigi <span className="text-brand-600">Profesional</span>
                </h3>
              </div>
              <p className="text-sm md:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                Praktek Gigi Ranida hadir untuk memberikan pelayanan kesehatan gigi dan mulut yang berkualitas dengan peralatan modern dan tenaga ahli yang berpengalaman. Kami berkomitmen menjaga senyum sehat Anda.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} custom={1} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Clock className="w-6 h-6" />, label: 'Jam Praktik', value: '16:30 - 21:30 WITA' },
                { 
                  icon: <Phone className="w-6 h-6" />, 
                  label: 'Konsultasi', 
                  value: 'Via WhatsApp'
                },
                { 
                  icon: <MapPin className="w-6 h-6" />, 
                  label: 'Lokasi', 
                  value: 'Suntalangu, Lotim'
                },
                { icon: <Heart className="w-6 h-6" />, label: 'Pelayanan', value: 'Ramah & Nyaman' },
              ].map((item, i) => (
                  <div key={i} className="group glass-premium p-6 rounded-[28px] border-glow hover-lift transition-all duration-300 hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 transition-all duration-300">{item.icon}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-1 group-hover:text-brand-600 transition-colors">{item.value}</p>
                  </div>
              ))}
            </motion.div>

            {/* Google Maps Embed */}
            <motion.div variants={fadeUp} custom={2} className="w-full mt-12 rounded-[32px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl relative h-[400px]">
              <iframe 
                width="100%" 
                height="100%" 
                title="Lokasi Klinik Gigi Ranida"
                src="https://maps.google.com/maps?q=FHFJ%2BGV9+Suntalangu%2C+Kabupaten+Lombok+Timur%2C+Nusa+Tenggara+Bar.&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full border-0 filter dark:brightness-90 dark:contrast-125 dark:hue-rotate-15 transition-all duration-300"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative bg-white dark:bg-slate-800 rounded-[48px] p-10 md:p-20 text-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xl"
          >
            <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-brand-500/10 rounded-full blur-[100px] -mr-36 -mt-36 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-[100px] -ml-36 -mb-36 pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Siap Merawat <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500 dark:from-brand-400 dark:to-teal-400">Senyum Anda?</span>
              </h3>
              <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                Jangan tunda lagi. Daftar antrean sekarang dan dapatkan perawatan gigi terbaik hari ini.
              </p>
              <button
                onClick={() => onNavigate('patient')}
                className="group inline-flex items-center gap-3 px-10 py-5 bg-brand-600 hover:bg-brand-700 text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-brand-600/30 hover:shadow-brand-600/50 transition-all hover-lift"
              >
                Daftar Sekarang
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-slate-100 dark:border-slate-800 py-12 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center p-1.5">
                <div className="relative w-full h-full">
                  <Image src="/images/logo-ranida.png" alt="Logo Klinik Gigi Ranida" fill className="object-contain" />
                </div>
              </div>
              <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Praktek Gigi <span className="text-brand-600">Ranida</span>
              </span>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span>SIPTGM: 503/1463/PMPTSP/SITGM/07/2023</span>
              <span className="hidden md:inline">•</span>
              <span>STR: 18 04 5 1 2 21-3433260</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              © {new Date().getFullYear()} Praktek Gigi Ranida. Hari Libur / Hari Besar Tutup.
            </p>
          </div>
        </div>
      </footer>

      {/* ─── ARTICLE READ MODAL ─── */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-[36px] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <span className="px-3 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                  {selectedArticle.category || 'Kebersihan'}
                </span>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                    {selectedArticle.title}
                  </h3>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-line font-medium">
                  {selectedArticle.summary}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all"
                >
                  Selesai Membaca
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
