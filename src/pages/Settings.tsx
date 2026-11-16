import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Upload, 
  Save, 
  Download, 
  RotateCcw, 
  ShieldCheck, 
  FileText, 
  Phone, 
  MapPin, 
  Mail, 
  Check, 
  Trash2,
  Database,
  History,
  Lock
} from 'lucide-react';
import { LabProfile, AuditLog } from '../types';
import { api } from '../utils/api';
import { defaultDoctorSignatureSvg, defaultLabStampSvg, defaultLabLogoSvg } from '../utils/graphics';

interface SettingsProps {
  profile: LabProfile;
  onProfileUpdate: (updated: LabProfile) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  profile,
  onProfileUpdate
}) => {
  const [formProfile, setFormProfile] = useState<LabProfile>({ ...profile });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'branding' | 'backup' | 'audit'>('profile');
  const [restoreStatus, setRestoreStatus] = useState<string>('');

  const logoInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);
  const restoreFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormProfile({ ...profile });
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'audit') {
      api.getAuditLogs().then(data => setAuditLogs(data)).catch(console.error);
    }
  }, [activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateProfile(formProfile, formProfile.doctorName);
      onProfileUpdate(updated);
      alert('Laboratory profile information updated successfully.');
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Convert uploaded image file to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'signatureUrl' | 'stampUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit. Please upload an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormProfile(prev => ({
        ...prev,
        [field]: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Restore
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        setRestoreStatus('Restoring database...');
        await api.restoreDatabase(parsed, formProfile.doctorName);
        setRestoreStatus('Database successfully restored!');
        alert('Database restored successfully. Page will reload.');
        window.location.reload();
      } catch (err: any) {
        setRestoreStatus(`Restore error: ${err.message}`);
        alert(`Failed to restore: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-emerald-600" />
            Laboratory Profile & System Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure laboratory credentials, authorized signatures, stamps, database backups, and audit security.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2 text-xs font-semibold overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Clinic Profile & Pathologist</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${
            activeTab === 'branding'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>2. Logo, Signature & Stamp</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${
            activeTab === 'backup'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>3. Database Backup & Restore</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-3 sm:px-4 flex items-center gap-2 border-b-2 transition-colors shrink-0 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-4 h-4" />
          <span>4. Audit Security Logs</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CLINIC PROFILE & PATHOLOGIST */}
      {/* ========================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 text-xs">
          
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Building2 className="w-4 h-4" />
              Laboratory Identity & Registration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Laboratory Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formProfile.labName}
                  onChange={(e) => setFormProfile({ ...formProfile, labName: e.target.value })}
                  placeholder="Raza Clinical Laboratory"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Health Commission Reg #
                </label>
                <input
                  type="text"
                  value={formProfile.registrationNumber || ''}
                  onChange={(e) => setFormProfile({ ...formProfile, registrationNumber: e.target.value })}
                  placeholder="REG-PHC-2024-87761"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div className="col-span-3">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / Motto
                </label>
                <input
                  type="text"
                  value={formProfile.tagline}
                  onChange={(e) => setFormProfile({ ...formProfile, tagline: e.target.value })}
                  placeholder="Accurate • Reliable • Prompt Diagnostic Services"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Complete Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formProfile.address}
                  onChange={(e) => setFormProfile({ ...formProfile, address: e.target.value })}
                  placeholder="Main Bazar Dera Bakha, Bahawalpur"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Mobile / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formProfile.phone}
                  onChange={(e) => setFormProfile({ ...formProfile, phone: e.target.value })}
                  placeholder="03458776130"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Secondary Telephone
                </label>
                <input
                  type="text"
                  value={formProfile.altPhone || ''}
                  onChange={(e) => setFormProfile({ ...formProfile, altPhone: e.target.value })}
                  placeholder="0300..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={formProfile.email}
                  onChange={(e) => setFormProfile({ ...formProfile, email: e.target.value })}
                  placeholder="razaclinicallab@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Website / Portal
                </label>
                <input
                  type="text"
                  value={formProfile.website || ''}
                  onChange={(e) => setFormProfile({ ...formProfile, website: e.target.value })}
                  placeholder="www.razalab.pk"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

            </div>
          </div>

          {/* Pathologist Credentials */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="w-4 h-4" />
              Signatory Pathologist & Qualifications
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor / Pathologist Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formProfile.doctorName}
                  onChange={(e) => setFormProfile({ ...formProfile, doctorName: e.target.value })}
                  placeholder="Ghulam Muhammad"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medical Qualifications <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formProfile.doctorQualification}
                  onChange={(e) => setFormProfile({ ...formProfile, doctorQualification: e.target.value })}
                  placeholder="M.B.B.S., M.Phil. (Pathology)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Official Designation
                </label>
                <input
                  type="text"
                  value={formProfile.doctorDesignation}
                  onChange={(e) => setFormProfile({ ...formProfile, doctorDesignation: e.target.value })}
                  placeholder="Consultant Clinical Pathologist"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Medical Council Registration #
                </label>
                <input
                  type="text"
                  value={formProfile.doctorRegistration}
                  onChange={(e) => setFormProfile({ ...formProfile, doctorRegistration: e.target.value })}
                  placeholder="PMDC Reg. # 45291-P"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Associate / Co-Doctor Name (Optional)
                </label>
                <input
                  type="text"
                  value={formProfile.secondDoctorName || ''}
                  onChange={(e) => setFormProfile({ ...formProfile, secondDoctorName: e.target.value })}
                  placeholder="Dr. Ayesha Raza"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Associate Qualification
                </label>
                <input
                  type="text"
                  value={formProfile.secondDoctorQualification || ''}
                  onChange={(e) => setFormProfile({ ...formProfile, secondDoctorQualification: e.target.value })}
                  placeholder="M.B.B.S., FCPS (Haematology)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile Information'}
            </button>
          </div>

        </form>
      )}

      {/* ========================================================= */}
      {/* TAB 2: LOGO, SIGNATURE & STAMP GRAPHICS */}
      {/* ========================================================= */}
      {activeTab === 'branding' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Official Graphic Assets (Logo, Stamp & Pathologist Signature)
            </h3>
            <p className="text-slate-500">
              Upload high-resolution PNG, JPG, or SVG images. Transparent backgrounds are recommended for seals and signatures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 1. Laboratory Logo */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center text-center space-y-3">
              <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                Laboratory Logo
              </span>
              
              <div className="w-32 h-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center overflow-hidden shadow-xs">
                <img
                  src={formProfile.logoUrl || defaultLabLogoSvg}
                  alt="Laboratory Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logoUrl')}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Logo</span>
                </button>
                {formProfile.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormProfile({ ...formProfile, logoUrl: '' })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500"
                    title="Reset to default"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">PNG / JPG up to 2MB</p>
            </div>

            {/* 2. Official Stamp Seal */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center text-center space-y-3">
              <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                Official Laboratory Stamp
              </span>
              
              <div className="w-32 h-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center overflow-hidden shadow-xs">
                <img
                  src={formProfile.stampUrl || defaultLabStampSvg}
                  alt="Official Seal"
                  className="w-full h-full object-contain"
                />
              </div>

              <input
                ref={stampInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'stampUrl')}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stampInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Stamp</span>
                </button>
                {formProfile.stampUrl && (
                  <button
                    type="button"
                    onClick={() => setFormProfile({ ...formProfile, stampUrl: '' })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500"
                    title="Reset to default"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Round laboratory stamp seal</p>
            </div>

            {/* 3. Pathologist Signature */}
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col items-center text-center space-y-3">
              <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                Pathologist Signature
              </span>
              
              <div className="w-32 h-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center overflow-hidden shadow-xs">
                <img
                  src={formProfile.signatureUrl || defaultDoctorSignatureSvg}
                  alt="Doctor Signature"
                  className="w-full h-full object-contain"
                />
              </div>

              <input
                ref={sigInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'signatureUrl')}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => sigInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Signature</span>
                </button>
                {formProfile.signatureUrl && (
                  <button
                    type="button"
                    onClick={() => setFormProfile({ ...formProfile, signatureUrl: '' })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500"
                    title="Reset to default"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400">Dr. Ghulam Muhammad's signature</p>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md"
            >
              Save Graphic Assets
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DATABASE BACKUP & RESTORE */}
      {/* ========================================================= */}
      {activeTab === 'backup' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Automated Diagnostic Database Backup & Disaster Recovery
            </h3>
            <p className="text-slate-500">
              Download complete patient records, generated reports, version revisions, and customized test library into an offline backup file.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export Card */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Export Complete Database</h4>
                  <p className="text-slate-500 text-[11px]">Download encrypted JSON archive with all reports & patients</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Generates a snapshot containing all clinical patient records, finalized laboratory reports with doctor revisions, test templates, and profile settings.
              </p>

              <a
                href={api.getExportUrl()}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Full Database Backup</span>
              </a>
            </div>

            {/* Restore Card */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">Restore from Backup</h4>
                  <p className="text-slate-500 text-[11px]">Upload previous laboratory snapshot file</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-xs">
                Restoring overwrites current database. An automated safety backup of current state is created before restoring.
              </p>

              <input
                ref={restoreFileRef}
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => restoreFileRef.current?.click()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Upload & Restore Backup File</span>
              </button>

              {restoreStatus && (
                <div className="p-2 rounded bg-emerald-50 text-emerald-800 font-medium text-[11px]">
                  {restoreStatus}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: AUDIT SECURITY LOGS */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Diagnostic Audit Trail & Chain of Custody
            </h3>
            <p className="text-slate-500">
              Immutable audit log recording every patient registration, report sign-off, reissue revision, and settings change.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity</th>
                  <th className="py-2.5 px-3">User / Operator</th>
                  <th className="py-2.5 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono uppercase">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {log.entity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {log.user}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-sm truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Zero horizontal scroll) */}
          <div className="block md:hidden space-y-3">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                No audit events recorded yet.
              </div>
            ) : (
              auditLogs.map(log => (
                <div key={log.id} className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono uppercase">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {log.entity}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      By: <span className="font-medium text-slate-700 dark:text-slate-300">{log.user}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/60">
                    {log.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
