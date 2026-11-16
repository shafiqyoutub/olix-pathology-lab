export type Gender = 'male' | 'female' | 'other' | 'both';

export type ReportStatus = 'draft' | 'verified' | 'finalized';

export type ResultFlag = 'normal' | 'high' | 'low' | 'abnormal' | 'critical';

export interface ReferenceRange {
  gender: Gender;
  ageMin?: number;
  ageMax?: number;
  low?: number;
  high?: number;
  text: string;
}

export interface TestParameter {
  id: string;
  section?: string;
  name: string;
  unit: string;
  type: 'number' | 'text' | 'select';
  options?: string[];
  defaultValue?: string | number;
  ranges: ReferenceRange[];
  isCalculated?: boolean;
  calculationFormula?: string;
  notes?: string;
}

export interface TestItem {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  sampleType: string;
  method?: string;
  price?: number;
  parameters: TestParameter[];
}

export interface Category {
  id: string;
  name: string;
  order: number;
  icon?: string;
}

export interface Patient {
  id: string;
  name: string;
  guardianName?: string;
  gender: 'male' | 'female' | 'other';
  dob?: string;
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  phone?: string;
  address?: string;
  referringDoctor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParameterResult {
  value: string | number;
  flag?: ResultFlag;
  comments?: string;
}

export interface Revision {
  version: number;
  timestamp: string;
  author: string;
  notes: string;
}

export interface Report {
  id: string;
  reportNumber: string;
  version: number;
  status: ReportStatus;
  patientId: string;
  patientName: string;
  guardianName?: string;
  gender: 'male' | 'female' | 'other';
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  phone?: string;
  address?: string;
  referringDoctor?: string;
  sampleDate: string;
  reportDate: string;
  sampleId?: string;
  testIds: string[];
  testResults: Record<string, Record<string, ParameterResult>>; // testId -> paramId -> ParameterResult
  clinicalNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  revisions: Revision[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LabProfile {
  labName: string;
  tagline: string;
  doctorName: string;
  doctorDesignation: string;
  doctorQualification: string;
  doctorRegistration: string;
  secondDoctorName?: string;
  secondDoctorQualification?: string;
  secondDoctorDesignation?: string;
  address: string;
  phone: string;
  altPhone?: string;
  email: string;
  registrationNumber?: string;
  website?: string;
  footerNotice: string;
  disclaimer: string;
  themeColor: string;
  accentColor: string;
  reportTemplate: string;
  headerStyle: 'standard' | 'minimal' | 'letterhead-blank';
  pageSize: 'A4' | 'A5';
  fontSize: 'small' | 'medium' | 'large';
  showLogo: boolean;
  showSignature: boolean;
  showStamp: boolean;
  showQrCode: boolean;
  showReferenceRanges: boolean;
  showUnits: boolean;
  showFlags: boolean;
  showMethodology: boolean;
  logoUrl?: string;
  signatureUrl?: string;
  stampUrl?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entity: string;
  user: string;
  details: string;
}

export interface DashboardStats {
  totalReports: number;
  todayReports: number;
  pendingVerification: number;
  finalizedReports: number;
  totalPatients: number;
  totalTests: number;
}
