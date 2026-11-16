import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, 
  FlaskConical, 
  Calculator, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Search, 
  Sparkles, 
  Eye, 
  Save, 
  FileCheck, 
  FileText,
  Plus,
  RefreshCw
} from 'lucide-react';
import { 
  Patient, 
  TestItem, 
  Report, 
  LabProfile, 
  ParameterResult, 
  ResultFlag 
} from '../types';
import { api } from '../utils/api';
import { 
  calculateAgeFromDob, 
  getMatchingReferenceRange, 
  evaluateResultFlag, 
  runFormulaCalculation, 
  formatAge 
} from '../utils/calculations';

interface NewReportProps {
  profile: LabProfile;
  tests: TestItem[];
  preselectedPatient?: Patient | null;
  editReportId?: string | null;
  onNavigate: (page: string) => void;
  onPreviewReport: (report: Report) => void;
}

export const NewReport: React.FC<NewReportProps> = ({
  profile,
  tests,
  preselectedPatient,
  editReportId,
  onNavigate,
  onPreviewReport
}) => {
  // Navigation wizard steps: 1: Patient Info, 2: Test Selection, 3: Result Entry & Calculations
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [reissueReason, setReissueReason] = useState<string>('');

  // --- Step 1: Patient Details Form State ---
  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('new');
  const [existingPatients, setExistingPatients] = useState<Patient[]>([]);
  const [patientSearch, setPatientSearch] = useState<string>('');
  
  const [patientId, setPatientId] = useState<string>(`PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [patientName, setPatientName] = useState<string>('');
  const [guardianName, setGuardianName] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dob, setDob] = useState<string>('');
  const [ageYears, setAgeYears] = useState<number>(30);
  const [ageMonths, setAgeMonths] = useState<number>(0);
  const [ageDays, setAgeDays] = useState<number>(0);
  const [phone, setPhone] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [referringDoctor, setReferringDoctor] = useState<string>('Self / Direct');
  
  const [sampleDate, setSampleDate] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  });
  const [reportDate, setReportDate] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  });
  const [sampleId, setSampleId] = useState<string>(`SMP-${Math.floor(1000 + Math.random() * 9000)}`);
  const [reportNumber, setReportNumber] = useState<string>(`RCL-${new Date().getFullYear().toString().slice(-2)}-${Math.floor(100 + Math.random() * 900)}`);

  // --- Step 2: Test Selection State ---
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>(['cbc']);
  const [testSearch, setTestSearch] = useState<string>('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');

  // --- Step 3: Result Values State ---
  // testResults: { [testId]: { [paramId]: { value, flag, comments } } }
  const [testResults, setTestResults] = useState<Record<string, Record<string, ParameterResult>>>({});
  const [calculationWarnings, setCalculationWarnings] = useState<Record<string, string>>({});
  const [clinicalNotes, setClinicalNotes] = useState<string>('Patient results reviewed and validated against clinical reference parameters.');
  const [reportStatus, setReportStatus] = useState<'draft' | 'verified' | 'finalized'>('finalized');

  // Load existing patients for selection
  useEffect(() => {
    api.getPatients().then(data => setExistingPatients(data)).catch(console.error);
  }, []);

  // Pre-load if preselectedPatient prop is passed
  useEffect(() => {
    if (preselectedPatient) {
      setPatientMode('new');
      setPatientId(preselectedPatient.id);
      setPatientName(preselectedPatient.name);
      setGuardianName(preselectedPatient.guardianName || '');
      setGender(preselectedPatient.gender);
      setDob(preselectedPatient.dob || '');
      setAgeYears(preselectedPatient.ageYears);
      setAgeMonths(preselectedPatient.ageMonths || 0);
      setAgeDays(preselectedPatient.ageDays || 0);
      setPhone(preselectedPatient.phone || '');
      setAddress(preselectedPatient.address || '');
      setReferringDoctor(preselectedPatient.referringDoctor || 'Self / Direct');
    }
  }, [preselectedPatient]);

  // Load report for editing if editReportId is passed
  useEffect(() => {
    if (editReportId) {
      api.getReport(editReportId).then(rep => {
        if (!rep) return;
        setEditingReport(rep);
        setPatientId(rep.patientId);
        setPatientName(rep.patientName);
        setGuardianName(rep.guardianName || '');
        setGender(rep.gender);
        setAgeYears(rep.ageYears);
        setAgeMonths(rep.ageMonths);
        setAgeDays(rep.ageDays);
        setPhone(rep.phone || '');
        setAddress(rep.address || '');
        setReferringDoctor(rep.referringDoctor || 'Self / Direct');
        setSampleDate(rep.sampleDate);
        setReportDate(rep.reportDate);
        setSampleId(rep.sampleId || '');
        setReportNumber(rep.reportNumber);
        setSelectedTestIds(rep.testIds || []);
        setTestResults(rep.testResults || {});
        setClinicalNotes(rep.clinicalNotes || '');
        setReportStatus(rep.status);
        setCurrentStep(3); // Jump straight to results for fast review
      }).catch(console.error);
    }
  }, [editReportId]);

  // Handle DOB change -> automatically compute age
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDob(val);
    if (val) {
      const calculated = calculateAgeFromDob(val);
      setAgeYears(calculated.years);
      setAgeMonths(calculated.months);
      setAgeDays(calculated.days);
    }
  };

  // Select an existing patient from search
  const handleSelectExistingPatient = (p: Patient) => {
    setPatientId(p.id);
    setPatientName(p.name);
    setGuardianName(p.guardianName || '');
    setGender(p.gender);
    setDob(p.dob || '');
    setAgeYears(p.ageYears);
    setAgeMonths(p.ageMonths || 0);
    setAgeDays(p.ageDays || 0);
    setPhone(p.phone || '');
    setAddress(p.address || '');
    setReferringDoctor(p.referringDoctor || 'Self / Direct');
    setPatientMode('new'); // Switch to view form populated
  };

  // Initialize result parameters whenever test selection changes
  // Default to empty value so ONLY tests/parameters with actual submitted results will be printed in the final report!
  useEffect(() => {
    setTestResults(prevResults => {
      const updated = { ...prevResults };
      selectedTestIds.forEach(tId => {
        if (!updated[tId]) {
          updated[tId] = {};
        }
        const testDef = tests.find(t => t.id === tId);
        if (testDef) {
          testDef.parameters.forEach(param => {
            if (!updated[tId][param.id]) {
              // Leave value empty by default unless editing an existing report with saved results
              updated[tId][param.id] = {
                value: '',
                flag: 'normal',
                comments: ''
              };
            }
          });
        }
      });
      return updated;
    });
  }, [selectedTestIds, tests, gender, ageYears]);

  // Flattened map of all currently entered values across all tests (for cross-parameter calculations)
  const allCurrentValues = useMemo(() => {
    const map: Record<string, string | number | undefined> = {};
    Object.values(testResults).forEach(testObj => {
      Object.entries(testObj).forEach(([pId, res]) => {
        map[pId] = res?.value;
      });
    });
    return map;
  }, [testResults]);

  // Handle parameter value change + auto run formula calculations
  const handleParamValueChange = (testId: string, paramId: string, newValue: string | number) => {
    setTestResults(prev => {
      const currentTest = { ...(prev[testId] || {}) };
      const testDef = tests.find(t => t.id === testId);
      const paramDef = testDef?.parameters.find(p => p.id === paramId);

      const matchedRange = getMatchingReferenceRange(paramDef?.ranges, gender, ageYears);
      const flag = evaluateResultFlag(newValue, matchedRange);

      currentTest[paramId] = {
        ...(currentTest[paramId] || {}),
        value: newValue,
        flag
      };

      // Now check if any other parameters in this test (or other tests) are auto-calculated from this!
      const newAllValues = { ...allCurrentValues, [paramId]: newValue };
      const newWarnings: Record<string, string> = { ...calculationWarnings };

      // Look for any calculated parameters in selected tests
      selectedTestIds.forEach(tId => {
        const tDef = tests.find(t => t.id === tId);
        if (!tDef) return;

        tDef.parameters.forEach(p => {
          if (p.isCalculated && p.calculationFormula) {
            const calc = runFormulaCalculation(p.calculationFormula, newAllValues);
            
            if (calc.warning) {
              newWarnings[`${tId}-${p.id}`] = calc.warning;
            } else {
              delete newWarnings[`${tId}-${p.id}`];
            }

            if (calc.value !== undefined) {
              const calcRange = getMatchingReferenceRange(p.ranges, gender, ageYears);
              const calcFlag = evaluateResultFlag(calc.value, calcRange);

              if (tId === testId) {
                currentTest[p.id] = {
                  ...(currentTest[p.id] || {}),
                  value: calc.value,
                  flag: calcFlag
                };
              } else {
                // If in another test section
                if (prev[tId]) {
                  prev[tId][p.id] = {
                    ...(prev[tId][p.id] || {}),
                    value: calc.value,
                    flag: calcFlag
                  };
                }
              }
              newAllValues[p.id] = calc.value;
            }
          }
        });
      });

      setCalculationWarnings(newWarnings);

      return {
        ...prev,
        [testId]: currentTest
      };
    });
  };

  // Toggle test selection
  const handleToggleTest = (testId: string) => {
    if (selectedTestIds.includes(testId)) {
      if (selectedTestIds.length === 1) {
        alert('At least one test must be selected for the report.');
        return;
      }
      setSelectedTestIds(selectedTestIds.filter(id => id !== testId));
    } else {
      setSelectedTestIds([...selectedTestIds, testId]);
    }
  };

  // Popular clinical panels presets
  const applyPanelPreset = (testIds: string[]) => {
    setSelectedTestIds(testIds);
  };

  // Quick fill normal template values for a specific test
  const handleFillNormalTemplate = (testId: string) => {
    const testDef = tests.find(t => t.id === testId);
    if (!testDef) return;

    setTestResults(prev => {
      const currentTest = { ...(prev[testId] || {}) };
      testDef.parameters.forEach(p => {
        let val = p.defaultValue !== undefined ? p.defaultValue : '';
        // If no explicit default, use the middle of the normal range or "Negative" / "Normal"
        if (val === '' && p.ranges && p.ranges.length > 0) {
          const r = p.ranges[0];
          if (r.low !== undefined && r.high !== undefined) {
            val = Number(((r.low + r.high) / 2).toFixed(1));
          } else if (p.options && p.options.length > 0) {
            val = p.options[0];
          }
        }
        const matchedRange = getMatchingReferenceRange(p.ranges, gender, ageYears);
        const flag = evaluateResultFlag(val, matchedRange);
        currentTest[p.id] = { value: val, flag, comments: '' };
      });
      return { ...prev, [testId]: currentTest };
    });
  };

  // Clear all parameter values for a specific test
  const handleClearTestValues = (testId: string) => {
    const testDef = tests.find(t => t.id === testId);
    if (!testDef) return;

    setTestResults(prev => {
      const currentTest = { ...(prev[testId] || {}) };
      testDef.parameters.forEach(p => {
        currentTest[p.id] = { value: '', flag: 'normal', comments: '' };
      });
      return { ...prev, [testId]: currentTest };
    });
  };

  // Save Report Handler
  const handleSaveReport = async (targetStatus?: 'draft' | 'verified' | 'finalized') => {
    if (!patientName.trim()) {
      alert('Please enter patient name.');
      setCurrentStep(1);
      return;
    }
    if (selectedTestIds.length === 0) {
      alert('Please select at least one test.');
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);
    try {
      const statusToSave = targetStatus || reportStatus;
      
      const payload: Partial<Report> & { isReissueApproved?: boolean; reissueReason?: string } = {
        id: editingReport ? editingReport.id : undefined,
        reportNumber,
        status: statusToSave,
        patientId,
        patientName,
        guardianName,
        gender,
        ageYears,
        ageMonths,
        ageDays,
        phone,
        address,
        referringDoctor,
        sampleDate,
        reportDate,
        sampleId,
        testIds: selectedTestIds,
        testResults,
        clinicalNotes,
        verifiedBy: `${profile.doctorName}, ${profile.doctorQualification}`,
        verifiedAt: new Date().toISOString()
      };

      // If reissuing an already finalized report
      if (editingReport && editingReport.status === 'finalized') {
        payload.isReissueApproved = true;
        payload.reissueReason = reissueReason || 'Clinical test result revised with doctor authorization';
      }

      // Also ensure patient record is saved/updated in database
      await api.savePatient({
        id: patientId,
        name: patientName,
        guardianName,
        gender,
        dob,
        ageYears,
        ageMonths,
        ageDays,
        phone,
        address,
        referringDoctor
      });

      const savedReport = await api.saveReport(payload, profile.doctorName);
      alert(`Report ${savedReport.reportNumber} successfully ${statusToSave === 'finalized' ? 'finalized and signed' : 'saved'}!`);
      
      // Open preview directly
      onPreviewReport(savedReport);
    } catch (err: any) {
      alert(`Error saving report: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Construct temporary report object for live preview
  const currentPreviewReport: Report = {
    id: editingReport ? editingReport.id : 'PREVIEW-TEMP',
    reportNumber,
    version: editingReport ? editingReport.version + (editingReport.status === 'finalized' ? 1 : 0) : 1,
    status: reportStatus,
    patientId,
    patientName: patientName || 'Patient Name',
    guardianName,
    gender,
    ageYears,
    ageMonths,
    ageDays,
    phone,
    address,
    referringDoctor,
    sampleDate,
    reportDate,
    sampleId,
    testIds: selectedTestIds,
    testResults,
    clinicalNotes,
    verifiedBy: `${profile.doctorName}, ${profile.doctorQualification}`,
    verifiedAt: new Date().toISOString(),
    revisions: editingReport?.revisions || []
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Wizard Header & Steps Progress Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-600" />
              {editingReport ? `Edit / Reissue Report (${editingReport.reportNumber})` : 'New Pathology Laboratory Report'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Complete patient registration, select diagnostic panels, enter observed values, and auto-verify calculations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPreviewReport(currentPreviewReport)}
              className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Live Preview</span>
            </button>
            <button
              onClick={() => handleSaveReport('finalized')}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Finalize & Sign Report'}</span>
            </button>
          </div>
        </div>

        {/* Reissue Warning if Editing Finalized Report */}
        {editingReport && editingReport.status === 'finalized' && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Authorized Reissue Mode (Version {editingReport.version} → Version {editingReport.version + 1})</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300">
              As per clinical lab compliance standards, finalized reports cannot be silently altered. A new revision version will be logged in the audit trail.
            </p>
            <input
              type="text"
              value={reissueReason}
              onChange={(e) => setReissueReason(e.target.value)}
              placeholder="Reason for report reissue / correction (e.g. Specimen re-run verified, doctor requested re-check)..."
              className="w-full px-3 py-1.5 rounded-lg border border-amber-400 bg-white dark:bg-slate-900 text-xs font-medium"
            />
          </div>
        )}

        {/* 3 Steps Navigation Pill Bar */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
              currentStep === 1
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              currentStep === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              1
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Patient Details</div>
              <div className="text-[10px] text-slate-400">Demographics & Dates</div>
            </div>
          </button>

          <button
            onClick={() => setCurrentStep(2)}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
              currentStep === 2
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              2
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Test Selection</div>
              <div className="text-[10px] text-slate-400">{selectedTestIds.length} test(s) chosen</div>
            </div>
          </button>

          <button
            onClick={() => setCurrentStep(3)}
            className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
              currentStep === 3
                ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              currentStep === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              3
            </div>
            <div>
              <div className="text-xs font-bold leading-tight">Results & Auto-Calc</div>
              <div className="text-[10px] text-slate-400">Values, Ranges, Flags</div>
            </div>
          </button>

        </div>
      </div>

      {/* ========================================================= */}
      {/* STEP 1: PATIENT DEMOGRAPHICS & SAMPLE INFORMATION */}
      {/* ========================================================= */}
      {currentStep === 1 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                Step 1: Patient Information & Registration
              </h2>
              <p className="text-xs text-slate-500">
                Register a new diagnostic patient or select from existing records.
              </p>
            </div>

            {/* Mode switch */}
            <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPatientMode('new')}
                className={`px-3 py-1.5 transition-colors ${patientMode === 'new' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                + Register New Patient
              </button>
              <button
                type="button"
                onClick={() => setPatientMode('existing')}
                className={`px-3 py-1.5 transition-colors ${patientMode === 'existing' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                Search Existing Records
              </button>
            </div>
          </div>

          {/* Existing Patient Search Panel */}
          {patientMode === 'existing' && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Search Registered Diagnostic Patients:
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Type name, phone, or MR/Patient ID (e.g. PAT-2024-00101)..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="max-h-56 overflow-y-auto space-y-1.5">
                {existingPatients
                  .filter(p => !patientSearch || p.name.toLowerCase().includes(patientSearch.toLowerCase()) || p.id.toLowerCase().includes(patientSearch.toLowerCase()) || (p.phone && p.phone.includes(patientSearch)))
                  .map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectExistingPatient(p)}
                      className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-900 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                        <span className="text-slate-500 ml-2">({p.gender.toUpperCase()} • {formatAge(p.ageYears, p.ageMonths, p.ageDays)})</span>
                        <span className="text-slate-400 font-mono ml-2 text-[10px]">{p.id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                        Select Patient
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Patient Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            
            {/* Patient ID */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Patient ID / MR # (Auto-Generated)
              </label>
              <input
                type="text"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Patient Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Patient Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Muhammad Usman"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Father / Husband Name */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Father / Husband Name (Optional)
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Abdul Ghaffar"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="male">Male (M)</option>
                <option value="female">Female (F)</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth (Optional with Auto Age Calculation) */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>Date of Birth (Optional)</span>
                <span className="text-[10px] text-emerald-600 font-normal">Auto-calculates age</span>
              </label>
              <input
                type="date"
                value={dob}
                onChange={handleDobChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Age: Years, Months, Days Manual Entry */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age: Years / Months / Days
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <div>
                  <input
                    type="number"
                    min="0"
                    max="130"
                    value={ageYears}
                    onChange={(e) => setAgeYears(parseInt(e.target.value) || 0)}
                    placeholder="Y"
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold"
                  />
                  <span className="text-[9px] text-slate-400 block text-center mt-0.5">Years</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={ageMonths}
                    onChange={(e) => setAgeMonths(parseInt(e.target.value) || 0)}
                    placeholder="M"
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold"
                  />
                  <span className="text-[9px] text-slate-400 block text-center mt-0.5">Months</span>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={ageDays}
                    onChange={(e) => setAgeDays(parseInt(e.target.value) || 0)}
                    placeholder="D"
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold"
                  />
                  <span className="text-[9px] text-slate-400 block text-center mt-0.5">Days</span>
                </div>
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 03001234567"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Residential Address / City
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Main Bazar Dera Bakha"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Referring Doctor */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Referring Doctor / Clinic
              </label>
              <input
                type="text"
                value={referringDoctor}
                onChange={(e) => setReferringDoctor(e.target.value)}
                placeholder="e.g. Dr. Farooq Tariq (Physician) or Self"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Report Number */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Report Number (Auto Unique)
              </label>
              <input
                type="text"
                value={reportNumber}
                onChange={(e) => setReportNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-emerald-700 dark:text-emerald-400"
              />
            </div>

            {/* Sample Collection Date */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sample Collection Date & Time
              </label>
              <input
                type="text"
                value={sampleDate}
                onChange={(e) => setSampleDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Report Date */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reporting Date & Time
              </label>
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
              />
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (!patientName.trim()) {
                  alert('Please enter patient name.');
                  return;
                }
                setCurrentStep(2);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
            >
              <span>Next: Select Tests</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: TEST SELECTION LIBRARY */}
      {/* ========================================================= */}
      {currentStep === 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-600" />
                Step 2: Select Pathology Tests & Panels
              </h2>
              <p className="text-xs text-slate-500">
                Choose single tests or combine multiple diagnostic examinations into one comprehensive report.
              </p>
            </div>

            {/* Selected Count & Price Counter */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                {selectedTestIds.length} Test(s) Selected
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Quick Clinical Panel Presets:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyPanelPreset(['cbc', 'esr'])}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Routine CBC Panel
              </button>
              <button
                type="button"
                onClick={() => applyPanelPreset(['cbc', 'lft'])}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                CBC + LFT Panel
              </button>
              <button
                type="button"
                onClick={() => applyPanelPreset(['lft', 'rft', 'lipid-profile'])}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Biochemical Profile (LFT + RFT + Lipids)
              </button>
              <button
                type="button"
                onClick={() => applyPanelPreset(['cbc', 'serology-panel'])}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Fever / Viral Screen (CBC + Serology)
              </button>
              <button
                type="button"
                onClick={() => applyPanelPreset(['cbc', 'blood-glucose', 'urine-re'])}
                className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                Executive General Health (CBC + Sugar + Urine R/E)
              </button>
            </div>
          </div>

          {/* Test Search & Category Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                placeholder="Search test by name (e.g. CBC, Bilirubin, Urine, Thyroid, PT)..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <select
              value={selectedCategoryTab}
              onChange={(e) => setSelectedCategoryTab(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Pathology Categories</option>
              <option value="hematology">Hematology</option>
              <option value="biochemistry">Biochemistry</option>
              <option value="lft">Liver Function Tests (LFT)</option>
              <option value="rft">Renal Function Tests (RFT)</option>
              <option value="serology">Serology & Immunology</option>
              <option value="hormones">Endocrinology & Hormones</option>
              <option value="clinical-pathology">Clinical Pathology</option>
              <option value="coagulation">Coagulation Studies</option>
            </select>
          </div>

          {/* Tests Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tests
              .filter(t => {
                const matchesCat = selectedCategoryTab === 'all' || t.categoryId === selectedCategoryTab;
                const matchesSearch = !testSearch || t.name.toLowerCase().includes(testSearch.toLowerCase()) || t.code.toLowerCase().includes(testSearch.toLowerCase());
                return matchesCat && matchesSearch;
              })
              .map(test => {
                const isSelected = selectedTestIds.includes(test.id);
                return (
                  <div
                    key={test.id}
                    onClick={() => handleToggleTest(test.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 select-none ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent div
                      className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {test.name}
                        </h4>
                        <span className="font-mono text-[10px] text-slate-400">
                          {test.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Specimen: {test.sampleType}
                      </p>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                        <span className="text-slate-400">
                          {test.parameters.length} parameter(s)
                        </span>
                        {test.price ? (
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                            Rs. {test.price}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patient Info</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedTestIds.length === 0) {
                  alert('Please select at least one test.');
                  return;
                }
                setCurrentStep(3);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center gap-2"
            >
              <span>Next: Enter Results & Calculations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: DYNAMIC RESULT ENTRY & AUTOMATIC CALCULATIONS */}
      {/* ========================================================= */}
      {currentStep === 3 && (
        <div className="space-y-6">
          
          {/* Top Sticky Patient & Calculations Summary Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                {patientName ? patientName[0].toUpperCase() : 'P'}
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  {patientName}
                </div>
                <div className="text-slate-500">
                  {gender.toUpperCase()} • {formatAge(ageYears, ageMonths, ageDays)} • MR #: <span className="font-mono">{patientId}</span> • Ref: {referringDoctor}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onPreviewReport(currentPreviewReport)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Preview Report</span>
              </button>
              <button
                onClick={() => handleSaveReport('finalized')}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Finalize & Sign</span>
              </button>
            </div>
          </div>

          {/* Test Sections Result Inputs */}
          {selectedTestIds.map((testId) => {
            const testDef = tests.find(t => t.id === testId);
            if (!testDef) return null;

            // Group parameters by section if defined
            const sections: { name: string; params: typeof testDef.parameters }[] = [];
            testDef.parameters.forEach(p => {
              const secName = p.section || 'General Parameters';
              let sec = sections.find(s => s.name === secName);
              if (!sec) {
                sec = { name: secName, params: [] };
                sections.push(sec);
              }
              sec.params.push(p);
            });

            // Count entered parameters for this test
            const enteredCount = testDef.parameters.filter(p => {
              const v = testResults[testId]?.[p.id]?.value;
              return v !== undefined && v !== null && String(v).trim() !== '';
            }).length;

            return (
              <div
                key={testId}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs"
              >
                {/* Test Section Header */}
                <div className="bg-slate-50 dark:bg-slate-800/80 px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                      {testDef.name}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {testDef.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      enteredCount > 0
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {enteredCount} of {testDef.parameters.length} results entered
                    </span>
                    {enteredCount === 0 && (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                        (Excluded from final report if left empty)
                      </span>
                    )}
                  </div>

                  {/* Quick Fill / Clear Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillNormalTemplate(testId)}
                      className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 transition-colors"
                      title="Populate standard normal diagnostic template values for all parameters in this test"
                    >
                      <span>⚡ Fill Normal Template</span>
                    </button>
                    {enteredCount > 0 && (
                      <button
                        type="button"
                        onClick={() => handleClearTestValues(testId)}
                        className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                        title="Clear all entered values for this test"
                      >
                        Clear
                      </button>
                    )}
                    <span className="text-xs text-slate-400 font-medium italic hidden md:inline ml-1">
                      Sample: {testDef.sampleType}
                    </span>
                  </div>
                </div>

                {/* Desktop View: Table of Parameter Result Inputs (Hidden on Mobile) */}
                <div className="hidden md:block p-5 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                        <th className="py-2 px-3 w-[34%]">Parameter / Investigation</th>
                        <th className="py-2 px-3 w-[26%] text-center">Observed Result Value</th>
                        <th className="py-2 px-3 w-[12%] text-center">Unit</th>
                        <th className="py-2 px-3 w-[16%] text-right">Reference Range</th>
                        <th className="py-2 px-3 w-[12%] text-center">Flag Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {sections.map(section => (
                        <React.Fragment key={section.name}>
                          {section.name !== 'General Parameters' && (
                            <tr className="bg-slate-50/70 dark:bg-slate-800/40">
                              <td colSpan={5} className="py-1.5 px-3 font-bold text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                                {section.name}
                              </td>
                            </tr>
                          )}

                          {section.params.map(param => {
                            const resObj = testResults[testId]?.[param.id];
                            const currentValue = resObj?.value !== undefined ? resObj.value : '';
                            const currentFlag = resObj?.flag || 'normal';
                            const warningMsg = calculationWarnings[`${testId}-${param.id}`];

                            // Dynamic reference range based on patient gender and age
                            const matchedRange = getMatchingReferenceRange(param.ranges, gender, ageYears);
                            const rangeText = matchedRange?.text || '—';

                            return (
                              <tr key={param.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                
                                {/* Parameter Name */}
                                <td className="py-2.5 px-3">
                                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                    <span>{param.name}</span>
                                    {param.isCalculated && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                        Auto-Calc
                                      </span>
                                    )}
                                  </div>
                                  {warningMsg && (
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1 mt-0.5">
                                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                      <span>{warningMsg}</span>
                                    </div>
                                  )}
                                </td>

                                {/* Result Input */}
                                <td className="py-2.5 px-3">
                                  {param.type === 'select' ? (
                                    <select
                                      value={currentValue}
                                      onChange={(e) => handleParamValueChange(testId, param.id, e.target.value)}
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500"
                                    >
                                      <option value="">-- Select --</option>
                                      {param.options?.map(opt => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : param.type === 'text' ? (
                                    <input
                                      type="text"
                                      value={currentValue}
                                      onChange={(e) => handleParamValueChange(testId, param.id, e.target.value)}
                                      placeholder="Observation / morphology..."
                                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                                    />
                                  ) : (
                                    <div className="relative">
                                      <input
                                        type="number"
                                        step="any"
                                        value={currentValue}
                                        onChange={(e) => handleParamValueChange(testId, param.id, e.target.value)}
                                        placeholder="0.0"
                                        className={`w-full px-2.5 py-1.5 text-center rounded-lg border font-mono font-bold text-xs transition-colors focus:outline-none focus:ring-2 ${
                                          currentFlag === 'high'
                                            ? 'border-red-400 bg-red-50/50 text-red-900 focus:ring-red-400'
                                            : currentFlag === 'low'
                                            ? 'border-blue-400 bg-blue-50/50 text-blue-900 focus:ring-blue-400'
                                            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-emerald-500'
                                        }`}
                                      />
                                    </div>
                                  )}
                                </td>

                                {/* Unit */}
                                <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                                  {param.unit || '—'}
                                </td>

                                {/* Reference Range */}
                                <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-400 font-medium text-[11px]">
                                  {rangeText}
                                </td>

                                {/* Flag Badge */}
                                <td className="py-2.5 px-3 text-center">
                                  {currentFlag === 'high' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800">
                                      HIGH ▲
                                    </span>
                                  )}
                                  {currentFlag === 'low' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                                      LOW ▼
                                    </span>
                                  )}
                                  {currentFlag === 'abnormal' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800">
                                      ABNORMAL
                                    </span>
                                  )}
                                  {currentFlag === 'normal' && (
                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                      NORMAL
                                    </span>
                                  )}
                                </td>

                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Responsive Parameter Cards (NO TABLES - Zero Horizontal Scroll!) */}
                <div className="block md:hidden p-3 space-y-3">
                  {sections.map(section => (
                    <div key={section.name} className="space-y-2.5">
                      {section.name !== 'General Parameters' && (
                        <div className="px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                          • {section.name}
                        </div>
                      )}

                      {section.params.map(param => {
                        const resObj = testResults[testId]?.[param.id];
                        const currentValue = resObj?.value !== undefined ? resObj.value : '';
                        const currentFlag = resObj?.flag || 'normal';
                        const warningMsg = calculationWarnings[`${testId}-${param.id}`];

                        // Dynamic reference range based on patient gender and age
                        const matchedRange = getMatchingReferenceRange(param.ranges, gender, ageYears);
                        const rangeText = matchedRange?.text || '—';

                        return (
                          <div
                            key={param.id}
                            className={`p-3 rounded-xl border transition-all ${
                              currentFlag === 'high'
                                ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20'
                                : currentFlag === 'low'
                                ? 'border-blue-300 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20'
                                : currentFlag === 'abnormal'
                                ? 'border-purple-300 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-950/20'
                                : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                            }`}
                          >
                            {/* Card Header: Parameter Name + Range + Flag */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{param.name}</span>
                                  {param.isCalculated && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                      Calc
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  Ref: <span className="font-semibold text-slate-700 dark:text-slate-300">{rangeText}</span>
                                  {param.unit && ` (${param.unit})`}
                                </div>
                              </div>

                              {/* Flag Status Badge */}
                              <div>
                                {currentFlag === 'high' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800 border border-red-300">
                                    HIGH ▲
                                  </span>
                                )}
                                {currentFlag === 'low' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300">
                                    LOW ▼
                                  </span>
                                )}
                                {currentFlag === 'abnormal' && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300">
                                    ABNORMAL
                                  </span>
                                )}
                                {currentFlag === 'normal' && currentValue !== '' && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                    Normal
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Touch-Friendly Input */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                {param.type === 'select' ? (
                                  <select
                                    value={currentValue}
                                    onChange={(e) => handleParamValueChange(testId, param.id, e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-white"
                                  >
                                    <option value="">-- Tap to Select Result --</option>
                                    {param.options?.map(opt => (
                                      <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                  </select>
                                ) : param.type === 'text' ? (
                                  <input
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => handleParamValueChange(testId, param.id, e.target.value)}
                                    placeholder="Enter morphology or findings..."
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white font-medium"
                                  />
                                ) : (
                                  <input
                                    type="number"
                                    step="any"
                                    value={currentValue}
                                    onChange={(e) => handleParamValueChange(testId, param.id, e.target.value)}
                                    placeholder="0.0"
                                    className={`w-full px-3 py-2 rounded-lg border font-mono font-bold text-sm bg-white dark:bg-slate-900 ${
                                      currentFlag === 'high'
                                        ? 'border-red-400 text-red-900 dark:text-red-300'
                                        : currentFlag === 'low'
                                        ? 'border-blue-400 text-blue-900 dark:text-blue-300'
                                        : 'border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white'
                                    }`}
                                  />
                                )}
                              </div>
                              {param.unit && (
                                <span className="px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 min-w-[50px] text-center">
                                  {param.unit}
                                </span>
                              )}
                            </div>

                            {/* Inconsistent calculation alert */}
                            {warningMsg && (
                              <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 p-2 rounded-lg flex items-center gap-1.5 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                <span>{warningMsg}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

              </div>
            );
          })}

          {/* Clinical Interpretation & Remarks Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Pathologist Clinical Remarks & Interpretation
              </label>

              {/* Quick Preset Phrases */}
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-slate-400 hidden sm:inline">Templates:</span>
                <button
                  type="button"
                  onClick={() => setClinicalNotes("Test findings are within biological reference intervals for age and sex.")}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 font-medium"
                >
                  Within Normal Limits
                </button>
                <button
                  type="button"
                  onClick={() => setClinicalNotes("CBC reveals Microcytic Hypochromic Anemia. Suggest Serum Ferritin & Iron studies.")}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 font-medium"
                >
                  Microcytic Anemia
                </button>
                <button
                  type="button"
                  onClick={() => setClinicalNotes("Elevated transaminases and alkaline phosphatase. Clinical correlation with ultrasound abdomen advised.")}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 font-medium"
                >
                  Deranged LFT
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Enter pathological impressions, recommendations, or clinical correlation notes..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Sign-off Pathologist:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {profile.doctorName} ({profile.doctorQualification})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500">Report Status:</span>
                <select
                  value={reportStatus}
                  onChange={(e) => setReportStatus(e.target.value as any)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-xs"
                >
                  <option value="draft">Draft (Unsigned)</option>
                  <option value="verified">Verified by Tech</option>
                  <option value="finalized">Finalized & Locked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Test Selection</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onPreviewReport(currentPreviewReport)}
                className="px-5 py-2.5 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950 font-bold text-xs flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Preview Document</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveReport('finalized')}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving...' : 'Finalize, Lock & Sign Report'}</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
