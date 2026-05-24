'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, Lock, UserCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ClinicLoginProps {
  onLogin: (email?: string, password?: string) => void;
  onRegister?: (email?: string, password?: string) => void;
}

export default function ClinicLogin({ onLogin, onRegister }: ClinicLoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      if (isRegister && onRegister) {
        onRegister(email, password);
      } else {
        onLogin(email, password);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 py-8 w-full max-w-md mx-auto"
    >
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 md:p-10 text-slate-800 dark:text-slate-100 shadow-premium border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col items-center gap-4 mb-10 relative z-10">
          <div className="p-4 bg-brand-500 rounded-2xl text-white shadow-xl shadow-brand-900/20 relative w-24 h-24 flex items-center justify-center">
            <Image src="/images/logo-ranida.png" alt="Logo" fill className="object-contain p-4" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 transition-colors duration-300">
              {isRegister ? 'Daftar Akun Staf' : 'Masuk ke Portal'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
              Praktek Gigi Ranida
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Email Staf</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staf@praktekgigi.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                spellCheck="false"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-200"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Password Rahasia</label>
              {isRegister && (
                <span className="text-[9px] font-bold text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-500/10 px-2 py-0.5 rounded-full animate-pulse">
                  Gunakan Password Praktek
                </span>
              )}
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-brand-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoCapitalize="none"
                autoComplete={isRegister ? "new-password" : "current-password"}
                autoCorrect="off"
                spellCheck="false"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-slate-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 dark:text-slate-500 hover:text-teal-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#00685d] hover:bg-[#005a51] text-white font-bold rounded-2xl shadow-xl shadow-teal-900/10 dark:shadow-none transition-all active:scale-[0.98] mt-2 flex items-center justify-center gap-2 group"
          >
            <span>{isRegister ? 'Daftar Sekarang' : 'Masuk Sekarang'}</span>
            <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </button>


        </form>

        <div className="mt-8 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-col gap-4">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="w-full text-[11px] font-bold text-slate-400 hover:text-teal-600 transition-colors uppercase tracking-widest text-center flex items-center justify-center gap-2"
          >
            {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar Staf'}
          </button>
        </div>
      </div>
      
      <p className="text-[10px] text-slate-400 text-center font-medium">
        Lupa password praktek? Hubungi Admin Master.
      </p>
    </motion.div>
  );
}
