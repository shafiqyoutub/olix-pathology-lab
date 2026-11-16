import React, { useState } from 'react';
import { 
  Palette, 
  Save, 
  Check, 
  Eye, 
  Sparkles, 
  Sliders, 
  Layers, 
  Maximize2,
  FileText,
  QrCode
} from 'lucide-react';
import { LabProfile } from '../types';
import { api } from '../utils/api';
import { defaultDoctorSignatureSvg, defaultLabStampSvg, defaultLabLogoSvg } from '../utils/graphics';

interface ReportDesignerProps {
  profile: LabProfile;
  onProfileUpdate: (updated: LabProfile) => void;
}

export const ReportDesigner: React.FC<ReportDesignerProps> = ({
  profile,
  onProfileUpdate
}) => {
  const [designerState, setDesignerState] = useState<LabProfile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleToggle = (key: keyof LabProfile) => {
    setDesignerState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updated = await api.updateProfile(designerState);
      onProfileUpdate(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      alert('Report Designer template settings saved successfully.');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-600" />
            Report Designer & Print Layout Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Customize typography, borders, logos, signatures, letterhead modes, and paper standards (A4 & A5).
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
        >
          {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Template Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 Cols): Customization Controls */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Section 1: Template Style & Theme */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              1. Layout Theme & Preset
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Report Style Preset
                </label>
                <select
                  value={designerState.reportTemplate}
                  onChange={(e) => setDesignerState({ ...designerState, reportTemplate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="modern-clinical">Modern Clinical (Teal & Slate Accent)</option>
                  <option value="classic-hospital">Classic Hospital (Navy & Gray Traditional)</option>
                  <option value="compact">Compact Diagnostic (High Density Rows)</option>
                  <option value="minimal">Minimalist Clear (Monochrome Clean)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Header Display Mode
                </label>
                <select
                  value={designerState.headerStyle}
                  onChange={(e) => setDesignerState({ ...designerState, headerStyle: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                >
                  <option value="standard">Standard Full Header (Logo, Name & Address)</option>
                  <option value="minimal">Minimal Header (Slim line)</option>
                  <option value="letterhead-blank">Pre-Printed Letterhead Paper (Blank Header Area)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Select "Pre-Printed Letterhead" if your clinic feeds pre-printed paper into the printer.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Default Page Size
                  </label>
                  <select
                    value={designerState.pageSize}
                    onChange={(e) => setDesignerState({ ...designerState, pageSize: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value="A4">A4 (Standard Sheet)</option>
                    <option value="A5">A5 (Prescription Half Sheet)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Font Scaling
                  </label>
                  <select
                    value={designerState.fontSize}
                    onChange={(e) => setDesignerState({ ...designerState, fontSize: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  >
                    <option value="small">Small (Dense test reports)</option>
                    <option value="medium">Medium (Standard recommended)</option>
                    <option value="large">Large (High legibility)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Visible Elements Toggles */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              2. Report Elements Visibility
            </h3>

            <div className="space-y-2.5 text-xs">
              {[
                { key: 'showLogo', label: 'Show Laboratory Logo' },
                { key: 'showSignature', label: 'Show Doctor / Pathologist Signature' },
                { key: 'showStamp', label: 'Show Official Laboratory Seal Stamp' },
                { key: 'showQrCode', label: 'Show Digital Verification QR Code' },
                { key: 'showReferenceRanges', label: 'Show Reference Ranges Column' },
                { key: 'showUnits', label: 'Show Measurement Units' },
                { key: 'showFlags', label: 'Show High / Low Visual Flag Badges' },
                { key: 'showMethodology', label: 'Show Testing Method (e.g. CMIA, ELISA)' },
              ].map(({ key, label }) => {
                const isChecked = Boolean(designerState[key as keyof LabProfile]);
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <span className="font-medium text-slate-800 dark:text-slate-200">{label}</span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggle(key as keyof LabProfile)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Custom Disclaimers & Footer Notes */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              3. Report Footer & Legal Notice
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Footer Notice (Printed at bottom)
                </label>
                <textarea
                  rows={2}
                  value={designerState.footerNotice}
                  onChange={(e) => setDesignerState({ ...designerState, footerNotice: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specimen Retention Disclaimer
                </label>
                <input
                  type="text"
                  value={designerState.disclaimer}
                  onChange={(e) => setDesignerState({ ...designerState, disclaimer: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (7 Cols): Live Dynamic Document Preview */}
        <div className="lg:col-span-7">
          <div className="sticky top-20 bg-slate-100 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center">
            
            <div className="w-full flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-600" />
                Live Document Render Preview ({designerState.pageSize})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Updates dynamically
              </span>
            </div>

            {/* Simulated Sheet (Scaled for preview) */}
            <div
              className={`bg-white text-slate-900 shadow-xl rounded-sm p-6 w-full max-w-[540px] text-[10px] leading-tight select-none border border-slate-200 ${
                designerState.fontSize === 'small' ? 'text-[9px]' : designerState.fontSize === 'large' ? 'text-[11px]' : 'text-[10px]'
              }`}
              style={{ minHeight: '620px' }}
            >
              
              {/* Header Preview */}
              {designerState.headerStyle !== 'letterhead-blank' ? (
                <div className="border-b-2 border-emerald-600 pb-3 mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {designerState.showLogo && (
                      <div className="w-10 h-10 flex-shrink-0">
                        <img src={designerState.logoUrl || defaultLabLogoSvg} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="font-black text-sm text-slate-900 tracking-tight leading-none">
                        {designerState.labName || 'RAZA CLINICAL LABORATORY'}
                      </div>
                      <div className="text-[8px] font-bold text-emerald-700 tracking-wider uppercase mt-0.5">
                        {designerState.tagline}
                      </div>
                      <div className="text-[8px] text-slate-500 mt-0.5">
                        {designerState.address} • Ph: {designerState.phone}
                      </div>
                    </div>
                  </div>

                  <div className="text-right border-l border-slate-200 pl-2">
                    <div className="font-bold text-[9px] text-slate-900">{designerState.doctorName}</div>
                    <div className="text-[8px] text-emerald-700 font-semibold">{designerState.doctorQualification}</div>
                    <div className="text-[7.5px] text-slate-400">{designerState.doctorRegistration}</div>
                  </div>
                </div>
              ) : (
                <div className="h-16 border-b border-dashed border-slate-300 mb-3 flex items-center justify-center text-[9px] text-slate-400 italic">
                  [ Blank Area for Pre-Printed Stationery ]
                </div>
              )}

              {/* Patient Bar Mock */}
              <div className="bg-slate-50 rounded border border-slate-200 p-2 mb-3 grid grid-cols-3 gap-1.5 text-[8.5px]">
                <div><span className="text-slate-400">Patient:</span> <b className="text-slate-800">MUHAMMAD USMAN</b></div>
                <div><span className="text-slate-400">MR #:</span> <span className="font-mono">PAT-2024-00101</span></div>
                <div><span className="text-slate-400">Report #:</span> <b className="text-emerald-800 font-mono">RCL-24-101</b></div>
                <div><span className="text-slate-400">Age/Sex:</span> 36 Y / MALE</div>
                <div><span className="text-slate-400">Sample:</span> 10-Nov-2024</div>
                <div><span className="text-slate-400">Ref By:</span> Dr. Farooq Tariq</div>
              </div>

              {/* Mock Results Table */}
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-0.5 flex justify-between font-bold text-[9px] text-emerald-800 uppercase">
                  <span>Complete Blood Count (CBC)</span>
                  {designerState.showMethodology && <span className="text-[7.5px] text-slate-400 italic">5-Part Automated</span>}
                </div>

                <table className="w-full text-left text-[9px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[7.5px]">
                      <th className="py-1">Investigation</th>
                      <th className="py-1 text-center">Result</th>
                      {designerState.showUnits && <th className="py-1 text-center">Unit</th>}
                      {designerState.showReferenceRanges && <th className="py-1 text-right">Reference Range</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-1 font-medium">Hemoglobin (Hb)</td>
                      <td className="py-1 text-center font-bold">
                        14.8 {designerState.showFlags && <span className="text-[7px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black ml-1">NORMAL</span>}
                      </td>
                      {designerState.showUnits && <td className="py-1 text-center text-slate-400">g/dL</td>}
                      {designerState.showReferenceRanges && <td className="py-1 text-right text-slate-500">13.0 - 17.5</td>}
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Total Leukocyte Count</td>
                      <td className="py-1 text-center font-bold">
                        12,400 {designerState.showFlags && <span className="text-[7px] bg-red-100 text-red-800 px-1 py-0.2 rounded font-black ml-1">HIGH ▲</span>}
                      </td>
                      {designerState.showUnits && <td className="py-1 text-center text-slate-400">/cu.mm</td>}
                      {designerState.showReferenceRanges && <td className="py-1 text-right text-slate-500">4,000 - 11,000</td>}
                    </tr>
                    <tr>
                      <td className="py-1 font-medium">Platelet Count</td>
                      <td className="py-1 text-center font-bold">
                        240,000 {designerState.showFlags && <span className="text-[7px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-black ml-1">NORMAL</span>}
                      </td>
                      {designerState.showUnits && <td className="py-1 text-center text-slate-400">/cu.mm</td>}
                      {designerState.showReferenceRanges && <td className="py-1 text-right text-slate-500">150,000 - 450,000</td>}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mock Remarks */}
              <div className="mt-4 p-2 bg-slate-50 border border-slate-200 rounded text-[8px] text-slate-600">
                <b>Remarks:</b> Mild leukocytosis observed with neutrophil predominance.
              </div>

              {/* Mock Footer */}
              <div className="mt-8 pt-3 border-t border-slate-300 flex items-end justify-between">
                {designerState.showQrCode && (
                  <div className="flex items-center gap-1.5 text-[7px] text-slate-400">
                    <QrCode className="w-8 h-8 text-slate-600" />
                    <div>
                      <div className="font-bold text-slate-700">DIGITALLY VERIFIED</div>
                      <div>RCL-24-101</div>
                    </div>
                  </div>
                )}

                {designerState.showStamp && (
                  <div className="w-14 h-14">
                    <img src={designerState.stampUrl || defaultLabStampSvg} alt="Stamp" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="text-right">
                  {designerState.showSignature && (
                    <div className="w-24 h-8 ml-auto flex items-end justify-end">
                      <img src={designerState.signatureUrl || defaultDoctorSignatureSvg} alt="Signature" className="max-h-8 object-contain" />
                    </div>
                  )}
                  <div className="border-t border-slate-400 pt-0.5 text-[8px] font-bold text-slate-800">
                    {designerState.doctorName}
                  </div>
                  <div className="text-[7px] text-emerald-700 font-semibold">{designerState.doctorQualification}</div>
                </div>
              </div>

              <div className="mt-2 text-[7px] text-slate-400 text-center border-t border-slate-100 pt-1">
                {designerState.footerNotice}
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
