import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  PlusCircle, 
  FileText, 
  Phone, 
  MapPin, 
  UserCheck, 
  FilePlus2, 
  Calendar, 
  Trash2, 
  Edit,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Patient, Report, LabProfile } from '../types';
import { api } from '../utils/api';
import { calculateAgeFromDob, formatAge } from '../utils/calculations';

interface PatientRecordsProps {
  profile: LabProfile;
  openAddModal?: boolean;
  onNavigate: (page: string, params?: any) => void;
  onPreviewReport: (report: Report) => void;
}

export const PatientRecords: React.FC<PatientRecordsProps> = ({
  profile,
  openAddModal = false,
  onNavigate,
  onPreviewReport
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(openAddModal);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form State
  const [formName, setFormName] = useState<string>('');
  const [formGuardian, setFormGuardian] = useState<string>('');
  const [formGender, setFormGender] = useState<'male' | 'female' | 'other'>('male');
  const [formDob, setFormDob] = useState<string>('');
  const [formAgeYears, setFormAgeYears] = useState<number>(30);
  const [formAgeMonths, setFormAgeMonths] = useState<number>(0);
  const [formAgeDays, setFormAgeDays] = useState<number>(0);
  const [formPhone, setFormPhone] = useState<string>('');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formRefDoctor, setFormRefDoctor] = useState<string>('Self / Direct');

  // Patient History Drawer
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);
  const [patientReports, setPatientReports] = useState<Report[]>([]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await api.getPatients(search);
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setFormName('');
    setFormGuardian('');
    setFormGender('male');
    setFormDob('');
    setFormAgeYears(30);
    setFormAgeMonths(0);
    setFormAgeDays(0);
    setFormPhone('');
    setFormAddress('');
    setFormRefDoctor('Self / Direct');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setFormName(p.name);
    setFormGuardian(p.guardianName || '');
    setFormGender(p.gender);
    setFormDob(p.dob || '');
    setFormAgeYears(p.ageYears);
    setFormAgeMonths(p.ageMonths || 0);
    setFormAgeDays(p.ageDays || 0);
    setFormPhone(p.phone || '');
    setFormAddress(p.address || '');
    setFormRefDoctor(p.referringDoctor || 'Self / Direct');
    setIsModalOpen(true);
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormDob(val);
    if (val) {
      const calc = calculateAgeFromDob(val);
      setFormAgeYears(calc.years);
      setFormAgeMonths(calc.months);
      setFormAgeDays(calc.days);
    }
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Patient name is required.');
      return;
    }

    try {
      const saved = await api.savePatient({
        id: editingPatient ? editingPatient.id : undefined,
        name: formName,
        guardianName: formGuardian,
        gender: formGender,
        dob: formDob,
        ageYears: formAgeYears,
        ageMonths: formAgeMonths,
        ageDays: formAgeDays,
        phone: formPhone,
        address: formAddress,
        referringDoctor: formRefDoctor
      });

      setIsModalOpen(false);
      fetchPatients();
      alert(`Patient ${saved.name} (${saved.id}) saved.`);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  const handleDeletePatient = async (p: Patient) => {
    if (!window.confirm(`Delete patient record for ${p.name}?`)) return;
    try {
      await api.deletePatient(p.id);
      setPatients(patients.filter(item => item.id !== p.id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleViewPatientHistory = async (p: Patient) => {
    setHistoryPatient(p);
    try {
      const allReps = await api.getReports({ search: p.id });
      setPatientReports(allReps);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Patient Records & Medical History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Maintain longitudinal diagnostic history and patient demographics.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchPatients();
          }}
          className="relative max-w-2xl"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient by Name, Phone, MR/Patient ID, or Address..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
          >
            Search
          </button>
        </form>
      </div>

      {/* Patients Display Area: Desktop Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Patient ID / MR #</th>
                <th className="py-3 px-4">Patient Name & Guardian</th>
                <th className="py-3 px-4">Gender & Age</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Referring Doctor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Loading patient directory...</span>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No patient records found.
                  </td>
                </tr>
              ) : (
                patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {p.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{p.name}</div>
                      {p.guardianName && (
                        <div className="text-[10px] text-slate-400 font-medium">S/O, D/O, W/O: {p.guardianName}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {p.gender.toUpperCase()} • {formatAge(p.ageYears, p.ageMonths, p.ageDays)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                      {p.phone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[150px]">
                      {p.address || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                      {p.referringDoctor || 'Self / Direct'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* New Test for Patient */}
                        <button
                          onClick={() => onNavigate('new-report', { selectedPatient: p })}
                          title="Generate New Report for this Patient"
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                        >
                          <FilePlus2 className="w-3.5 h-3.5" />
                          <span>New Test</span>
                        </button>

                        {/* View Past Reports */}
                        <button
                          onClick={() => handleViewPatientHistory(p)}
                          title="View Previous Reports for this Patient"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Patient Details"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeletePatient(p)}
                          title="Delete Patient Record"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (NO TABLE ON MOBILE - Prevents Horizontal Scroll!) */}
        <div className="block md:hidden p-3.5 space-y-3">
          {loading ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <span>Loading patient directory...</span>
            </div>
          ) : patients.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No patient records found.
            </div>
          ) : (
            patients.map(p => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {p.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      {p.id} • {p.gender.toUpperCase()} ({formatAge(p.ageYears, p.ageMonths, p.ageDays)})
                    </div>
                  </div>
                  {p.phone && (
                    <a
                      href={`tel:${p.phone}`}
                      className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{p.phone}</span>
                    </a>
                  )}
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  {p.guardianName && <div><span className="text-slate-400">Guardian:</span> {p.guardianName}</div>}
                  {p.address && <div><span className="text-slate-400">Address:</span> {p.address}</div>}
                  <div><span className="text-slate-400">Doctor:</span> {p.referringDoctor || 'Self / Direct'}</div>
                </div>

                {/* Touch Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => onNavigate('new-report', { selectedPatient: p })}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <FilePlus2 className="w-3.5 h-3.5" />
                    <span>New Test</span>
                  </button>

                  <button
                    onClick={() => handleViewPatientHistory(p)}
                    title="Past Reports"
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(p)}
                    title="Edit Patient Details"
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeletePatient(p)}
                    title="Delete Patient"
                    className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Patient Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                {editingPatient ? 'Edit Patient Information' : 'Register New Diagnostic Patient'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Muhammad Usman"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Father / Husband Name
                  </label>
                  <input
                    type="text"
                    value={formGuardian}
                    onChange={(e) => setFormGuardian(e.target.value)}
                    placeholder="e.g. Abdul Ghaffar"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth (Auto-age)
                  </label>
                  <input
                    type="date"
                    value={formDob}
                    onChange={handleDobChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age (Years / Months / Days)
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    <input
                      type="number"
                      min="0"
                      value={formAgeYears}
                      onChange={(e) => setFormAgeYears(parseInt(e.target.value) || 0)}
                      placeholder="Y"
                      className="w-full px-1.5 py-2 rounded border border-slate-300 dark:border-slate-700 text-center font-bold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={formAgeMonths}
                      onChange={(e) => setFormAgeMonths(parseInt(e.target.value) || 0)}
                      placeholder="M"
                      className="w-full px-1.5 py-2 rounded border border-slate-300 dark:border-slate-700 text-center font-bold"
                    />
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={formAgeDays}
                      onChange={(e) => setFormAgeDays(parseInt(e.target.value) || 0)}
                      placeholder="D"
                      className="w-full px-1.5 py-2 rounded border border-slate-300 dark:border-slate-700 text-center font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0345..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Referring Doctor
                  </label>
                  <input
                    type="text"
                    value={formRefDoctor}
                    onChange={(e) => setFormRefDoctor(e.target.value)}
                    placeholder="Dr. ..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Address / City
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. Dera Bakha, Bahawalpur"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Patient Record
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Patient Test History Modal */}
      {historyPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Diagnostic Reports for {historyPatient.name}
                </h3>
                <p className="text-xs text-slate-500">
                  MR #: {historyPatient.id} • {historyPatient.gender.toUpperCase()} • {formatAge(historyPatient.ageYears, historyPatient.ageMonths, historyPatient.ageDays)}
                </p>
              </div>
              <button
                onClick={() => setHistoryPatient(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {patientReports.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No previous reports found for this patient.
                </div>
              ) : (
                patientReports.map(rep => (
                  <div
                    key={rep.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="font-mono text-emerald-700 dark:text-emerald-400">{rep.reportNumber}</span>
                        <span className="text-[10px] text-slate-400">({rep.reportDate})</span>
                      </div>
                      <div className="text-slate-500 mt-1 flex flex-wrap gap-1">
                        {rep.testIds.map(tId => (
                          <span key={tId} className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-semibold uppercase">
                            {tId}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setHistoryPatient(null);
                          onPreviewReport(rep);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview / Print</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const p = historyPatient;
                  setHistoryPatient(null);
                  onNavigate('new-report', { selectedPatient: p });
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Test for {historyPatient.name}</span>
              </button>

              <button
                onClick={() => setHistoryPatient(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
