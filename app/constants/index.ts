import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  ClipboardList, 
  Pill, 
  Wallet, 
  ShieldCheck 
} from 'lucide-react';
import { AdminSubView } from '../types';

export const ADMIN_MENU_ITEMS: { id: AdminSubView; label: string; iconName: string }[] = [
  { id: 'dashboard', label: 'Dashboard', iconName: 'LayoutDashboard' },
  { id: 'schedule', label: 'Jadwal Dokter', iconName: 'CalendarDays' },
  { id: 'patients', label: 'Data Pasien', iconName: 'Users' },
  { id: 'records', label: 'Rekam Medis', iconName: 'ClipboardList' },
  { id: 'inventory', label: 'Inventori Obat', iconName: 'Pill' },
  { id: 'finance', label: 'Laporan Keuangan', iconName: 'Wallet' },
  { id: 'staff', label: 'Manajemen Staf', iconName: 'ShieldCheck' },
];

export const DEFAULT_PATIENT_TICKET: any = {
  id: 'new',
  name: '',
  phone: '',
  complaint: '',
  status: 'WAITING',
  number: '',
  time: '',
  date: '',
  createdAt: null
};

export const CLINIC_NAME = 'Praktek Gigi Ranida';
export const CLINIC_SUBTITLE = 'Praktek Mandiri Terapis Gigi';
