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
import { defaultDoctorSignatureSvg, defaultLabStampSvg, defaultLabLogoSvg } from '../utils/graphics';

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
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 print:hidden">
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Final Report: <span className="font-mono text-emerald-700 dark:text-emerald-400">{report.reportNumber}</span>
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
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
          <div className="flex items-center flex-wrap gap-2 text-xs">
            
            {/* Filter Toggle: Only Submitted Results */}
            <button
              onClick={() => setOnlySubmittedResults(!onlySubmittedResults)}
              title="Toggle to show only parameters with entered results or show all"
              className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-colors ${
                onlySubmittedResults
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{onlySubmittedResults ? 'Submitted Results Only (Active)' : 'Show All Selected'}</span>
            </button>

            {/* Mobile Fit vs 100% Zoom Toggle */}
            <div className="flex sm:hidden rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-700">
              <button
                type="button"
                onClick={() => setMobileFit(true)}
                className={`px-2.5 py-1.5 font-semibold text-xs transition-colors ${mobileFit ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                Fit
              </button>
              <button
                type="button"
                onClick={() => setMobileFit(false)}
                className={`px-2.5 py-1.5 font-semibold text-xs transition-colors ${!mobileFit ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300'}`}
              >
                100%
              </button>
            </div>

            {/* Page Size toggle */}
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-600 overflow-hidden bg-white dark:bg-slate-700">
              <button
                onClick={() => setPageSize('A4')}
                className={`px-2.5 py-1.5 font-semibold transition-colors ${pageSize === 'A4' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'}`}
              >
                A4
              </button>
              <button
                onClick={() => setPageSize('A5')}
                className={`px-2.5 py-1.5 font-semibold transition-colors ${pageSize === 'A5' ? 'bg-emerald-600 text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100'}`}
              >
                A5
              </button>
            </div>

            {/* Black & White mode toggle */}
            <button
              onClick={() => setIsBlackAndWhite(!isBlackAndWhite)}
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                isBlackAndWhite
                  ? 'bg-slate-800 text-white border-slate-900'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{isBlackAndWhite ? 'B&W Mode' : 'Color Mode'}</span>
            </button>

            {/* Pre-printed Letterhead toggle */}
            <button
              onClick={() => setIsLetterheadBlank(!isLetterheadBlank)}
              title="Hide logo and clinic address if printing on pre-printed laboratory letterhead stationery"
              className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
                isLetterheadBlank
                  ? 'bg-amber-600 text-white border-amber-700'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isLetterheadBlank ? 'Letterhead (Blank)' : 'Full Letterhead'}</span>
            </button>

            {/* Edit & Reissue Button */}
            {onEditReissue && (
              <button
                onClick={() => onEditReissue(report)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold flex items-center gap-1.5 border border-blue-200"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Edit / Reissue</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Generating...' : 'Download PDF'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
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
                pageSize === 'A5' ? 'w-[148mm] min-h-[210mm] p-6 text-[10px]' : 'w-[210mm] min-h-[297mm] p-10 text-xs'
              } ${isBlackAndWhite ? 'grayscale contrast-125' : ''}`}
              style={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}
            >
            
            {/* Top Clinical Strip */}
            <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-sky-700 rounded-full mb-4 print:mb-3" />

            {/* 1. HEADER SECTION */}
            {!isLetterheadBlank ? (
              <header className="border-b-2 border-slate-900 pb-3 mb-4">
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Left: Lab Logo & Clinical Title */}
                  <div className="flex items-center gap-3.5">
                    {profile.showLogo && (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                        <img
                          src={profile.logoUrl || defaultLabLogoSvg}
                          alt="Laboratory Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                          {profile.labName || 'RAZA CLINICAL LABORATORY'}
                        </h1>
                      </div>
                      <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mt-1">
                        {profile.tagline || 'Department of Clinical Pathology & Diagnostic Medicine'}
                      </p>
                      <div className="text-[10px] text-slate-600 mt-1 font-medium space-y-0.5">
                        <p>{profile.address}</p>
                        <p className="font-semibold text-slate-800">
                          Tel: <span className="font-bold">{profile.phone}</span>
                          {profile.altPhone && ` • Alt: ${profile.altPhone}`}
                          {profile.email && ` • Email: ${profile.email}`}
                        </p>
                        {profile.registrationNumber && (
                          <p className="text-[9px] text-slate-500 font-mono">
                            Licence / Registration: <span className="font-bold text-slate-700">{profile.registrationNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pathologist in Charge Credential Box */}
                  <div className="text-right flex-shrink-0 bg-slate-50 border border-slate-200 p-2.5 rounded-xl shadow-2xs min-w-[200px]">
                    <div className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider">Consultant Pathologist</div>
                    <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                      {profile.doctorName}
                    </h3>
                    <p className="text-[10px] font-bold text-teal-700">
                      {profile.doctorQualification}
                    </p>
                    <p className="text-[9px] text-slate-600 font-medium">
                      {profile.doctorDesignation}
                    </p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5 border-t border-slate-200 pt-0.5">
                      {profile.doctorRegistration}
                    </p>
                  </div>

                </div>
              </header>
            ) : (
              // Spacer if printing on pre-printed letterhead paper
              <div className="h-28 border-b border-dashed border-slate-300 mb-4 flex items-center justify-center text-xs text-slate-400 italic">
                (Pre-Printed Laboratory Letterhead Area)
              </div>
            )}

            {/* 2. PATIENT INFORMATION DEMOGRAPHICS GRID */}
            <section className="border border-slate-300 rounded-lg overflow-hidden mb-5 bg-white">
              <div className="bg-slate-800 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between">
                <span>Patient Demographics & Specimen Information</span>
                <span className="font-mono text-emerald-300">ISO 15189 Aligned LIS</span>
              </div>
              
              <div className="grid grid-cols-4 divide-x divide-y divide-slate-200 text-[11px]">
                
                {/* Cell 1: Patient Name */}
                <div className="p-2 col-span-2 bg-slate-50/60">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Patient Name:</span>
                  <span className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight">
                    {report.patientName}
                  </span>
                </div>

                {/* Cell 2: MR / Patient ID */}
                <div className="p-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">MR / Patient ID:</span>
                  <span className="font-mono font-bold text-slate-900 text-xs">{report.patientId}</span>
                </div>

                {/* Cell 3: Report No */}
                <div className="p-2 bg-emerald-50/40">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Report Number:</span>
                  <span className="font-mono font-black text-emerald-800 text-xs">{report.reportNumber}</span>
                </div>

                {/* Cell 4: Age / Gender */}
                <div className="p-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Age / Gender:</span>
                  <span className="font-bold text-slate-900">
                    {formatAge(report.ageYears, report.ageMonths, report.ageDays)} / {report.gender.toUpperCase()}
                  </span>
                </div>

                {/* Cell 5: Father / Husband */}
                <div className="p-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Father / Husband:</span>
                  <span className="font-semibold text-slate-800">{report.guardianName || '—'}</span>
                </div>

                {/* Cell 6: Contact */}
                <div className="p-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Contact Phone:</span>
                  <span className="font-mono text-slate-800">{report.phone || '—'}</span>
                </div>

                {/* Cell 7: Sample ID */}
                <div className="p-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Sample ID / Specimen:</span>
                  <span className="font-mono font-bold text-slate-800">{report.sampleId || 'SMP-EDTA/Serum'}</span>
                </div>

                {/* Cell 8: Referring Doctor */}
                <div className="p-2 col-span-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Referring Doctor / Clinic:</span>
                  <span className="font-bold text-slate-900 truncate block">
                    {report.referringDoctor || 'Self / Direct Walk-in'}
                  </span>
                </div>

                {/* Cell 9: Sample Date */}
                <div className="p-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Sample Collected:</span>
                  <span className="font-medium text-slate-800">{report.sampleDate}</span>
                </div>

                {/* Cell 10: Report Date */}
                <div className="p-2">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block">Reported Date & Time:</span>
                  <span className="font-semibold text-slate-950">{report.reportDate}</span>
                </div>

              </div>
            </section>

            {/* 3. TEST RESULTS TABLES (ONLY SUBMITTED RESULTS SHOWN) */}
            <main className="space-y-6">
              {displayedTestIds.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-center text-amber-900">
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
                      <div className="bg-slate-100 border-t-2 border-b-2 border-slate-900 px-3 py-1.5 mb-1.5 flex items-baseline justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900 tracking-wide uppercase">
                            {testDef.name}
                          </span>
                          {testDef.sampleType && (
                            <span className="text-[10px] text-slate-600 font-semibold">
                              [{testDef.sampleType}]
                            </span>
                          )}
                        </div>
                        {profile.showMethodology && testDef.method && (
                          <span className="text-[9px] text-slate-500 italic max-w-sm truncate">
                            Method: {testDef.method}
                          </span>
                        )}
                      </div>

                      {/* Professional Results Table */}
                      <table className="w-full text-left border-collapse text-xs mb-3">
                        <thead>
                          <tr className="border-b-2 border-slate-300 text-[10px] uppercase font-extrabold text-slate-700 bg-slate-50">
                            <th className="py-1.5 px-3 w-[40%]">Investigation / Parameter</th>
                            <th className="py-1.5 px-2 w-[22%] text-center">Observed Result</th>
                            <th className="py-1.5 px-2 w-[12%] text-center">Flag</th>
                            <th className="py-1.5 px-2 w-[12%] text-center">Unit</th>
                            <th className="py-1.5 px-3 w-[14%] text-right">Reference Range</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredSections.map(section => (
                            <React.Fragment key={section.name}>
                              {section.name !== 'General' && (
                                <tr className="bg-slate-100/70">
                                  <td colSpan={5} className="py-1 px-3 font-extrabold text-[10px] text-slate-800 uppercase tracking-wider">
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
                                  <tr key={param.id} className="hover:bg-slate-50/60 transition-colors">
                                    
                                    {/* Parameter Name */}
                                    <td className="py-1.5 px-3 font-semibold text-slate-900">
                                      {param.name}
                                    </td>
                                    
                                    {/* Result Value */}
                                    <td className="py-1.5 px-2 text-center">
                                      <span className={`text-xs ${
                                        isHigh
                                          ? 'font-black text-rose-700 tracking-tight'
                                          : isLow
                                          ? 'font-black text-sky-700 tracking-tight'
                                          : isAbnormal
                                          ? 'font-black text-purple-700'
                                          : 'font-bold text-slate-950'
                                      }`}>
                                        {val !== '' ? val : '—'}
                                      </span>
                                    </td>

                                    {/* Flag Badge */}
                                    <td className="py-1.5 px-2 text-center">
                                      {profile.showFlags && isHigh && (
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                                          HIGH ▲
                                        </span>
                                      )}
                                      {profile.showFlags && isLow && (
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-sky-100 text-sky-800 border border-sky-300">
                                          LOW ▼
                                        </span>
                                      )}
                                      {profile.showFlags && isAbnormal && (
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-800 border border-purple-300">
                                          ABNORMAL
                                        </span>
                                      )}
                                      {profile.showFlags && !isHigh && !isLow && !isAbnormal && (
                                        <span className="text-[10px] font-semibold text-slate-400">
                                          Normal
                                        </span>
                                      )}
                                    </td>

                                    {/* Unit */}
                                    <td className="py-1.5 px-2 text-center text-slate-600 font-mono text-[11px]">
                                      {param.unit || '—'}
                                    </td>

                                    {/* Reference Range */}
                                    <td className="py-1.5 px-3 text-right text-slate-700 font-medium text-[11px]">
                                      {rangeText}
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
              <section className="mt-4 pt-3 border-l-4 border-emerald-600 bg-slate-50 p-3 rounded-r-lg text-xs break-inside-avoid">
                <div className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  Pathologist Clinical Correlation & Diagnostic Impression:
                </div>
                <div className="text-slate-800 leading-relaxed font-sans font-medium">
                  {report.clinicalNotes}
                </div>
              </section>
            )}

            {/* End of Report Divider Marker */}
            <div className="mt-6 text-center text-[9px] text-slate-400 uppercase tracking-widest font-semibold border-t border-b border-slate-200 py-1">
              *** END OF LABORATORY INVESTIGATION REPORT ***
            </div>

            {/* 5. FOOTER & SIGNATURES SECTION */}
            <footer className="mt-6 pt-4 break-inside-avoid">
              
              <div className="flex items-end justify-between">
                
                {/* Left: QR Code & Verification */}
                <div className="flex items-center gap-3">
                  {profile.showQrCode && (
                    <div className="w-16 h-16 bg-white p-1 rounded-lg border-2 border-slate-300 flex items-center justify-center shadow-2xs">
                      <QrCode className="w-14 h-14 text-slate-800" />
                    </div>
                  )}
                  <div className="text-[9px] text-slate-600 leading-tight">
                    <div className="font-extrabold text-slate-900 uppercase">Electronically Validated Report</div>
                    <div>Report MR: <span className="font-mono font-semibold">{report.patientId}</span></div>
                    <div>Security Token: <span className="font-mono font-semibold">{report.reportNumber}-V{report.version}</span></div>
                    <div className="text-[8px] text-slate-400 mt-0.5">Scan QR code to verify report authenticity</div>
                  </div>
                </div>

                {/* Center: Official Stamp */}
                {profile.showStamp && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center -mb-2">
                    <img
                      src={profile.stampUrl || defaultLabStampSvg}
                      alt="Official Laboratory Stamp"
                      className="w-full h-full object-contain pointer-events-none"
                    />
                  </div>
                )}

                {/* Right: Pathologist Signature */}
                <div className="text-right min-w-[200px]">
                  {profile.showSignature && (
                    <div className="w-44 h-14 ml-auto mb-1 flex items-end justify-end">
                      <img
                        src={profile.signatureUrl || defaultDoctorSignatureSvg}
                        alt="Doctor Signature"
                        className="max-h-14 object-contain"
                      />
                    </div>
                  )}
                  <div className="border-t-2 border-slate-800 pt-1">
                    <div className="font-black text-xs text-slate-950 uppercase">{profile.doctorName}</div>
                    <div className="text-[10px] font-bold text-emerald-800">{profile.doctorQualification}</div>
                    <div className="text-[9px] text-slate-600 font-medium">{profile.doctorDesignation}</div>
                    <div className="text-[8.5px] text-slate-400 font-mono">{profile.doctorRegistration}</div>
                  </div>
                </div>

              </div>

              {/* Bottom Notice & Legal Disclaimer */}
              <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[8.5px] text-slate-500">
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
