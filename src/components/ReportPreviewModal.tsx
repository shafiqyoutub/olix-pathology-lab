import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileEdit, 
  Palette, 
  Layers, 
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Filter,
  FileText
} from 'lucide-react';
import { Report, LabProfile, TestItem } from '../types';
import { formatAge } from '../utils/calculations';
import { exportReportToPdf, printDirectly } from '../utils/pdfGenerator';
import { defaultDoctorSignatureSvg, defaultLabStampSvg, defaultLabLogoSvg, defaultTechnologistSignatureSvg } from '../utils/graphics';

interface ReportPreviewModalProps {
  report: Report | null;
  profile: LabProfile;
  tests: TestItem[];
  onClose: () => void;
  onEditReissue?: (report: Report) => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  profile,
  tests,
  onClose,
  onEditReissue
}) => {
  const [pageSize, setPageSize] = useState<'A4' | 'A5'>(profile.pageSize || 'A4');
  const [isBlackAndWhite, setIsBlackAndWhite] = useState<boolean>(false);
  const [isLetterheadBlank, setIsLetterheadBlank] = useState<boolean>(profile.headerStyle === 'letterhead-blank');
  const [onlySubmittedResults, setOnlySubmittedResults] = useState<boolean>(true);
  const [mobileFit, setMobileFit] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  if (!report) return null;

  // Build a lookup map of test definitions
  const testMap = new Map<string, TestItem>();
  tests.forEach(t => testMap.set(t.id, t));

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const filename = `${report.reportNumber}_${report.patientName.replace(/\s+/g, '_')}`;
      await exportReportToPdf('printable-lab-report', filename, pageSize);
    } catch (err: any) {
      alert(`PDF Generation error: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printDirectly();
  };

  // Helper: check if a parameter has a non-empty submitted result
  const hasParamResult = (testId: string, paramId: string): boolean => {
    const res = report.testResults?.[testId]?.[paramId];
    if (!res) return false;
    if (res.value === undefined || res.value === null) return false;
    const str = String(res.value).trim();
    return str !== '' && str !== '—' && str !== '-';
  };

  // Filter tests: only include tests that have at least one submitted result (if onlySubmittedResults is active)
  const displayedTestIds = report.testIds.filter(testId => {
    if (!onlySubmittedResults) return true;
    const testDef = testMap.get(testId);
    if (!testDef) return false;
    return testDef.parameters.some(param => hasParamResult(testId, param.id));
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:w-full print:rounded-none">
        
        {/* Controls Toolbar (Hidden in Print) */}
        <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2.5 print:hidden">
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Final Report: <span className="font-mono text-emerald-700 dark:text-emerald-400">{report.reportNumber}</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              report.status === 'finalized'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : report.status === 'verified'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {report.status} (v{report.version})
            </span>
          </div>

          {/* Configuration toggles */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs">
            
            {/* Filter Toggle: Only Submitted Results */}
            <button
              onClick={() => setOnlySubmittedResults(!onlySubmittedResults)}
              title="Toggle to show only parameters with entered results or show all"
              className={`px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                onlySubmittedResults
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{onlySubmittedResults ? 'Submitted Only' : 'Show All'}</span>
            </button>

            {/* Mobile Fit vs 100% Zoom Toggle */}
            <div className="flex sm:hidden rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-700">
              <button
                type="button"
                onClick={() => setMobileFit(true)}
                className={`px-2 py-1 font-semibold text-xs transition-colors ${mobileFit ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => setMobileFit(false)}
                className={`px-2 py-1 font-semibold text-xs transition-colors ${!mobileFit ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                100%
              </button>
            </div>

            {/* Page Size toggle */}
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-700">
              <button
                onClick={() => setPageSize('A4')}
                className={`px-2 py-1 font-semibold transition-colors ${pageSize === 'A4' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'}`}
              >
                A4
              </button>
              <button
                onClick={() => setPageSize('A5')}
                className={`px-2 py-1 font-semibold transition-colors ${pageSize === 'A5' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'}`}
              >
                A5
              </button>
            </div>

            {/* Black & White mode toggle */}
            <button
              onClick={() => setIsBlackAndWhite(!isBlackAndWhite)}
              className={`px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
                isBlackAndWhite
                  ? 'bg-slate-800 text-white border-slate-900'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{isBlackAndWhite ? 'B&W' : 'Color'}</span>
            </button>

            {/* Pre-printed Letterhead toggle */}
            <button
              onClick={() => setIsLetterheadBlank(!isLetterheadBlank)}
              title="Hide logo and clinic address if printing on pre-printed laboratory letterhead stationery"
              className={`px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
                isLetterheadBlank
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isLetterheadBlank ? 'Letterhead (Blank)' : 'Letterhead'}</span>
            </button>

            {/* Edit & Reissue Button */}
            {onEditReissue && (
              <button
                onClick={() => onEditReissue(report)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1 border border-blue-200"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-1 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Exporting...' : 'PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Document Preview Scroll Area */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-8 bg-slate-300/80 dark:bg-slate-950 flex flex-col items-center print:p-0 print:bg-white print:overflow-visible">
          
          <div className={mobileFit ? 'origin-top transition-transform scale-[0.45] sm:scale-100 -mb-[150mm] sm:mb-0 w-full flex justify-center' : 'w-full flex justify-start sm:justify-center'}>
            {/* Exact Medical Document (A4: 210mm wide / A5: 148mm wide) */}
            <div
              id="printable-lab-report"
              className={`bg-white text-slate-900 shadow-2xl print:shadow-none mx-auto relative shrink-0 ${
                pageSize === 'A5' ? 'w-[148mm] p-4 text-[10px]' : 'w-[210mm] p-6 text-xs'
              } ${isBlackAndWhite ? 'grayscale contrast-125' : ''}`}
              style={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
            
            {/* Top Clinical Strip */}
            <div className="h-1 bg-gradient-to-r from-slate-900 via-teal-700 to-emerald-600 rounded-full mb-3 print:mb-2" />

            {/* 1. HEADER SECTION (Hospital-Grade Balanced Header) */}
            {!isLetterheadBlank ? (
              <header className="border-b border-slate-300 pb-3 mb-3.5">
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Left: Lab Logo & Clinical Title */}
                  <div className="flex items-center gap-3">
                    {profile.showLogo && (
                      <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={profile.logoUrl || defaultLabLogoSvg}
                          alt="Laboratory Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <h1 className="text-xl sm:text-[22px] font-black text-slate-900 tracking-tight leading-snug uppercase">
                        {profile.labName || 'RAZA CLINICAL LABORATORY'}
                      </h1>
                      <p className="text-[9.5px] font-bold text-teal-800 uppercase tracking-wider mt-0.5">
                        {profile.tagline || 'Department of Clinical Pathology & Diagnostic Medicine'}
                      </p>
                      <div className="text-[9.5px] text-slate-600 mt-0.5 font-medium leading-tight">
                        <p>{profile.address}</p>
                        <p className="text-slate-700 mt-0.5">
                          <span className="font-bold text-slate-900">Tel: {profile.phone}</span>
                          {profile.altPhone && ` • Alt: ${profile.altPhone}`}
                          {profile.email && ` • ${profile.email}`}
                          {profile.registrationNumber && ` • Reg: ${profile.registrationNumber}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Pathologist in Charge Credential Block (Integrated Clinical Typography) */}
                  <div className="text-right flex-shrink-0 border-l border-slate-200 pl-3.5 py-0.5 min-w-[185px]">
                    <div className="text-[8.5px] uppercase font-bold text-teal-800 tracking-wider">Consultant Pathologist</div>
                    <h3 className="text-sm font-black text-slate-900 mt-0.5 leading-snug">
                      {profile.doctorName}
                    </h3>
                    <p className="text-[9.5px] font-bold text-teal-700 leading-tight">
                      {profile.doctorQualification}
                    </p>
                    <p className="text-[9px] text-slate-600 font-medium">
                      {profile.doctorDesignation}
                    </p>
                    <p className="text-[8.5px] text-slate-400 font-mono mt-0.5">
                      {profile.doctorRegistration}
                    </p>
                  </div>

                </div>
              </header>
            ) : (
              // Spacer if printing on pre-printed letterhead paper
              <div className="h-24 border-b border-dashed border-slate-300 mb-3.5 flex items-center justify-center text-xs text-slate-400 italic">
                (Pre-Printed Laboratory Letterhead Area)
              </div>
            )}

            {/* 2. PATIENT INFORMATION DEMOGRAPHICS TABLE (Zero-clipping structured layout) */}
            <section className="border border-slate-300 rounded-lg overflow-hidden mb-4 bg-white shadow-2xs">
              <div className="bg-slate-900 text-white px-3 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Patient Demographics & Specimen Information</span>
                <span className="font-mono text-teal-300 text-[8.5px]">ISO 15189 Aligned LIS</span>
              </div>
              
              <table className="w-full text-left text-[11px] border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 w-[28%] bg-slate-50/70 border-r border-slate-200">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Patient Name:</span>
                      <span className="font-black text-slate-950 text-xs uppercase tracking-tight block">
                        {report.patientName}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 w-[24%] border-r border-slate-200">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">MR / Patient ID:</span>
                      <span className="font-mono font-bold text-slate-900 text-xs block">{report.patientId}</span>
                    </td>
                    <td className="py-1.5 px-3 w-[24%] border-r border-slate-200 bg-teal-50/40">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Report Number:</span>
                      <span className="font-mono font-black text-teal-800 text-xs block">{report.reportNumber}</span>
                    </td>
                    <td className="py-1.5 px-3 w-[24%]">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Age / Gender:</span>
                      <span className="font-bold text-slate-900 block">
                        {formatAge(report.ageYears, report.ageMonths, report.ageDays)} / {report.gender.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 border-r border-slate-200">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Father / Husband:</span>
                      <span className="font-semibold text-slate-800 block">{report.guardianName || '—'}</span>
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Contact Phone:</span>
                      <span className="font-mono text-slate-800 block">{report.phone || '—'}</span>
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Sample ID / Specimen:</span>
                      <span className="font-mono font-bold text-slate-800 block">{report.sampleId || 'SMP-EDTA/Serum'}</span>
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Registered Date:</span>
                      <span className="font-medium text-slate-800 block">
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : report.sampleDate}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="py-1.5 px-3 border-r border-slate-200 bg-slate-50/50">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Referring Doctor / Clinic:</span>
                      <span className="font-bold text-slate-900 block leading-tight">
                        {report.referringDoctor || 'Self / Direct Walk-in'}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 border-r border-slate-200">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Sample Collected:</span>
                      <span className="font-medium text-slate-800 block">{report.sampleDate}</span>
                    </td>
                    <td className="py-1.5 px-3">
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Reported Date & Time:</span>
                      <span className="font-semibold text-slate-950 block">{report.reportDate}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* 3. TEST RESULTS TABLES (ONLY SUBMITTED RESULTS SHOWN) */}
            <main className="space-y-4">
              {displayedTestIds.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-center text-amber-900">
                  <p className="font-bold text-sm mb-1">No Test Results Submitted Yet</p>
                  <p className="text-xs">
                    Please enter observed result values in the test form and save the report. Only investigations with submitted results are rendered on the final clinical report.
                  </p>
                </div>
              ) : (
                displayedTestIds.map((testId) => {
                  const testDef = testMap.get(testId);
                  const resultsForTest = report.testResults?.[testId] || {};

                  if (!testDef) return null;

                  // Group parameters by section
                  const rawSections: { name: string; params: typeof testDef.parameters }[] = [];
                  testDef.parameters.forEach(param => {
                    const secName = param.section || 'General';
                    let sec = rawSections.find(s => s.name === secName);
                    if (!sec) {
                      sec = { name: secName, params: [] };
                      rawSections.push(sec);
                    }
                    sec.params.push(param);
                  });

                  // STRICT REQUIREMENT: Only include sections and parameters that have an entered result!
                  const filteredSections = rawSections
                    .map(sec => ({
                      name: sec.name,
                      params: sec.params.filter(p => !onlySubmittedResults || hasParamResult(testId, p.id))
                    }))
                    .filter(sec => sec.params.length > 0);

                  if (filteredSections.length === 0) return null;

                  return (
                    <div key={testId} className="break-inside-avoid">
                      
                      {/* Test Title Header Bar */}
                      <div className="bg-slate-100 border-t-2 border-b border-slate-800 px-3 py-1 mb-1 flex items-baseline justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900 tracking-wide uppercase">
                            {testDef.name}
                          </span>
                          {testDef.sampleType && (
                            <span className="text-[9.5px] text-slate-600 font-semibold">
                              [{testDef.sampleType}]
                            </span>
                          )}
                        </div>
                        {profile.showMethodology && testDef.method && (
                          <span className="text-[8.5px] text-slate-500 italic max-w-sm truncate">
                            Method: {testDef.method}
                          </span>
                        )}
                      </div>

                      {/* Professional Hospital Results Table */}
                      <table className="w-full text-left border-collapse text-xs mb-2">
                        <thead>
                          <tr className="border-b-2 border-slate-300 bg-slate-50/90 text-slate-700">
                            <th className="w-[36%] py-1.5 px-3 text-left text-[9.5px] font-bold uppercase tracking-wider">
                              Investigation / Parameter
                            </th>
                            <th className="w-[18%] py-1.5 px-2 text-center text-[9.5px] font-bold uppercase tracking-wider">
                              Result
                            </th>
                            <th className="w-[14%] py-1.5 px-2 text-center text-[9.5px] font-bold uppercase tracking-wider">
                              Status
                            </th>
                            <th className="w-[18%] py-1.5 px-2 text-center text-[9.5px] font-bold uppercase tracking-wider">
                              Reference Interval
                            </th>
                            <th className="w-[14%] py-1.5 px-2 text-center text-[9.5px] font-bold uppercase tracking-wider">
                              Unit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredSections.map(section => (
                            <React.Fragment key={section.name}>
                              {section.name !== 'General' && (
                                <tr className="bg-slate-50">
                                  <td colSpan={5} className="py-1 px-3 text-[9px] font-extrabold uppercase text-slate-700 tracking-wider">
                                    • {section.name}
                                  </td>
                                </tr>
                              )}

                              {section.params.map(param => {
                                const resItem = resultsForTest[param.id];
                                const val = resItem?.value !== undefined ? String(resItem.value) : '';
                                const flag = resItem?.flag || 'normal';

                                // Range matching
                                const rangeObj = param.ranges?.[0];
                                const rangeText = rangeObj?.text || '—';

                                const isHigh = flag === 'high';
                                const isLow = flag === 'low';
                                const isAbnormal = flag === 'abnormal';

                                return (
                                  <tr key={param.id} className="hover:bg-slate-50/40 transition-colors">
                                    
                                    {/* Parameter Name */}
                                    <td className="w-[36%] py-1.5 px-3 align-middle text-left">
                                      <span style={{ display: 'inline-block', height: '20px', lineHeight: '20px', verticalAlign: 'middle', fontSize: '11px', fontWeight: 600, color: '#0f172a' }}>
                                        {param.name}
                                      </span>
                                    </td>
                                    
                                    {/* Result Value */}
                                    <td className="w-[18%] py-1.5 px-2 align-middle text-center">
                                      <span
                                        style={{
                                          display: 'inline-block',
                                          height: '20px',
                                          lineHeight: '20px',
                                          verticalAlign: 'middle',
                                          fontSize: '11.5px',
                                          fontWeight: isHigh || isLow || isAbnormal ? 900 : 700,
                                          color: isHigh ? '#be123c' : isLow ? '#0369a1' : isAbnormal ? '#7e22ce' : '#020617',
                                          textAlign: 'center'
                                        }}
                                      >
                                        {val !== '' ? val : '—'}
                                      </span>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="w-[14%] py-1.5 px-2 align-middle text-center">
                                      {profile.showFlags && isHigh && (
                                        <svg width="58" height="20" viewBox="0 0 58 20" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                          <rect x="1" y="1" width="56" height="18" rx="3.5" fill="#fff1f2" stroke="#fca5a5" strokeWidth="1" />
                                          <text x="29" y="10.5" textAnchor="middle" dominantBaseline="central" fill="#be123c" fontSize="9" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">HIGH ▲</text>
                                        </svg>
                                      )}
                                      {profile.showFlags && isLow && (
                                        <svg width="58" height="20" viewBox="0 0 58 20" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                          <rect x="1" y="1" width="56" height="18" rx="3.5" fill="#f0f9ff" stroke="#7dd3fc" strokeWidth="1" />
                                          <text x="29" y="10.5" textAnchor="middle" dominantBaseline="central" fill="#0369a1" fontSize="9" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">LOW ▼</text>
                                        </svg>
                                      )}
                                      {profile.showFlags && isAbnormal && (
                                        <svg width="68" height="20" viewBox="0 0 68 20" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                                          <rect x="1" y="1" width="66" height="18" rx="3.5" fill="#faf5ff" stroke="#d8b4fe" strokeWidth="1" />
                                          <text x="34" y="10.5" textAnchor="middle" dominantBaseline="central" fill="#7e22ce" fontSize="8.5" fontWeight="800" fontFamily="system-ui, -apple-system, sans-serif" letterSpacing="0.5">ABNORMAL</text>
                                        </svg>
                                      )}
                                      {profile.showFlags && !isHigh && !isLow && !isAbnormal && (
                                        <span
                                          style={{
                                            display: 'inline-block',
                                            height: '20px',
                                            lineHeight: '20px',
                                            fontSize: '9.5px',
                                            fontWeight: 500,
                                            color: '#94a3b8',
                                            textAlign: 'center',
                                            verticalAlign: 'middle'
                                          }}
                                        >
                                          Normal
                                        </span>
                                      )}
                                    </td>

                                    {/* Reference Range */}
                                    <td className="w-[18%] py-1.5 px-2 align-middle text-center">
                                      <span style={{ display: 'inline-block', height: '20px', lineHeight: '20px', verticalAlign: 'middle', fontSize: '10.5px', fontWeight: 500, color: '#475569' }}>
                                        {rangeText}
                                      </span>
                                    </td>

                                    {/* Unit */}
                                    <td className="w-[14%] py-1.5 px-2 align-middle text-center">
                                      <span style={{ display: 'inline-block', height: '20px', lineHeight: '20px', verticalAlign: 'middle', fontSize: '10.5px', fontFamily: 'monospace', color: '#64748b' }}>
                                        {param.unit || '—'}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>

                    </div>
                  );
                })
              )}
            </main>

            {/* 4. CLINICAL REMARKS & PATHOLOGIST IMPRESSION */}
            {report.clinicalNotes && (
              <section className="mt-3 p-2.5 border-l-3 border-teal-600 bg-slate-50/80 rounded-r-lg text-xs break-inside-avoid">
                <div className="font-bold text-slate-900 text-[10px] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-700" />
                  Pathologist Clinical Correlation & Diagnostic Impression:
                </div>
                <div className="text-slate-800 text-[11px] leading-relaxed font-sans font-medium">
                  {report.clinicalNotes}
                </div>
              </section>
            )}

            {/* End of Report Divider Marker */}
            <div className="mt-4 text-center text-[8.5px] text-slate-400 uppercase tracking-widest font-semibold border-t border-b border-slate-200 py-0.5">
              *** END OF LABORATORY INVESTIGATION REPORT ***
            </div>

            {/* 5. FOOTER & SIGNATURES SECTION */}
            <footer className="mt-4 pt-2 break-inside-avoid">
              
              <div className="flex items-end justify-between">
                
                {/* Left: QR Code & Verification */}
                <div className="flex items-center gap-2.5">
                  {profile.showQrCode && (
                    <div className="w-13 h-13 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shadow-2xs shrink-0">
                      <QrCode className="w-11 h-11 text-slate-800" />
                    </div>
                  )}
                  <div className="text-[8.5px] text-slate-600 leading-tight">
                    <div className="font-extrabold text-slate-900 uppercase">Electronically Validated Report</div>
                    <div>MR: <span className="font-mono font-semibold">{report.patientId}</span></div>
                    <div>Token: <span className="font-mono font-semibold">{report.reportNumber}-V{report.version}</span></div>
                    <div className="text-[7.5px] text-slate-400 mt-0.5">Scan QR code to verify report authenticity</div>
                  </div>
                </div>

                {/* Center: Official Stamp & Medical Lab Technologist */}
                <div className="flex items-center gap-3 shrink-0">
                  {profile.showStamp && (
                    <div className="w-20 h-20 sm:w-22 sm:h-22 flex items-center justify-center -mb-1 shrink-0">
                      <img
                        src={profile.stampUrl || defaultLabStampSvg}
                        alt="Official Laboratory Stamp"
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  )}

                  {/* Medical Lab Technologist */}
                  <div className="text-left min-w-[145px]">
                    <div className="w-32 h-10 mb-0.5 flex items-end justify-start">
                      <img
                        src={profile.technologistSignatureUrl || defaultTechnologistSignatureSvg}
                        alt="Technologist Signature"
                        className="max-h-10 object-contain"
                      />
                    </div>
                    <div className="border-t border-slate-800 pt-1">
                      <div className="font-black text-[10.5px] text-slate-950 uppercase tracking-tight">
                        {profile.technologistName || 'Muhammad Raza Ul Hasnain'}
                      </div>
                      <div className="text-[9px] font-bold text-teal-800 leading-tight">
                        {(profile.technologistDesignation || 'Medical Lab Technologist').replace(/\s*\(MLT\)/i, '')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Pathologist Signature */}
                <div className="text-right min-w-[185px]">
                  {profile.showSignature && (
                    <div className="w-36 h-11 ml-auto mb-1 flex items-end justify-end">
                      <img
                        src={profile.signatureUrl || defaultDoctorSignatureSvg}
                        alt="Doctor Signature"
                        className="max-h-11 object-contain"
                      />
                    </div>
                  )}
                  <div className="border-t border-slate-800 pt-1">
                    <div className="font-black text-[11px] text-slate-950 uppercase">{profile.doctorName}</div>
                    <div className="text-[8.5px] text-slate-600 font-medium">{profile.doctorDesignation}</div>
                    <div className="text-[8px] text-slate-400 font-mono">{profile.doctorRegistration}</div>
                  </div>
                </div>

              </div>

              {/* Bottom Notice & Legal Disclaimer */}
              <div className="mt-3 pt-1.5 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500">
                <p className="max-w-[85%] leading-tight">
                  <span className="font-bold">Important Notice:</span> {profile.footerNotice}
                </p>
                <p className="font-mono font-bold text-slate-600">Page 1 of 1</p>
              </div>

            </footer>

          </div>

          </div>

        </div>

      </div>

    </div>
  );
};
