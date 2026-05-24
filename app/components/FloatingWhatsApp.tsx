'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  phoneNumber: string;
  message?: string;
}

export default function FloatingWhatsApp({ phoneNumber, message = 'Halo Klinik Ranida, saya ingin bertanya tentang pendaftaran antrean...' }: FloatingWhatsAppProps) {
  // Format nomor (hapus karakter non-digit)
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[500] group"
    >
      <div className="absolute inset-0 bg-green-500 rounded-full blur-md opacity-40 group-hover:opacity-70 group-hover:blur-xl transition-all duration-300"></div>
      
      {/* Pulse effect */}
      <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20 duration-1000"></div>
      
      <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-tr from-green-600 to-green-400 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20">
        <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-white" />
      </div>
    </motion.a>
  );
}
