'use client';

import React from 'react';
import { Search, Menu } from 'lucide-react';

import Image from 'next/image';
import { View } from '@/app/types';
import ThemeToggle from '../ThemeToggle';

interface AdminTopBarProps {
  user: any;
  userRole: string | null;
  activeView: View;
  setActiveView: (v: View) => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  toggleSidebar: () => void;
  onOpenAiAssistant: () => void;
}

export default function AdminTopBar({ 
  user, 
  userRole, 
  activeView, 
  setActiveView, 
  searchTerm, 
  setSearchTerm, 
  toggleSidebar,
  onOpenAiAssistant
}: AdminTopBarProps) {
  const isStaff = userRole === 'admin' || userRole === 'doctor';
  
  const [inputValue, setInputValue] = React.useState(searchTerm);

  const handleTriggerSearch = (val: string) => {
    setSearchTerm(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTriggerSearch(inputValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    // Trigger otomatis jika mendeteksi shortcut
    if (val.toLowerCase().endsWith('-d') || val.toLowerCase().endsWith('-r')) {
      handleTriggerSearch(val);
    }
  };

  return (
    <header className="glass-effect px-4 md:px-8 py-2 md:py-2.5 flex justify-between items-center shadow-premium sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="flex items-center gap-3 md:gap-5 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 lg:flex-none">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <input
            className="bg-gray-100 dark:bg-slate-800 border-none rounded-xl pl-9 pr-4 py-2 w-full lg:w-80 text-xs md:text-sm focus:ring-2 focus:ring-brand-500/20 outline-none dark:text-slate-200 dark:placeholder:text-slate-500"
            placeholder="Cari pasien... (akhiri -D atau -R)"
            type="text"
            value={inputValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        



      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle className="scale-90" />
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-none">{user?.displayName || 'Admin'}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold tracking-wide mt-1 uppercase">{userRole || 'Staff'}</p>
          </div>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-500 dark:bg-brand-500 flex items-center justify-center text-white font-black text-xs md:text-sm shadow-lg shadow-brand-500/20 dark:shadow-brand-500/10 border-2 border-white dark:border-slate-800 transition-transform hover:scale-110 cursor-pointer">
            {(user?.displayName || user?.email || 'Admin').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
