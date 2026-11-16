import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Eye, 
  Printer, 
  Download, 
  FileEdit, 
  Trash2, 
  Calendar, 
  GitCommit, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Report, LabProfile, TestItem } from '../types';
import { api } from '../utils/api';
import { formatAge } from '../utils/calculations';

interface ReportHistoryProps {
  profile: LabProfile;
  tests: TestItem[];
  initialSearch?: string;
  onNavigate: (page: string, params?: any) => void;
  onPreviewReport: (report: Report) => void;
}

export const ReportHistory: React.FC<ReportHistoryProps> = ({
  profile,
  tests,
  initialSearch = '',
  onNavigate,
  onPreviewReport
}) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Revisions Modal State
  const [viewingRevisionsReport, setViewingRevisionsReport] = useState<Report | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getReports({ search, status: statusFilter });
      setReports(data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReports();
  };

  const handleDeleteReport = async (report: Report) => {
    if (report.status === 'finalized') {
      const confirmAuth = window.confirm(`Report ${report.reportNumber} is FINALIZED and legally locked. Are you sure you want to permanently delete it? (Logged in audit trail)`);
      if (!confirmAuth) return;
    } else {
      if (!window.confirm(`Delete report ${report.reportNumber}?`)) return;
    }

    try {
      await api.deleteReport(report.id, profile.doctorName);
      setReports(reports.filter(r => r.id !== report.id));
      alert(`Report ${report.reportNumber} deleted.`);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-600" />
            Report History & Version Archive
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, retrieve, reprint, and view revision trails for all laboratory reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('new-report')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            + Create New Report
          </button>
          <button
            onClick={fetchReports}
            title="Refresh list"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Patient Name, Report # (e.g. RCL-24-101), MR #, Phone, or Doctor..."
              className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
            >
              Filter
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="finalized">Finalized & Locked</option>
              <option value="verified">Verified</option>
              <option value="draft">Draft (Unsigned)</option>
            </select>
          </div>
        </form>
      </div>

      {/* Reports Display: Desktop Table & Mobile Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Desktop Table View (Hidden on Mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Report Number</th>
                <th className="py-3 px-4">Patient Details</th>
                <th className="py-3 px-4">Tests Included</th>
                <th className="py-3 px-4">Reporting Date</th>
                <th className="py-3 px-4">Status & Version</th>
                <th className="py-3 px-4">Sign-off Pathologist</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Loading report archive...</span>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No reports match the search filter.
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    
                    {/* Report Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      <div>{report.reportNumber}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{report.id}</div>
                    </td>

                    {/* Patient */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {report.patientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {report.gender.toUpperCase()} • {formatAge(report.ageYears, report.ageMonths, report.ageDays)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        MR: {report.patientId}
                      </div>
                    </td>

                    {/* Tests */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {report.testIds.map(tId => (
                          <span
                            key={tId}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase"
                          >
                            {tId}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-[11px]">
                      <div>{report.reportDate}</div>
                      <div className="text-[10px] text-slate-400">Ref: {report.referringDoctor || 'Self'}</div>
                    </td>

                    {/* Status & Version */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          report.status === 'finalized'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : report.status === 'verified'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {report.status}
                        </span>
                        
                        {/* Version pill */}
                        <button
                          onClick={() => setViewingRevisionsReport(report)}
                          title="Click to view version history"
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-0.5"
                        >
                          <GitCommit className="w-3 h-3 text-emerald-600" />
                          <span>v{report.version}</span>
                        </button>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium text-[11px] truncate max-w-[140px]">
                      {report.verifiedBy || profile.doctorName}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview & Print */}
                        <button
                          onClick={() => onPreviewReport(report)}
                          title="Preview, Print & Download PDF"
                          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit & Reissue */}
                        <button
                          onClick={() => onNavigate('new-report', { editReportId: report.id })}
                          title="Edit / Reissue Report"
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                        >
                          <FileEdit className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteReport(report)}
                          title="Delete Report"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View (NO TABLES ON MOBILE - Prevents Horizontal Scroll!) */}
        <div className="block md:hidden p-3.5 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
              <span>Loading report archive...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No reports match the search filter.
            </div>
          ) : (
            reports.map(report => (
              <div
                key={report.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5 shadow-2xs"
              >
                {/* Header: Report # + Status + Version */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">
                    {report.reportNumber}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      report.status === 'finalized'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : report.status === 'verified'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {report.status}
                    </span>
                    <button
                      onClick={() => setViewingRevisionsReport(report)}
                      title="View revisions"
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 flex items-center gap-0.5"
                    >
                      <GitCommit className="w-3 h-3 text-emerald-600" />
                      <span>v{report.version}</span>
                    </button>
                  </div>
                </div>

                {/* Patient Information */}
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {report.patientName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    MR: <span className="font-mono">{report.patientId}</span> • {formatAge(report.ageYears, report.ageMonths, report.ageDays)} • {report.gender.toUpperCase()}
                  </p>
                </div>

                {/* Tests Badges */}
                <div className="flex flex-wrap gap-1">
                  {report.testIds.map(tId => (
                    <span key={tId} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase border border-slate-200 dark:border-slate-600">
                      {tId}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span>{report.reportDate}</span>
                  <span className="truncate max-w-[150px]">{report.referringDoctor || 'Self'}</span>
                </div>

                {/* Touch Actions */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button
                    onClick={() => onPreviewReport(report)}
                    className="py-2 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => onNavigate('new-report', { editReportId: report.id })}
                    className="py-2 px-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-1"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report)}
                    className="py-2 px-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-400 hover:text-red-600 font-semibold text-xs flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Revisions & Version History Modal */}
      {viewingRevisionsReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-emerald-600" />
                  Version History: {viewingRevisionsReport.reportNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {viewingRevisionsReport.patientName} (Current: v{viewingRevisionsReport.version})
                </p>
              </div>
              <button
                onClick={() => setViewingRevisionsReport(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {(viewingRevisionsReport.revisions || []).map((rev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Revision Version {rev.version}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rev.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-700 dark:text-slate-300 font-medium">
                    {rev.notes || 'Routine revision or initial finalization.'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Author / Signatory: {rev.author}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewingRevisionsReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-semibold text-xs"
              >
                Close History
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
