'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OdontogramData, ToothCondition, ToothSurface } from '@/app/types';
import { cn } from '@/lib/utils';

// Const untuk kuadran gigi (FDI)
const QUADRANTS = {
  topRight: [18, 17, 16, 15, 14, 13, 12, 11],
  topLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  bottomRight: [48, 47, 46, 45, 44, 43, 42, 41],
  bottomLeft: [31, 32, 33, 34, 35, 36, 37, 38],
};

const DECIDUOUS_QUADRANTS = {
  topRight: [55, 54, 53, 52, 51],
  topLeft: [61, 62, 63, 64, 65],
  bottomRight: [85, 84, 83, 82, 81],
  bottomLeft: [71, 72, 73, 74, 75],
};

// Gigi molar: 14-18, 24-28, 34-38, 44-48 + Deciduous 54-55, 64-65, 74-75, 84-85
const isMolar = (num: number) => {
  const n = num % 10;
  return n >= 4 && n <= 8;
};

// Gigi caninus: 13, 23, 33, 43 + Deciduous 53, 63, 73, 83
const isCanine = (num: number) => num % 10 === 3;

// Upper or lower jaw
const isUpper = (num: number) => (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
const isDeciduous = (num: number) => num >= 51 && num <= 85;

const CONDITION_STYLES: Record<ToothCondition, { bg: string, text: string, border: string, label: string, isSurface?: boolean, hex: string, strokeHex: string }> = {
  'SOU': { bg: 'bg-white', text: 'text-slate-700', border: 'border-slate-300', label: 'Sehat', isSurface: true, hex: '#ffffff', strokeHex: '#cbd5e1' },
  'CAR': { bg: 'bg-red-500', text: 'text-white', border: 'border-red-600', label: 'Karies', isSurface: true, hex: '#ef4444', strokeHex: '#dc2626' },
  'FIL': { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-600', label: 'Tambalan', isSurface: true, hex: '#3b82f6', strokeHex: '#2563eb' },
  'MIS': { bg: 'bg-slate-200', text: 'text-slate-500', border: 'border-slate-400', label: 'Hilang', hex: '#e2e8f0', strokeHex: '#94a3b8' },
  'EXT': { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-950', label: 'Dicabut', hex: '#0f172a', strokeHex: '#020617' },
  'IMP': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-400', label: 'Impaksi', hex: '#fef3c7', strokeHex: '#f59e0b' },
  'RCT': { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600', label: 'PSA/RCT', hex: '#a855f7', strokeHex: '#9333ea' },
  'PRT': { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600', label: 'Tiruan', hex: '#10b981', strokeHex: '#059669' },
  'NVT': { bg: 'bg-slate-500', text: 'text-white', border: 'border-slate-700', label: 'Non-Vital', hex: '#64748b', strokeHex: '#475569' },
  'CRN': { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-600', label: 'Crown', hex: '#6366f1', strokeHex: '#4f46e5' },
  'BRJ': { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-600', label: 'Bridge', hex: '#14b8a6', strokeHex: '#0d9488' },
};

// Professional SVG tooth shapes
const MolarSVG = ({ fill, stroke, strokeWidth, isBottom }: { fill: string, stroke: string, strokeWidth: number, isBottom?: boolean }) => (
  <svg viewBox="0 0 40 52" className="w-full h-full" style={{ transform: isBottom ? 'scaleY(-1)' : undefined }}>
    {/* Crown */}
    <path
      d="M6 20 C6 12, 10 6, 14 4 C17 2.5, 23 2.5, 26 4 C30 6, 34 12, 34 20 C34 26, 30 30, 20 30 C10 30, 6 26, 6 20Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {/* Crown cusp details */}
    <path d="M13 10 Q15 7, 17 10" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity="0.4" />
    <path d="M19 9 Q21 6, 23 9" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity="0.4" />
    <path d="M24 11 Q26 8, 28 11" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity="0.4" />
    {/* Roots (2 roots for molar) */}
    <path
      d="M12 28 C12 28, 10 38, 9 44 C8.5 47, 10 48, 12 46 C14 44, 14 36, 14 30"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    <path
      d="M26 30 C26 36, 26 44, 28 46 C30 48, 31.5 47, 31 44 C30 38, 28 28, 28 28"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

const PremolarSVG = ({ fill, stroke, strokeWidth, isBottom }: { fill: string, stroke: string, strokeWidth: number, isBottom?: boolean }) => (
  <svg viewBox="0 0 36 52" className="w-full h-full" style={{ transform: isBottom ? 'scaleY(-1)' : undefined }}>
    {/* Crown */}
    <path
      d="M7 20 C7 12, 10 6, 14 4 C16 3, 20 3, 22 4 C26 6, 29 12, 29 20 C29 26, 26 28, 18 28 C10 28, 7 26, 7 20Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {/* Crown cusp */}
    <path d="M14 10 Q16 6, 18 10" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity="0.4" />
    <path d="M19 9 Q21 6, 23 10" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity="0.4" />
    {/* Single root */}
    <path
      d="M14 27 C14 32, 15 40, 16 44 C16.5 47, 19.5 47, 20 44 C21 40, 22 32, 22 27"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

const CanineSVG = ({ fill, stroke, strokeWidth, isBottom }: { fill: string, stroke: string, strokeWidth: number, isBottom?: boolean }) => (
  <svg viewBox="0 0 32 52" className="w-full h-full" style={{ transform: isBottom ? 'scaleY(-1)' : undefined }}>
    {/* Crown - pointy */}
    <path
      d="M7 22 C7 14, 9 8, 12 5 C14 3, 18 3, 20 5 C23 8, 25 14, 25 22 C25 26, 22 28, 16 28 C10 28, 7 26, 7 22Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {/* Cusp point */}
    <path d="M13 12 Q16 4, 19 12" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.6} opacity="0.4" />
    {/* Long single root */}
    <path
      d="M12 27 C12 34, 13 42, 14.5 46 C15 48, 17 48, 17.5 46 C19 42, 20 34, 20 27"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

const IncisorSVG = ({ fill, stroke, strokeWidth, isBottom }: { fill: string, stroke: string, strokeWidth: number, isBottom?: boolean }) => (
  <svg viewBox="0 0 28 50" className="w-full h-full" style={{ transform: isBottom ? 'scaleY(-1)' : undefined }}>
    {/* Crown - flat/shovel shaped */}
    <path
      d="M5 20 C5 12, 7 6, 10 4 C12 3, 16 3, 18 4 C21 6, 23 12, 23 20 C23 24, 20 26, 14 26 C8 26, 5 24, 5 20Z"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
    {/* Incisal edge */}
    <path d="M9 8 L19 8" fill="none" stroke={stroke} strokeWidth={strokeWidth * 0.5} opacity="0.3" />
    {/* Root */}
    <path
      d="M10 25 C10 32, 11 40, 12.5 44 C13 46, 15 46, 15.5 44 C17 40, 18 32, 18 25"
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    />
  </svg>
);

interface OdontogramViewerProps {
  patientId: string;
  data: OdontogramData[];
  onUpdateTooth: (toothNumber: number, condition: ToothCondition, surface?: ToothSurface, notes?: string) => void;
  readOnly?: boolean;
}

export default function OdontogramViewer({ patientId, data, onUpdateTooth, readOnly = false }: OdontogramViewerProps) {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedSurface, setSelectedSurface] = useState<ToothSurface | null>(null);

  const getToothData = (toothNum: number) => data.find(d => d.toothNumber === toothNum);

  const handleToothLabelClick = (toothNum: number) => {
    if (readOnly) return;
    setSelectedTooth(toothNum);
    setSelectedSurface(null);
  };

  const applyCondition = (condition: ToothCondition) => {
    if (selectedTooth === null) return;
    
    // Logic: Some conditions apply to the WHOLE tooth (like MIS, EXT)
    // Some apply to specific SURFACES (like CAR, FIL)
    const style = CONDITION_STYLES[condition];
    
    if (style.isSurface && selectedSurface) {
      onUpdateTooth(selectedTooth, condition, selectedSurface);
    } else {
      // If a whole-tooth condition is selected (like EXT), clear surface data if needed
      // or just apply as whole tooth condition.
      onUpdateTooth(selectedTooth, condition);
    }
  };

  const getToothSVG = (toothNum: number, fill: string, stroke: string, sw: number) => {
    const bottom = !isUpper(toothNum);
    const deciduous = isDeciduous(toothNum);
    
    // Scale down deciduous teeth
    const scale = deciduous ? 0.8 : 1;
    
    if (isMolar(toothNum)) return (
      <div style={{ transform: `scale(${scale})` }} className="w-full h-full">
        <MolarSVG fill={fill} stroke={stroke} strokeWidth={sw} isBottom={bottom} />
      </div>
    );
    if (isCanine(toothNum)) return (
      <div style={{ transform: `scale(${scale})` }} className="w-full h-full">
        <CanineSVG fill={fill} stroke={stroke} strokeWidth={sw} isBottom={bottom} />
      </div>
    );
    const premolar = (toothNum % 10 === 4) || (toothNum % 10 === 5);
    if (premolar) return (
      <div style={{ transform: `scale(${scale})` }} className="w-full h-full">
        <PremolarSVG fill={fill} stroke={stroke} strokeWidth={sw} isBottom={bottom} />
      </div>
    );
    return (
      <div style={{ transform: `scale(${scale})` }} className="w-full h-full">
        <IncisorSVG fill={fill} stroke={stroke} strokeWidth={sw} isBottom={bottom} />
      </div>
    );
  };

  const renderTooth = (toothNum: number) => {
    const toothData = getToothData(toothNum);
    const condition = toothData?.condition || 'SOU';
    const isSelected = selectedTooth === toothNum;
    const isSpecial = ['MIS', 'EXT'].includes(condition);
    const style = CONDITION_STYLES[condition] || CONDITION_STYLES['SOU'];

    return (
      <div key={toothNum} className="flex flex-col items-center gap-0.5 group relative">
        {/* Tooth number label */}
        <button
          onClick={() => handleToothLabelClick(toothNum)}
          className={cn(
            "text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md transition-all tracking-wider",
            isSelected 
              ? "bg-[#0E7490] text-white shadow-md shadow-[#00685d]/30" 
              : condition !== 'SOU' 
                ? "text-slate-700 bg-slate-100" 
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          )}
        >
          {toothNum}
        </button>

        {/* Tooth SVG icon */}
        <div 
          onClick={() => handleToothLabelClick(toothNum)}
          className={cn(
            "relative transition-all duration-200 cursor-pointer flex items-center justify-center",
            isMolar(toothNum) ? "w-8 h-10 md:w-10 md:h-12" : isCanine(toothNum) ? "w-6 h-9 md:w-8 md:h-11" : "w-5 h-8 md:w-7 md:h-10",
            isSelected && "scale-110 drop-shadow-[0_0_12px_rgba(8,145,178,0.6)] dark:drop-shadow-[0_0_12px_rgba(20,184,166,0.6)]",
            !readOnly && "hover:scale-105 hover:drop-shadow-md"
          )}
        >
          {getToothSVG(
            toothNum, 
            style.hex, 
            isSelected ? '#0E7490' : style.strokeHex,
            isSelected ? 2 : 1.2
          )}

          {/* Surface Visualization Overlay */}
          {toothData?.surfaces && !isSpecial && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none p-1">
               <div className="w-4 h-4 md:w-5 md:h-5 relative border border-slate-300 bg-white/40">
                  {Object.entries(toothData.surfaces).map(([surf, cond]) => {
                     const sStyle = CONDITION_STYLES[cond as ToothCondition];
                     if (!sStyle || cond === 'SOU') return null;
                     
                     const surfClasses: Record<string, string> = {
                        top: "absolute top-0 inset-x-0 h-1/3",
                        bottom: "absolute bottom-0 inset-x-0 h-1/3",
                        left: "absolute left-0 inset-y-0 w-1/3",
                        right: "absolute right-0 inset-y-0 w-1/3",
                        center: "absolute inset-1/3"
                     };
                     
                     return (
                        <div 
                           key={surf} 
                           className={surfClasses[surf]} 
                           style={{ backgroundColor: sStyle.hex }} 
                        />
                     );
                  })}
               </div>
            </div>
          )}

          {/* Special overlay for MIS/EXT */}
          {isSpecial && (
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none p-1.5"
            >
              <svg 
                viewBox="0 0 24 24" 
                className={cn(
                  "w-full h-full drop-shadow-md",
                  condition === 'EXT' ? "text-rose-500 animate-pulse" : "text-slate-400"
                )}
                fill="none" 
                stroke="currentColor" 
                strokeWidth="4" 
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.div>
          )}
        </div>

        {/* Notes indicator */}
        {toothData?.notes && (
          <div className="absolute -top-0.5 -right-1.5 bg-amber-400 w-2 h-2 rounded-full border border-white shadow-sm animate-pulse" />
        )}
      </div>
    );
  };

  // Legend items to show
  const legendItems: ToothCondition[] = ['SOU','CAR','FIL','MIS','EXT','RCT','PRT','CRN'];

  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h4 className="font-black text-slate-800 dark:text-slate-100 text-base md:text-lg flex items-center gap-2 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#0E7490] dark:text-teal-400" fill="currentColor">
              <path d="M15.5 3c-1.3 0-2.4.8-3.5 1.5C10.9 3.8 9.8 3 8.5 3 6 3 4 5.2 4 7.8c0 1.9 1 3.5 2.5 4.5l-1 6.2c-.3 2.1 1.2 2.5 2.5 2.5s2-1 2-2.5v-2.5c0-.8 1-1 2-1s2 .2 2 1v2.5c0 1.5.7 2.5 2 2.5s2.8-.4 2.5-2.5l-1-6.2c1.5-1 2.5-2.6 2.5-4.5C20 5.2 18 3 15.5 3Z" />
            </svg>
            Odontogram
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700 transition-colors">FDI</span>
          </h4>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1.5 transition-colors">
            Klik gigi untuk menandai kondisi klinis
            <span className="md:hidden inline-flex items-center gap-1 text-[9px] font-black text-[#0e7490] dark:text-teal-400 bg-[#0e7490]/10 dark:bg-teal-500/10 px-1.5 py-0.5 rounded-md animate-pulse">
              ← Geser Horizontal →
            </span>
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 transition-colors">
          {legendItems.map(key => {
            const s = CONDITION_STYLES[key];
            return (
              <span key={key} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 transition-colors">
                <div 
                  className="w-3 h-3 rounded-sm border dark:border-slate-700" 
                  style={{ backgroundColor: s.hex, borderColor: s.strokeHex }}
                />
                {s.label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Dental Chart */}
      <div className="space-y-4">
        {/* Rahang Atas (Maxilla) */}
        <div className="flex flex-col items-center gap-2">
          <div className="text-[9px] font-black text-[#0E7490] dark:text-teal-400 uppercase tracking-[0.2em] bg-[#0E7490]/5 dark:bg-teal-900/20 px-3 py-1 rounded-full transition-colors">Rahang Atas (Maxilla)</div>
          
          {/* Gigi Dewasa Atas */}
          <div className="w-full overflow-x-auto hide-scrollbar pb-1">
            <div className="flex gap-2 md:gap-3 justify-start md:justify-center items-end px-4 min-w-max">
              <div className="flex gap-1 md:gap-1 border-r-2 border-dashed border-slate-200 dark:border-slate-800 pr-2 md:pr-4 items-end transition-colors">
                {QUADRANTS.topRight.map(renderTooth)}
              </div>
              <div className="flex gap-1 md:gap-1 items-end">
                {QUADRANTS.topLeft.map(renderTooth)}
              </div>
            </div>
          </div>

          {/* Gigi Susu Atas */}
          <div className="w-full overflow-x-auto hide-scrollbar pb-3">
            <div className="flex gap-2 md:gap-3 justify-start md:justify-center items-end px-4 opacity-90 scale-95 min-w-max">
              <div className="flex gap-1 md:gap-1 border-r-2 border-dashed border-slate-200 dark:border-slate-800 pr-2 md:pr-4 items-end bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl px-2 transition-colors">
                {DECIDUOUS_QUADRANTS.topRight.map(renderTooth)}
              </div>
              <div className="flex gap-1 md:gap-1 items-end bg-slate-50/50 dark:bg-slate-800/50 rounded-t-xl px-2 transition-colors">
                {DECIDUOUS_QUADRANTS.topLeft.map(renderTooth)}
              </div>
            </div>
          </div>
        </div>

        {/* Midline / Garis Pemisah */}
        <div className="w-full relative py-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200 dark:border-slate-800 border-dashed transition-colors"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-black text-slate-300 dark:text-slate-600 tracking-[0.4em] uppercase transition-colors">Midline</span>
          </div>
        </div>

        {/* Rahang Bawah (Mandibula) */}
        <div className="flex flex-col items-center gap-2">
          {/* Gigi Susu Bawah */}
          <div className="w-full overflow-x-auto hide-scrollbar pt-3">
            <div className="flex gap-2 md:gap-3 justify-start md:justify-center items-start px-4 opacity-90 scale-95 min-w-max">
              <div className="flex gap-1 md:gap-1 border-r-2 border-dashed border-slate-200 dark:border-slate-800 pr-2 md:pr-4 items-start bg-slate-50/50 dark:bg-slate-800/50 rounded-b-xl px-2 transition-colors">
                {DECIDUOUS_QUADRANTS.bottomRight.map(renderTooth)}
              </div>
              <div className="flex gap-1 md:gap-1 items-start bg-slate-50/50 dark:bg-slate-800/50 rounded-b-xl px-2 transition-colors">
                {DECIDUOUS_QUADRANTS.bottomLeft.map(renderTooth)}
              </div>
            </div>
          </div>

          {/* Gigi Dewasa Bawah */}
          <div className="w-full overflow-x-auto hide-scrollbar pt-1">
            <div className="flex gap-2 md:gap-3 justify-start md:justify-center items-start px-4 min-w-max">
              <div className="flex gap-1 md:gap-1 border-r-2 border-dashed border-slate-200 dark:border-slate-800 pr-2 md:pr-4 items-start transition-colors">
                {QUADRANTS.bottomRight.map(renderTooth)}
              </div>
              <div className="flex gap-1 md:gap-1 items-start">
                {QUADRANTS.bottomLeft.map(renderTooth)}
              </div>
            </div>
          </div>
          
          <div className="text-[9px] font-black text-[#0E7490] dark:text-teal-400 uppercase tracking-[0.2em] bg-[#0E7490]/5 dark:bg-teal-900/20 px-3 py-1 rounded-full mt-2 transition-colors transition-colors">Rahang Bawah (Mandibula)</div>
        </div>
      </div>

      {/* Editor Panel */}
      <AnimatePresence>
        {!readOnly && selectedTooth && (
          <motion.div 
            initial={{ opacity: 0, y: 20, height: 0 }} 
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            className="mt-8 overflow-hidden"
          >
            <div className="p-5 md:p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  {/* Left: Tooth Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#00685d] to-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#00685d]/20 relative">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 opacity-30 absolute" fill="currentColor">
                        <path d="M15.5 3c-1.3 0-2.4.8-3.5 1.5C10.9 3.8 9.8 3 8.5 3 6 3 4 5.2 4 7.8c0 1.9 1 3.5 2.5 4.5l-1 6.2c-.3 2.1 1.2 2.5 2.5 2.5s2-1 2-2.5v-2.5c0-.8 1-1 2-1s2 .2 2 1v2.5c0 1.5.7 2.5 2 2.5s2.8-.4 2.5-2.5l-1-6.2c1.5-1 2.5-2.6 2.5-4.5C20 5.2 18 3 15.5 3Z" />
                      </svg>
                      <span className="font-black text-xl z-10">{selectedTooth}</span>
                    </div>
                    <div>
                      <h5 className="font-black text-slate-800 dark:text-slate-100 text-sm md:text-lg transition-colors">
                        Gigi {isDeciduous(selectedTooth) ? 'Susu' : 'Permanen'} #{selectedTooth}
                      </h5>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5 transition-colors">
                        {isMolar(selectedTooth) ? 'Molar' : isCanine(selectedTooth) ? 'Caninus' : (selectedTooth % 10 <= 2) ? 'Incisor' : 'Premolar'}
                      </p>
                    </div>
                  </div>

                  {/* Center: Surface Selector (Geometric) */}
                  <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase vertical-text transition-colors">Permukaan</span>
                    <div className="grid grid-cols-3 gap-1 w-24 h-24">
                      <div />
                      <button 
                        onClick={() => setSelectedSurface('top')}
                        className={cn("w-full h-full border rounded-sm transition-all", selectedSurface === 'top' ? "bg-[#0E7490] border-[#0E7490] shadow-md" : "bg-slate-50 border-slate-200 hover:bg-slate-100", getToothData(selectedTooth)?.surfaces?.top && "ring-2 ring-emerald-400")}
                        title="Bukal / Labial"
                      />
                      <div />
                      
                      <button 
                        onClick={() => setSelectedSurface('left')}
                        className={cn("w-full h-full border rounded-sm transition-all", selectedSurface === 'left' ? "bg-[#0E7490] border-[#0E7490] shadow-md" : "bg-slate-50 border-slate-200 hover:bg-slate-100", getToothData(selectedTooth)?.surfaces?.left && "ring-2 ring-emerald-400")}
                        title="Mesial / Distal"
                      />
                      <button 
                        onClick={() => setSelectedSurface('center')}
                        className={cn("w-full h-full border rounded-sm transition-all", selectedSurface === 'center' ? "bg-[#0E7490] border-[#0E7490] shadow-md" : "bg-slate-50 border-slate-200 hover:bg-slate-100", getToothData(selectedTooth)?.surfaces?.center && "ring-2 ring-emerald-400")}
                        title="Oklusal"
                      />
                      <button 
                        onClick={() => setSelectedSurface('right')}
                        className={cn("w-full h-full border rounded-sm transition-all", selectedSurface === 'right' ? "bg-[#0E7490] border-[#0E7490] shadow-md" : "bg-slate-50 border-slate-200 hover:bg-slate-100", getToothData(selectedTooth)?.surfaces?.right && "ring-2 ring-emerald-400")}
                        title="Mesial / Distal"
                      />
                      
                      <div />
                      <button 
                        onClick={() => setSelectedSurface('bottom')}
                        className={cn("w-full h-full border rounded-sm transition-all", selectedSurface === 'bottom' ? "bg-[#0E7490] dark:bg-teal-600 border-[#0E7490] dark:border-teal-600 shadow-md" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700", getToothData(selectedTooth)?.surfaces?.bottom && "ring-2 ring-emerald-400")}
                        title="Lingual / Palatal"
                      />
                      <div />
                    </div>
                    <div className="flex flex-col gap-1 transition-colors">
                       <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 transition-colors">• Atas: Bukal/Labial</span>
                       <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 transition-colors">• Tengah: Oklusal</span>
                       <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 transition-colors">• Bawah: Lingual</span>
                    </div>
                  </div>
                </div>

                {/* Condition buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {(Object.entries(CONDITION_STYLES) as [ToothCondition, typeof CONDITION_STYLES[ToothCondition]][]).map(([key, style]) => {
                    const isActive = (getToothData(selectedTooth)?.condition || 'SOU') === key;
                    return (
                      <button
                        key={key}
                        onClick={() => applyCondition(key)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[11px] font-bold transition-all border-2",
                          isActive
                            ? "shadow-md scale-[1.02] ring-1 ring-offset-1"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-sm transition-colors"
                        )}
                        style={isActive ? { 
                          backgroundColor: style.hex, 
                          borderColor: style.strokeHex, 
                          color: style.hex === '#ffffff' ? '#334155' : '#ffffff',
                          boxShadow: `0 4px 12px ${style.hex}40`,
                          // @ts-ignore
                          '--tw-ring-color': style.strokeHex 
                        } : undefined}
                      >
                        <div 
                          className="w-3 h-3 rounded-sm border flex-shrink-0"
                          style={{ backgroundColor: style.hex, borderColor: style.strokeHex }}
                        />
                        {style.label}
                      </button>
                    );
                  })}
                </div>

                {/* Close button */}
                <div className="flex justify-center pt-1">
                  <button 
                    onClick={() => setSelectedTooth(null)}
                    className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-[#0E7490] dark:hover:text-teal-400 font-bold transition-colors px-4 py-1.5 rounded-full hover:bg-[#0E7490]/5 dark:hover:bg-teal-500/10"
                  >
                    ✓ Selesai edit gigi {selectedTooth}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
