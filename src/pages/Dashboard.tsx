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
    <div className="space-y-6 pb-12 relative">
      
      {/* Background Ambient Glow Orbs with CSS radial gradient for zero-lag 60 FPS scrolling */}
      <div 
        className="absolute -top-16 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0) 70%)' }}
      />
      <div 
        className="absolute top-64 right-6 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0) 70%)' }}
      />
      <div 
        className="absolute top-[520px] left-10 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.14) 0%, rgba(14,165,233,0) 70%)' }}
      />
      <div 
        className="absolute -bottom-10 right-1/3 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0) 70%)' }}
      />

      {/* Top Banner & Quick Search with Glossmorphism */}
      <div className="glass-panel-elevated relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-white/50 dark:border-white/10">
        {/* Luminous Glass Gradient Layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-teal-900/85 to-slate-950/95 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-black/25 pointer-events-none" />
        
        {/* Subtle decorative refractive circles */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-32 -top-12 w-48 h-48 bg-teal-300/20 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 dark:bg-white/10 border border-white/25 backdrop-blur-md text-xs font-semibold text-emerald-200 mb-2.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" /> Clinical Pathology Laboratory Information System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-xs">
              {profile.labName || 'Raza Clinical Laboratory'}
            </h1>
            <p className="text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
              Welcome, <span className="font-semibold text-white">{profile.doctorName}</span>. All diagnostic modules, automatic calculations, and patient records are synchronized.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => onNavigate('new-report')}
              className="btn-liquid-3d-emerald px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <PlusCircle className="w-5 h-5 text-white drop-shadow-xs" />
              <span>Create New Report</span>
            </button>
            <button
              onClick={loadDashboardData}
              title="Refresh Stats"
              className="btn-liquid-3d-secondary p-3.5 rounded-2xl text-white flex items-center justify-center cursor-pointer shadow-md"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Instant Search Bar (Glossy Frosted Capsule) */}
        <form onSubmit={handleQuickSearchSubmit} className="mt-6 relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-300 z-10 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report by Patient Name, Report # (e.g. RCL-24-101), or Patient ID..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-white/60 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400/80 shadow-inner transition-all"
          />
          <button
            type="submit"
            className="btn-liquid-3d-emerald !absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl text-white font-bold text-xs cursor-pointer shadow-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Metric Cards Grid (Glossmorphic 3D Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 relative z-10">
        
        {/* Card 1: Total Reports */}
        <div className="glass-panel glass-card-interactive p-5 rounded-2xl border border-white/60 dark:border-white/10 relative overflow-hidden shadow-lg">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Reports</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center backdrop-blur-md shadow-xs">
              <FileText className="w-5 h-5 drop-shadow-2xs" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
            {stats.totalReports}
          </div>
          <div className="mt-2 flex items-center gap-1.5 relative z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>Lifetime archived</span>
            </span>
          </div>
        </div>

        {/* Card 2: Today's Reports */}
        <div className="glass-panel glass-card-interactive p-5 rounded-2xl border border-white/60 dark:border-white/10 relative overflow-hidden shadow-lg">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-400/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Tests</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center backdrop-blur-md shadow-xs">
              <Clock className="w-5 h-5 drop-shadow-2xs" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
            {stats.todayReports}
          </div>
          <div className="mt-2 relative z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 text-[10px] sm:text-xs text-blue-700 dark:text-blue-300 font-semibold">
              Registered today
            </span>
          </div>
        </div>

        {/* Card 3: Pending Verification */}
        <div className="glass-panel glass-card-interactive p-5 rounded-2xl border border-white/60 dark:border-white/10 relative overflow-hidden shadow-lg">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Sign-off</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center backdrop-blur-md shadow-xs">
              <Clock className="w-5 h-5 drop-shadow-2xs" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight relative z-10">
            {stats.pendingVerification}
          </div>
          <div className="mt-2 relative z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-[10px] sm:text-xs text-amber-700 dark:text-amber-300 font-semibold">
              Draft / In review
            </span>
          </div>
        </div>

        {/* Card 4: Total Patients */}
        <div className="glass-panel glass-card-interactive p-5 rounded-2xl border border-white/60 dark:border-white/10 relative overflow-hidden shadow-lg">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-purple-400/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Patients</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center backdrop-blur-md shadow-xs">
              <Users className="w-5 h-5 drop-shadow-2xs" />
            </div>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight relative z-10">
            {stats.totalPatients}
          </div>
          <div className="mt-2 relative z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-400/10 border border-purple-500/20 text-[10px] sm:text-xs text-purple-700 dark:text-purple-300 font-semibold">
              Active medical records
            </span>
          </div>
        </div>

      </div>

      {/* Main Row: Recent Reports & Patient Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Left Column (2 Cols): Recent Laboratory Reports (Glossy Glass Panel) */}
        <div className="lg:col-span-2 glass-panel-elevated rounded-3xl p-5 sm:p-6 space-y-4 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/30 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Recently Generated Reports
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Latest pathology examinations with instant preview & print
              </p>
            </div>
            <button
              onClick={() => onNavigate('reports')}
              className="btn-liquid-3d-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/40 dark:border-white/10 text-slate-400 uppercase font-bold text-[10px] bg-white/30 dark:bg-slate-800/30 rounded-xl">
                  <th className="py-2.5 px-3 rounded-l-xl">Report #</th>
                  <th className="py-2.5 px-3">Patient</th>
                  <th className="py-2.5 px-3">Age / Sex</th>
                  <th className="py-2.5 px-3">Tests</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20 dark:divide-white/5">
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 px-3"><div className="h-4 w-20 bg-slate-200/60 dark:bg-slate-700/60 rounded" /></td>
                      <td className="py-3 px-3"><div className="h-4 w-28 bg-slate-200/60 dark:bg-slate-700/60 rounded mb-1" /><div className="h-3 w-16 bg-slate-200/40 dark:bg-slate-700/40 rounded" /></td>
                      <td className="py-3 px-3"><div className="h-4 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded" /></td>
                      <td className="py-3 px-3"><div className="h-4 w-24 bg-slate-200/60 dark:bg-slate-700/60 rounded" /></td>
                      <td className="py-3 px-3"><div className="h-5 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded-full" /></td>
                      <td className="py-3 px-3 text-right"><div className="h-7 w-16 ml-auto bg-slate-200/60 dark:bg-slate-700/60 rounded-lg" /></td>
                    </tr>
                  ))
                ) : recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No reports generated yet. Click "Create New Report" to start.
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors">
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
                            <span key={tId} className="px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800/70 border border-white/50 dark:border-white/10 text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase shadow-2xs">
                              {tId}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-2xs ${
                          report.status === 'finalized'
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                            : report.status === 'verified'
                            ? 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30'
                            : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onPreviewReport(report)}
                            title="Preview & Print Report"
                            className="btn-liquid-3d-emerald p-2 rounded-xl text-white cursor-pointer shadow-xs"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigate('new-report', { editReportId: report.id })}
                            title="Edit or Reissue Report"
                            className="btn-liquid-3d-secondary p-2 rounded-xl text-slate-700 dark:text-slate-200 cursor-pointer shadow-xs"
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

          {/* Mobile Card View (Glossy Cards - Zero horizontal scroll) */}
          <div className="block md:hidden space-y-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-2xl border border-white/50 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 animate-pulse space-y-2">
                  <div className="h-4 w-24 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
                  <div className="h-5 w-36 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
                  <div className="h-4 w-48 bg-slate-200/40 dark:bg-slate-700/40 rounded" />
                </div>
              ))
            ) : recentReports.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No reports generated yet. Click "Create New Report" to start.
              </div>
            ) : (
              recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-2xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                      {report.reportNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      report.status === 'finalized'
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                        : report.status === 'verified'
                        ? 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                    }`}>
                      {report.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {report.patientName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      MR: <span className="font-mono">{report.patientId}</span> • {formatAge(report.ageYears, report.ageMonths, report.ageDays)} • {report.gender.toUpperCase()}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {report.testIds.map(tId => (
                      <span key={tId} className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-700/80 text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase border border-white/60 dark:border-white/10 shadow-2xs">
                        {tId}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/30 dark:border-white/10">
                    <button
                      onClick={() => onPreviewReport(report)}
                      className="btn-liquid-3d-emerald py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => onNavigate('new-report', { editReportId: report.id })}
                      className="btn-liquid-3d-secondary py-2.5 px-3 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
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

        {/* Right Column: Quick Patient Registration & Directory (Glossy Glass Panel) */}
        <div className="glass-panel-elevated rounded-3xl p-5 sm:p-6 space-y-4 border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/30 dark:border-white/10 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Recent Patients
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Registered diagnostic patients
              </p>
            </div>
            <button
              onClick={() => onNavigate('patients')}
              className="btn-liquid-3d-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="p-3.5 rounded-2xl border border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 animate-pulse flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-4 w-28 bg-slate-200/60 dark:bg-slate-700/60 rounded" />
                    <div className="h-3 w-20 bg-slate-200/40 dark:bg-slate-700/40 rounded" />
                  </div>
                  <div className="h-7 w-16 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl" />
                </div>
              ))
            ) : (
              recentPatients.map(patient => (
                <div
                  key={patient.id}
                  className="glass-panel glass-card-interactive p-3.5 rounded-2xl border border-white/50 dark:border-white/10 hover:border-emerald-400/40 transition-all flex items-center justify-between gap-3 shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {patient.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {patient.gender.toUpperCase()} • {formatAge(patient.ageYears, patient.ageMonths, patient.ageDays)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {patient.id}
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('new-report', { selectedPatient: patient })}
                    className="btn-liquid-3d-emerald px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    New Test
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => onNavigate('patients', { openAddModal: true })}
            className="btn-liquid-3d-secondary w-full py-3 rounded-2xl border-dashed border-2 border-emerald-500/40 hover:border-emerald-500 font-bold text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Register New Patient</span>
          </button>
        </div>

      </div>

      {/* Available Pathology Categories Quick Bar (Glossmorphic Card) */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/60 dark:border-white/10 shadow-xl relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-3 border-b border-white/30 dark:border-white/10">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Pathology Laboratory Test Catalog ({tests.length} Standard Tests Configured)
          </h3>
          <button
            onClick={() => onNavigate('test-library')}
            className="btn-liquid-3d-secondary px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1 cursor-pointer w-fit shadow-2xs"
          >
            <span>Manage Library & Reference Ranges</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Hematology (CBC, ESR, Smear)', 'Biochemistry (Glucose, HbA1c, Lipids)', 'Liver Function Tests (LFT)', 'Renal Function Tests (RFT)', 'Serology & Viral Markers', 'Endocrinology & Hormones', 'Clinical Pathology (Urine & Stool R/E)', 'Coagulation (PT/INR, APTT)'].map(cat => (
            <span
              key={cat}
              className="glass-panel glass-card-interactive px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 border border-white/50 dark:border-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/10 shadow-2xs cursor-default transition-all"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
