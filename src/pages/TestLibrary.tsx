import React, { useState } from 'react';
import { 
  FlaskRound, 
  PlusCircle, 
  Edit, 
  Trash2, 
  RotateCcw, 
  Search, 
  CheckCircle, 
  AlertTriangle,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { TestItem, Category, TestParameter, LabProfile } from '../types';
import { api } from '../utils/api';

interface TestLibraryProps {
  tests: TestItem[];
  categories: Category[];
  profile: LabProfile;
  onRefreshTests: () => void;
}

export const TestLibrary: React.FC<TestLibraryProps> = ({
  tests,
  categories,
  profile,
  onRefreshTests
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  
  // Edit / Add Test Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [editingTest, setEditingTest] = useState<TestItem | null>(null);

  // Add / Edit Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState<boolean>(false);
  const [newCatName, setNewCatName] = useState<string>('');

  // Form State for Test
  const [testName, setTestName] = useState<string>('');
  const [testCode, setTestCode] = useState<string>('');
  const [testCategoryId, setTestCategoryId] = useState<string>('hematology');
  const [sampleType, setSampleType] = useState<string>('Whole Blood / Serum');
  const [method, setMethod] = useState<string>('');
  const [price, setPrice] = useState<number>(500);
  const [parameters, setParameters] = useState<TestParameter[]>([]);

  // Open Add Test Dialog
  const handleOpenAddTest = () => {
    setEditingTest(null);
    setTestName('');
    setTestCode(`LAB-${Math.floor(100 + Math.random() * 900)}`);
    setTestCategoryId(selectedCategoryId !== 'all' ? selectedCategoryId : (categories[0]?.id || 'hematology'));
    setSampleType('Serum / Whole Blood');
    setMethod('Automated Analyzer / Spectrophotometry');
    setPrice(600);
    setParameters([
      {
        id: 'param_1',
        name: 'Parameter 1',
        unit: 'mg/dL',
        type: 'number',
        ranges: [
          { gender: 'both', ageMin: 0, ageMax: 120, low: 10, high: 50, text: '10 - 50' }
        ]
      }
    ]);
    setIsTestModalOpen(true);
  };

  // Open Edit Test Dialog
  const handleOpenEditTest = (t: TestItem) => {
    setEditingTest(t);
    setTestName(t.name);
    setTestCode(t.code);
    setTestCategoryId(t.categoryId);
    setSampleType(t.sampleType);
    setMethod(t.method || '');
    setPrice(t.price || 0);
    setParameters(JSON.parse(JSON.stringify(t.parameters || [])));
    setIsTestModalOpen(true);
  };

  // Add new parameter row to current test
  const handleAddParam = () => {
    const newId = `param_${Date.now()}`;
    setParameters([
      ...parameters,
      {
        id: newId,
        name: `Parameter ${parameters.length + 1}`,
        unit: '',
        type: 'number',
        ranges: [{ gender: 'both', ageMin: 0, ageMax: 120, text: 'Normal' }]
      }
    ]);
  };

  // Remove parameter row
  const handleRemoveParam = (index: number) => {
    if (parameters.length <= 1) {
      alert('A test must have at least one parameter.');
      return;
    }
    const updated = [...parameters];
    updated.splice(index, 1);
    setParameters(updated);
  };

  // Save Test
  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) {
      alert('Test name is required.');
      return;
    }

    try {
      await api.saveTest({
        id: editingTest ? editingTest.id : undefined,
        categoryId: testCategoryId,
        name: testName,
        code: testCode,
        sampleType,
        method,
        price,
        parameters
      }, profile.doctorName);

      setIsTestModalOpen(false);
      onRefreshTests();
      alert(`Test "${testName}" saved successfully.`);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  };

  // Delete Test
  const handleDeleteTest = async (t: TestItem) => {
    if (!window.confirm(`Delete test "${t.name}" from catalog?`)) return;
    try {
      await api.deleteTest(t.id, profile.doctorName);
      onRefreshTests();
      alert(`Test ${t.name} removed.`);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // Save new category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const id = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await api.saveCategory({ id, name: newCatName, order: categories.length + 1 });
      setNewCatName('');
      setIsCatModalOpen(false);
      onRefreshTests();
      alert(`Category "${newCatName}" added.`);
    } catch (err: any) {
      alert(`Failed to add category: ${err.message}`);
    }
  };

  // Reset to Factory Defaults
  const handleResetDefaults = async () => {
    const ok = window.confirm('Reset all pathology tests, categories, and medical reference ranges to clinical factory defaults? Any custom tests added will be archived in a backup first.');
    if (!ok) return;

    try {
      await api.resetTests(profile.doctorName);
      onRefreshTests();
      alert('Pathology library restored to standard diagnostic defaults.');
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    }
  };

  const filteredTests = tests.filter(t => {
    const matchesCat = selectedCategoryId === 'all' || t.categoryId === selectedCategoryId;
    const matchesSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.code.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskRound className="w-5 h-5 text-emerald-600" />
            Pathology Test Library & Reference Ranges
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure unlimited clinical tests, parameters, biological reference intervals, and auto-calculation formulas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCatModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>+ Category</span>
          </button>
          
          <button
            onClick={handleOpenAddTest}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Test</span>
          </button>

          <button
            onClick={handleResetDefaults}
            title="Restore Factory Diagnostic Test Library"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-amber-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => setSelectedCategoryId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategoryId === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Categories ({tests.length})
          </button>
          {categories.map(c => {
            const count = tests.filter(t => t.categoryId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategoryId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategoryId === c.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test name or test code..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map(test => (
          <div
            key={test.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  {test.code}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {test.categoryId}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                {test.name}
              </h3>
              
              <p className="text-[11px] text-slate-500 mt-0.5">
                Specimen: <span className="text-slate-700 dark:text-slate-300">{test.sampleType}</span>
              </p>
              
              {test.method && (
                <p className="text-[10px] text-slate-400 italic mt-0.5 truncate">
                  Method: {test.method}
                </p>
              )}

              {/* Parameters Preview Tags */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Parameters ({test.parameters.length}):
                </div>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {test.parameters.map(p => (
                    <span
                      key={p.id}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-700 dark:text-slate-300 font-medium"
                    >
                      {p.name} {p.isCalculated && '★'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                {test.price ? `Rs. ${test.price}` : 'Free / Standard'}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEditTest(test)}
                  title="Edit Test & Ranges"
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteTest(test)}
                  title="Delete Test"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Test Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskRound className="w-5 h-5 text-emerald-600" />
                {editingTest ? `Edit Test: ${editingTest.name}` : 'Add New Pathology Test'}
              </h3>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Test Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. Complete Blood Count (CBC)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Test Code
                  </label>
                  <input
                    type="text"
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Pathology Category
                  </label>
                  <select
                    value={testCategoryId}
                    onChange={(e) => setTestCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sample / Specimen Type
                  </label>
                  <input
                    type="text"
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    placeholder="e.g. Serum / EDTA Blood"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Standard Price (PKR)
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Testing Methodology (Optional)
                  </label>
                  <input
                    type="text"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    placeholder="e.g. Spectrophotometric / Chemiluminescence / Manual Microscopy"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Dynamic Parameter Editor */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">
                    Test Result Parameters ({parameters.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddParam}
                    className="px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1"
                  >
                    + Add Parameter
                  </button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {parameters.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center"
                    >
                      <div className="sm:col-span-4">
                        <label className="block sm:hidden text-[10px] font-semibold text-slate-500 mb-0.5">Parameter Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => {
                            const updated = [...parameters];
                            updated[idx].name = e.target.value;
                            setParameters(updated);
                          }}
                          placeholder="Parameter Name"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:contents gap-2">
                        <div className="sm:col-span-2">
                          <label className="block sm:hidden text-[10px] font-semibold text-slate-500 mb-0.5">Unit</label>
                          <input
                            type="text"
                            value={p.unit}
                            onChange={(e) => {
                              const updated = [...parameters];
                              updated[idx].unit = e.target.value;
                              setParameters(updated);
                            }}
                            placeholder="Unit (g/dL)"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block sm:hidden text-[10px] font-semibold text-slate-500 mb-0.5">Type</label>
                          <select
                            value={p.type}
                            onChange={(e) => {
                              const updated = [...parameters];
                              updated[idx].type = e.target.value as any;
                              setParameters(updated);
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="number">Number</option>
                            <option value="text">Text</option>
                            <option value="select">Dropdown</option>
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block sm:hidden text-[10px] font-semibold text-slate-500 mb-0.5">Normal Reference Range</label>
                        <input
                          type="text"
                          value={p.ranges?.[0]?.text || ''}
                          onChange={(e) => {
                            const updated = [...parameters];
                            if (!updated[idx].ranges || updated[idx].ranges.length === 0) {
                              updated[idx].ranges = [{ gender: 'both', text: e.target.value }];
                            } else {
                              updated[idx].ranges[0].text = e.target.value;
                            }
                            setParameters(updated);
                          }}
                          placeholder="Normal Range"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveParam(idx)}
                          className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Test to Library
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add New Pathology Category
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Molecular Biology / Histopathology"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
