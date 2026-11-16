import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ReportPreviewModal } from './components/ReportPreviewModal';
import { Dashboard } from './pages/Dashboard';
import { NewReport } from './pages/NewReport';
import { PatientRecords } from './pages/PatientRecords';
import { ReportHistory } from './pages/ReportHistory';
import { TestLibrary } from './pages/TestLibrary';
import { ReportDesigner } from './pages/ReportDesigner';
import { Settings } from './pages/Settings';

import { LabProfile, Category, TestItem, Report } from './types';
import { api } from './utils/api';
import { defaultLabProfile, defaultCategories, defaultTests } from '../server/defaultData.js';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<LabProfile>({ ...defaultLabProfile });
  const [categories, setCategories] = useState<Category[]>([...defaultCategories]);
  const [tests, setTests] = useState<TestItem[]>([...defaultTests]);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<string>('Pathologist (Dr. Ghulam)');

  // 1. Remember Dark / Light Mode in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem('pathology_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // 2. Remember Sidebar state & collapse by default on mobile screens (< 768px)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        // Must be collapsed by default on mobile
        return false;
      }
      const saved = localStorage.getItem('pathology_sidebar_open');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return false;
    }
  });

  // Navigation parameters
  const [navParams, setNavParams] = useState<any>({});

  // Active Report Modal
  const [previewReport, setPreviewReport] = useState<Report | null>(null);

  // Load Initial Data from Backend
  const loadInitialData = async () => {
    try {
      const [profData, catsData, testsData] = await Promise.all([
        api.getProfile(),
        api.getCategories(),
        api.getTests()
      ]);
      if (profData) setProfile(profData);
      if (catsData && catsData.length > 0) setCategories(catsData);
      if (testsData && testsData.length > 0) setTests(testsData);
    } catch (err) {
      console.warn('Backend connecting or using preloaded defaults:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Theme Sync with HTML element and localStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('pathology_theme', next ? 'dark' : 'light');
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      try {
        localStorage.setItem('pathology_sidebar_open', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  const handleCloseSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setNavParams(params);
    handleCloseSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditReissue = (report: Report) => {
    setPreviewReport(null);
    handleNavigate('new-report', { editReportId: report.id });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        profile={profile}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onNavigate={handleNavigate}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={handleToggleSidebar}
      />

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex overflow-x-hidden">
        
        {/* Navigation Sidebar (Collapsible & Mobile Slide-over) */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          profile={profile}
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />

        {/* Dynamic Page Container (No horizontal scrolling on mobile) */}
        <main className="flex-1 p-3 sm:p-5 lg:p-8 min-w-0 w-full max-w-full overflow-x-hidden">
          {currentPage === 'dashboard' && (
            <Dashboard
              profile={profile}
              tests={tests}
              onNavigate={handleNavigate}
              onPreviewReport={(rep) => setPreviewReport(rep)}
            />
          )}

          {currentPage === 'new-report' && (
            <NewReport
              profile={profile}
              tests={tests}
              preselectedPatient={navParams.selectedPatient}
              editReportId={navParams.editReportId}
              onNavigate={handleNavigate}
              onPreviewReport={(rep) => setPreviewReport(rep)}
            />
          )}

          {currentPage === 'patients' && (
            <PatientRecords
              profile={profile}
              openAddModal={Boolean(navParams.openAddModal)}
              onNavigate={handleNavigate}
              onPreviewReport={(rep) => setPreviewReport(rep)}
            />
          )}

          {currentPage === 'reports' && (
            <ReportHistory
              profile={profile}
              tests={tests}
              initialSearch={navParams.search || ''}
              onNavigate={handleNavigate}
              onPreviewReport={(rep) => setPreviewReport(rep)}
            />
          )}

          {currentPage === 'test-library' && (
            <TestLibrary
              tests={tests}
              categories={categories}
              profile={profile}
              onRefreshTests={loadInitialData}
            />
          )}

          {currentPage === 'report-designer' && (
            <ReportDesigner
              profile={profile}
              onProfileUpdate={setProfile}
            />
          )}

          {currentPage === 'settings' && (
            <Settings
              profile={profile}
              onProfileUpdate={setProfile}
            />
          )}
        </main>

      </div>

      {/* Interactive Live Report Preview & Print Modal */}
      {previewReport && (
        <ReportPreviewModal
          report={previewReport}
          profile={profile}
          tests={tests}
          onClose={() => setPreviewReport(null)}
          onEditReissue={handleEditReissue}
        />
      )}

    </div>
  );
};
