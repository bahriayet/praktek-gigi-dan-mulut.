'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Camera, ShieldCheck, Heart, Maximize2, X, ChevronRight } from 'lucide-react';
import { GalleryImage } from '@/app/types';
import { cn } from '@/lib/utils';

const staticImages = [
  {
    id: 'static-1',
    url: '/images/dental_facility_1.png',
    title: 'Ruang Periksa Modern',
    desc: 'Dilengkapi kursi dental premium untuk kenyamanan maksimal Anda.'
  },
  {
    id: 'static-2',
    url: '/images/dental_facility_2.png',
    title: 'Peralatan Canggih',
    desc: 'Menggunakan teknologi medis terkini yang steril dan aman.'
  },
  {
    id: 'static-3',
    url: '/images/dental_facility_3.png',
    title: 'Area Tunggu Nyaman',
    desc: 'Suasana rileks agar Anda tidak merasa tegang sebelum perawatan.'
  }
];

export default function ClinicGallery({ images }: { images?: GalleryImage[] }) {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const displayImages = images && images.length > 0 ? images : staticImages;

  return (
    <div className="space-y-16 py-8">
      {/* Header Section */}
      <div className="relative text-center space-y-6 max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-brand-500/10 to-brand-600/5 text-brand-500 dark:text-brand-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-brand-500/10 backdrop-blur-md shadow-xl shadow-brand-500/5"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          The Premium Experience
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-[0.9] md:leading-[0.85]"
        >
          Visualisasi <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-500 to-indigo-600">Kenyamanan</span> Maksimal.
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-medium"
        >
          Jelajahi setiap sudut fasilitas kami yang dirancang dengan standar internasional untuk menjamin sterilitas dan kenyamanan psikologis pasien.
        </motion.p>
      </div>

      {/* Bento Grid Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 md:auto-rows-[240px]">
        {displayImages.map((img, i) => {
          // Define bento grid sizes for some images
          const isLarge = i === 0;
          const isTall = i === 1;
          const isWide = i === 2;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onClick={() => setSelectedImage(img)}
              className={cn(
                "group relative rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm cursor-pointer transition-all duration-500",
                isLarge ? "md:col-span-4 md:row-span-2 h-[400px] md:h-auto" : 
                isTall ? "md:col-span-2 md:row-span-2 h-[400px] md:h-auto" :
                isWide ? "md:col-span-3 md:row-span-1 h-[240px]" :
                "md:col-span-3 md:row-span-1 h-[240px]"
              )}
            >
              <Image 
                src={img.url} 
                alt={img.title} 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Glassmorphic Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-brand-500 rounded-full" />
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{img.title}</h3>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-300 font-bold uppercase tracking-widest max-w-[280px] line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                      {img.desc}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Decorative Border Glow */}
              <div className="absolute inset-0 border-[8px] border-white/0 group-hover:border-white/5 transition-all duration-500 pointer-events-none" />
            </motion.div>
          );
        })}
      </div>



      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-12 bg-slate-950/95 backdrop-blur-xl"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-8 right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all z-[610]"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full h-full flex flex-col items-center justify-center gap-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative w-full max-w-5xl h-[60vh] md:h-[70vh] rounded-[48px] overflow-hidden shadow-2xl border border-white/10">
                <Image 
                  src={selectedImage.url} 
                  alt={selectedImage.title} 
                  fill 
                  className="object-cover"
                />
              </div>
              
              <div className="text-center space-y-3 max-w-2xl px-4">
                <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">{selectedImage.title}</h3>
                <p className="text-slate-400 text-sm md:text-lg font-medium leading-relaxed">
                  {selectedImage.desc}
                </p>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

