import { Timestamp } from '@/lib/firebase';

export type View = 'landing' | 'patient' | 'monitor' | 'clinic';
export type PatientTab = 'register' | 'check';
export type ClinicTab = 'receptionist' | 'doctor';
export type AdminSubView = 'dashboard' | 'patients' | 'records' | 'inventory' | 'finance' | 'staff' | 'ai-assistant' | 'emr' | 'hasil-emr' | 'schedule' | 'gallery' | 'audit-log';

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  desc: string;
  order?: number;
  createdAt?: Timestamp;
}


export interface ClinicUser {
  id: string;
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'doctor' | 'patient';
  createdAt?: Timestamp;
}

export interface Patient {
  id: string; // Document ID (usually phone or random)
  name: string;
  phone: string;
  birthDate?: string;
  address?: string;
  medicalHistory?: string; // Systemic history (Diabetes, Heart, etc.)
  allergies?: string;
  gender?: 'L' | 'P';
  bloodType?: string;
  createdAt?: Timestamp;
  lastVisit?: string;
}

export interface QueueItem {
  id: string;
  name: string;
  phone: string;
  complaint: string;
  status: 'WAITING' | 'TREATING' | 'PAID' | 'FINISHED' | 'CALLING' | 'SKIPPED';
  number: string;
  date: string;
  time: string;
  billingAmount?: number;
  treatment?: string;
  notes?: string;
  address?: string;
  birthDate?: string;
  medicalHistory?: string;
  allergies?: string;
  createdAt?: any;
  updatedAt?: any;
  // Clinical Standard Fields (Standardizing Dental EMR)
  subjective?: string;
  objective?: string;
  vitals?: Vitals;
  intraOral?: IntraOralExam;
  assessmentDescription?: string;
  assessmentIcd10?: string;
  plan?: string;
  soapTeeth?: string;
}


export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  unit: string;
  status: 'Safe' | 'Low' | 'Out of Stock';
}

export interface FinancialReport {
  id: string;
  date: string;
  patientName: string;
  treatment: string;
  amount: number;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export type ToothCondition = 'SOU' | 'CAR' | 'MIS' | 'FIL' | 'EXT' | 'IMP' | 'RCT' | 'PRT' | 'NVT' | 'CRN' | 'BRJ';
export type ToothSurface = 'top' | 'bottom' | 'left' | 'right' | 'center'; // Oklusal (center), Mesial/Distal (left/right), Bukal/Lingual (top/bottom)

export interface OdontogramData {
  id: string;
  patientId: string;
  toothNumber: number;
  condition: ToothCondition; // Overall condition (e.g. MIS, EXT)
  surfaces?: Partial<Record<ToothSurface, ToothCondition>>; // Surface-specific conditions (e.g. CAR on center)
  notes?: string;
  updatedAt?: Timestamp;
}

export interface Vitals {
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  temperature?: string;
  painScale?: string;
}

export interface IntraOralExam {
  mucosa?: string;
  gingiva?: string;
  palatum?: string;
  tongue?: string;
  tonsils?: string;
  other?: string;
}

export interface SoapVisit {
  id: string;
  patientId: string;
  date: string;
  subjective: string;
  objective: string;
  vitals?: Vitals;
  intraOral?: IntraOralExam;
  assessmentDescription: string;
  assessmentIcd10?: string;
  plan: string;
  soapTeeth?: string;
  billingAmount?: number;
  patientName?: string;
  address?: string;
  createdAt?: any;
}
