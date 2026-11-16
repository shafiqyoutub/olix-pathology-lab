import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  Users, 
  FlaskConical, 
  PlusCircle, 
  Search, 
  ArrowRight, 
  Printer, 
  Eye, 
  FileEdit,
  TrendingUp,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Report, Patient, DashboardStats, LabProfile, TestItem } from '../types';
import { api } from '../utils/api';
import { formatAge } from '../utils/calculations';

interface DashboardProps {
  profile: LabProfile;
  tests: TestItem[];
  onNavigate: (page: string, params?: any) => void;
  onPreviewReport: (report: Report) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  tests,
  onNavigate,
  onPreviewReport
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalReports: 0,
    todayReports: 0,
    pendingVerification: 0,
    finalizedReports: 0,
    totalPatients: 0,
    totalTests: 0
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsData, reportsData, patientsData] = await Promise.all([
        api.getStats(),
        api.getReports(),
        api.getPatients()
      ]);
      setStats(statsData);
      setRecentReports(reportsData.slice(0, 5));
      setRecentPatients(patientsData.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    onNavigate('reports', { search: searchQuery });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner & Quick Search */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 bg-teal-400/10 rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Clinical Pathology Laboratory Information System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile.labName || 'Raza Clinical Laboratory'}
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-xl">
              Welcome, <span className="font-semibold">{profile.doctorName}</span>. All diagnostic modules, automatic calculations, and patient records are synchronized.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigate('new-report')}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-5 h-5 text-slate-950" />
              <span>Create New Report</span>
            </button>
            <button
              onClick={loadDashboardData}
              title="Refresh Stats"
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center justify-center"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Instant Search Bar */}
        <form onSubmit={handleQuickSearchSubmit} className="mt-6 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report by Patient Name, Report # (e.g. RCL-24-101), or Patient ID..."
            className="w-full pl-12 pr-28 py-3 rounded-xl bg-white/95 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Total Reports */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalReports}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Lifetime archived</span>
          </div>
        </div>

        {/* Card 2: Today's Reports */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Tests</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats.todayReports}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            Registered today
          </div>
        </div>

        {/* Card 3: Pending Verification */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Sign-off</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
            {stats.pendingVerification}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            Draft / In review
          </div>
        </div>

        {/* Card 4: Total Patients */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patients</span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats.totalPatients}
          </div>
          <div className="mt-1 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            Active medical records
          </div>
        </div>

      </div>

      {/* Main Row: Recent Reports & Patient Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Recent Laboratory Reports */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Recently Generated Reports
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Latest pathology examinations with instant preview & print
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-semibold text-[10px]">
                  <th className="py-2.5 px-3">Report #</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Age / Sex</th>
                  <th className="py-2.5 px-3">Tests</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      No reports generated yet. Click "Create New Report" to start.
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {report.reportNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{report.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{report.patientId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {formatAge(report.ageYears, report.ageMonths, report.ageDays)} / {report.gender.toUpperCase()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {report.testIds.map(tId => (
                            <span key={tId} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase">
                              {tId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          report.status === 'finalized'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : report.status === 'verified'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewReport(report)}
                            title="Preview & Print Report"
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigate('new-report', { editReportId: report.id })}
                            title="Edit or Reissue Report"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (NO TABLES ON MOBILE - Prevents horizontal scroll!) */}
          <div className="block md:hidden space-y-3">
            {recentReports.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No reports generated yet. Click "Create New Report" to start.
              </div>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                      {report.reportNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      report.status === 'finalized'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : report.status === 'verified'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {report.patientName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      MR: <span className="font-mono">{report.patientId}</span> • {formatAge(report.ageYears, report.ageMonths, report.ageDays)} • {report.gender.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {report.testIds.map(tId => (
                      <span key={tId} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase border border-slate-200 dark:border-slate-600">
                        {tId}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => onPreviewReport(report)}
                      className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => onNavigate('new-report', { editReportId: report.id })}
                      className="py-2 px-3 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Quick Patient Registration & Directory */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Patients
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registered diagnostic patients
              </p>
            </div>
            <button
              onClick={() => onNavigate('patients')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentPatients.map(patient => (
              <div
                key={patient.id}
                className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 bg-slate-50/50 dark:bg-slate-800/40 transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {patient.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {patient.gender.toUpperCase()} • {formatAge(patient.ageYears, patient.ageMonths, patient.ageDays)}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {patient.id}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('new-report', { selectedPatient: patient })}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-2xs whitespace-nowrap"
                >
                  New Test
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('patients', { openAddModal: true })}
            className="w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-emerald-600 flex items-center justify-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>

      </div>

      {/* Available Pathology Categories Quick Bar */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-600" />
            Pathology Laboratory Test Catalog ({tests.length} Standard Tests Configured)
          </h3>
          <button
            onClick={() => onNavigate('test-library')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Manage Library & Reference Ranges →
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Hematology (CBC, ESR, Smear)', 'Biochemistry (Glucose, HbA1c, Lipids)', 'Liver Function Tests (LFT)', 'Renal Function Tests (RFT)', 'Serology & Viral Markers', 'Endocrinology & Hormones', 'Clinical Pathology (Urine & Stool R/E)', 'Coagulation (PT/INR, APTT)'].map(cat => (
            <span key={cat} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              {cat}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
