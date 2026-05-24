'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "relative p-2.5 rounded-2xl transition-all duration-300",
        "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-glass",
        "dark:bg-slate-800/40 dark:border-slate-700/50 dark:hover:bg-slate-800/60",
        "group active:scale-95",
        className
      )}
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'light' ? (
            <motion.div
              key="sun"
              initial={{ y: 20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sun className="w-5 h-5 text-amber-500 fill-amber-500/10 group-hover:rotate-12 transition-transform" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ y: 20, opacity: 0, rotate: -45 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: -20, opacity: 0, rotate: 45 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Moon className="w-5 h-5 text-teal-400 fill-teal-400/10 group-hover:-rotate-12 transition-transform" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
}
