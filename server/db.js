import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  defaultLabProfile,
  defaultCategories,
  defaultTests,
  defaultPatients,
  defaultReports,
  defaultAuditLogs
} from './defaultData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

// Safe directory creation
function ensureDirs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Directory creation error:', err);
  }
}
ensureDirs();

class Database {
  constructor() {
    this.data = {
      labProfile: { ...defaultLabProfile },
      categories: [...defaultCategories],
      tests: [...defaultTests],
      patients: [...defaultPatients],
      reports: [...defaultReports],
      auditLogs: [...defaultAuditLogs]
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          labProfile: { ...defaultLabProfile, ...(parsed.labProfile || {}) },
          categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : defaultCategories,
          tests: parsed.tests && parsed.tests.length > 0 ? parsed.tests : defaultTests,
          patients: parsed.patients || defaultPatients,
          reports: parsed.reports || defaultReports,
          auditLogs: parsed.auditLogs || defaultAuditLogs
        };
      } else {
        // In serverless or fresh environment, check if bundled seed database exists
        const bundledDb = path.join(__dirname, 'data', 'database.json');
        if (fs.existsSync(bundledDb)) {
          try {
            const raw = fs.readFileSync(bundledDb, 'utf-8');
            const parsed = JSON.parse(raw);
            this.data = {
              labProfile: { ...defaultLabProfile, ...(parsed.labProfile || {}) },
              categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : defaultCategories,
              tests: parsed.tests && parsed.tests.length > 0 ? parsed.tests : defaultTests,
              patients: parsed.patients || defaultPatients,
              reports: parsed.reports || defaultReports,
              auditLogs: parsed.auditLogs || defaultAuditLogs
            };
          } catch (e) {
            console.error('Failed reading bundled DB seed:', e);
          }
        }
        this.save();
      }
    } catch (err) {
      console.error('Failed to load DB file, using fallback in-memory data:', err);
      this.save();
    }
  }

  save() {
    try {
      ensureDirs();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving DB:', err);
    }
  }

  backup(reason = 'manual') {
    try {
      ensureDirs();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${reason}-${timestamp}.json`;
      const target = path.join(BACKUP_DIR, filename);
      fs.writeFileSync(target, JSON.stringify(this.data, null, 2), 'utf-8');
      return filename;
    } catch (err) {
      console.error('Backup failed:', err);
      return null;
    }
  }

  logAudit(action, entity, details, user = 'Current User') {
    const log = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      entity,
      user,
      details
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 500) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 500);
    }
    this.save();
    return log;
  }

  // --- Profile / Settings ---
  getProfile() {
    return this.data.labProfile;
  }

  updateProfile(updates, user = 'Admin') {
    this.data.labProfile = { ...this.data.labProfile, ...updates };
    this.logAudit('PROFILE_UPDATED', 'Lab Profile', 'Updated lab profile settings', user);
    this.save();
    return this.data.labProfile;
  }

  // --- Patients ---
  getPatients(search = '') {
    if (!search) return this.data.patients;
    const q = search.toLowerCase();
    return this.data.patients.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.guardianName && p.guardianName.toLowerCase().includes(q))
    );
  }

  getPatient(id) {
    return this.data.patients.find(p => p.id === id);
  }

  savePatient(patientData, user = 'Staff') {
    if (patientData.id) {
      const idx = this.data.patients.findIndex(p => p.id === patientData.id);
      if (idx !== -1) {
        this.data.patients[idx] = { ...this.data.patients[idx], ...patientData, updatedAt: new Date().toISOString() };
        this.logAudit('PATIENT_UPDATED', patientData.id, `Updated patient ${patientData.name}`, user);
        this.save();
        return this.data.patients[idx];
      }
    }

    // New patient
    const dateStr = new Date().getFullYear();
    const count = this.data.patients.length + 101;
    const id = `PAT-${dateStr}-${String(count).padStart(5, '0')}`;
    const newPatient = {
      ...patientData,
      id,
      createdAt: new Date().toISOString()
    };
    this.data.patients.unshift(newPatient);
    this.logAudit('PATIENT_CREATED', id, `Registered new patient ${newPatient.name}`, user);
    this.save();
    return newPatient;
  }

  deletePatient(id, user = 'Admin') {
    const idx = this.data.patients.findIndex(p => p.id === id);
    if (idx !== -1) {
      const p = this.data.patients[idx];
      this.data.patients.splice(idx, 1);
      this.logAudit('PATIENT_DELETED', id, `Deleted patient ${p.name}`, user);
      this.save();
      return true;
    }
    return false;
  }

  // --- Tests & Categories ---
  getCategories() {
    return this.data.categories;
  }

  saveCategory(catData) {
    if (catData.id) {
      const idx = this.data.categories.findIndex(c => c.id === catData.id);
      if (idx !== -1) {
        this.data.categories[idx] = { ...this.data.categories[idx], ...catData };
        this.save();
        return this.data.categories[idx];
      }
    }
    const id = catData.id || `cat-${Date.now()}`;
    const newCat = { ...catData, id };
    this.data.categories.push(newCat);
    this.save();
    return newCat;
  }

  getTests(categoryId = null) {
    if (categoryId) {
      return this.data.tests.filter(t => t.categoryId === categoryId);
    }
    return this.data.tests;
  }

  getTest(id) {
    return this.data.tests.find(t => t.id === id);
  }

  saveTest(testData, user = 'Admin') {
    if (testData.id) {
      const idx = this.data.tests.findIndex(t => t.id === testData.id);
      if (idx !== -1) {
        this.data.tests[idx] = { ...this.data.tests[idx], ...testData };
        this.logAudit('TEST_UPDATED', testData.id, `Updated test definition for ${testData.name}`, user);
        this.save();
        return this.data.tests[idx];
      }
    }
    const id = testData.id || `test-${Date.now()}`;
    const newTest = { ...testData, id };
    this.data.tests.push(newTest);
    this.logAudit('TEST_CREATED', id, `Added test ${newTest.name}`, user);
    this.save();
    return newTest;
  }

  deleteTest(id, user = 'Admin') {
    const idx = this.data.tests.findIndex(t => t.id === id);
    if (idx !== -1) {
      const test = this.data.tests[idx];
      this.data.tests.splice(idx, 1);
      this.logAudit('TEST_DELETED', id, `Removed test ${test.name}`, user);
      this.save();
      return true;
    }
    return false;
  }

  resetTestsToDefault(user = 'Admin') {
    this.backup('before-reset-tests');
    this.data.categories = [...defaultCategories];
    this.data.tests = [...defaultTests];
    this.logAudit('TESTS_RESET', 'All Tests', 'Reset test library to standard factory defaults', user);
    this.save();
    return { categories: this.data.categories, tests: this.data.tests };
  }

  // --- Reports & Version History ---
  getReports(query = {}) {
    let list = [...this.data.reports];
    const { search, status, categoryId, fromDate, toDate } = query;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.reportNumber.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.patientName.toLowerCase().includes(q) ||
        (r.referringDoctor && r.referringDoctor.toLowerCase().includes(q)) ||
        (r.phone && r.phone.toLowerCase().includes(q))
      );
    }

    if (status && status !== 'all') {
      list = list.filter(r => r.status === status);
    }

    return list;
  }

  getReport(id) {
    return this.data.reports.find(r => r.id === id || r.reportNumber === id);
  }

  saveReport(reportData, user = 'Staff') {
    // If updating existing report
    if (reportData.id) {
      const idx = this.data.reports.findIndex(r => r.id === reportData.id);
      if (idx !== -1) {
        const existing = this.data.reports[idx];

        // Never silently overwrite a finalized report:
        if (existing.status === 'finalized' && !reportData.isReissueApproved) {
          throw new Error('This report has already been finalized and locked. You must use "Edit & Reissue" with authorization notes to generate a new version.');
        }

        // If reissuing or editing finalized
        let newVersion = existing.version || 1;
        let revisions = existing.revisions || [
          {
            version: 1,
            timestamp: existing.reportDate || new Date().toISOString(),
            author: existing.verifiedBy || 'Pathologist',
            notes: 'Original report'
          }
        ];

        if (reportData.isReissueApproved || existing.status === 'finalized') {
          newVersion += 1;
          revisions.push({
            version: newVersion,
            timestamp: new Date().toISOString(),
            author: user,
            notes: reportData.reissueReason || `Revised to version ${newVersion}`
          });
        }

        const updated = {
          ...existing,
          ...reportData,
          version: newVersion,
          revisions,
          updatedAt: new Date().toISOString()
        };

        this.data.reports[idx] = updated;
        this.logAudit('REPORT_UPDATED', updated.reportNumber, `Updated report version v${newVersion} (${updated.status})`, user);
        this.save();
        return updated;
      }
    }

    // Creating new report
    const curYear = new Date().getFullYear().toString().slice(-2);
    const count = this.data.reports.length + 101;
    const reportNumber = reportData.reportNumber || `RCL-${curYear}-${count}`;
    const id = `REP-${new Date().getFullYear()}-${String(count).padStart(5, '0')}`;

    const newReport = {
      ...reportData,
      id,
      reportNumber,
      version: 1,
      status: reportData.status || 'draft',
      createdAt: new Date().toISOString(),
      revisions: [
        {
          version: 1,
          timestamp: new Date().toISOString(),
          author: user,
          notes: 'Report created'
        }
      ]
    };

    this.data.reports.unshift(newReport);
    this.logAudit('REPORT_CREATED', reportNumber, `Created new report for ${newReport.patientName}`, user);
    this.save();
    return newReport;
  }

  deleteReport(id, user = 'Admin') {
    const idx = this.data.reports.findIndex(r => r.id === id);
    if (idx !== -1) {
      const rep = this.data.reports[idx];
      this.data.reports.splice(idx, 1);
      this.logAudit('REPORT_DELETED', rep.reportNumber, `Deleted report ${rep.reportNumber}`, user);
      this.save();
      return true;
    }
    return false;
  }

  getAuditLogs() {
    return this.data.auditLogs;
  }

  getStats() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const totalReports = this.data.reports.length;
    const todayReports = this.data.reports.filter(r => (r.createdAt || '').startsWith(todayStr)).length;
    const pendingVerification = this.data.reports.filter(r => r.status === 'draft' || r.status === 'verified').length;
    const finalizedReports = this.data.reports.filter(r => r.status === 'finalized').length;
    const totalPatients = this.data.patients.length;
    const totalTests = this.data.tests.length;

    return {
      totalReports,
      todayReports,
      pendingVerification,
      finalizedReports,
      totalPatients,
      totalTests
    };
  }

  restoreData(importedData, user = 'Admin') {
    this.backup('before-restore');
    if (!importedData || typeof importedData !== 'object') {
      throw new Error('Invalid backup file format');
    }

    if (importedData.labProfile) this.data.labProfile = importedData.labProfile;
    if (Array.isArray(importedData.categories)) this.data.categories = importedData.categories;
    if (Array.isArray(importedData.tests)) this.data.tests = importedData.tests;
    if (Array.isArray(importedData.patients)) this.data.patients = importedData.patients;
    if (Array.isArray(importedData.reports)) this.data.reports = importedData.reports;
    if (Array.isArray(importedData.auditLogs)) this.data.auditLogs = importedData.auditLogs;

    this.logAudit('DATABASE_RESTORED', 'Full Database', 'Restored data from backup file', user);
    this.save();
    return true;
  }
}

export const db = new Database();
