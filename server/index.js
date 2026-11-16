import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Normalize URL prefix for serverless environments
app.use((req, res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  next();
});

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- API Routes ---

// 1. Dashboard Stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Laboratory Profile / Settings
app.get('/api/profile', (req, res) => {
  try {
    const profile = db.getProfile();
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/profile', (req, res) => {
  try {
    const updated = db.updateProfile(req.body, req.headers['x-user'] || 'Admin');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. Patients
app.get('/api/patients', (req, res) => {
  try {
    const search = req.query.search || '';
    const patients = db.getPatients(search);
    res.json({ success: true, data: patients });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/patients/:id', (req, res) => {
  try {
    const patient = db.getPatient(req.params.id);
    if (!patient) return res.status(404).json({ success: false, error: 'Patient not found' });
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/patients', (req, res) => {
  try {
    const saved = db.savePatient(req.body, req.headers['x-user'] || 'Staff');
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/patients/:id', (req, res) => {
  try {
    const ok = db.deletePatient(req.params.id, req.headers['x-user'] || 'Admin');
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Test Categories
app.get('/api/categories', (req, res) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/categories', (req, res) => {
  try {
    const saved = db.saveCategory(req.body);
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Tests Library
app.get('/api/tests', (req, res) => {
  try {
    const categoryId = req.query.categoryId || null;
    const tests = db.getTests(categoryId);
    res.json({ success: true, data: tests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/tests/:id', (req, res) => {
  try {
    const test = db.getTest(req.params.id);
    if (!test) return res.status(404).json({ success: false, error: 'Test not found' });
    res.json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tests', (req, res) => {
  try {
    const saved = db.saveTest(req.body, req.headers['x-user'] || 'Admin');
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/tests/:id', (req, res) => {
  try {
    const ok = db.deleteTest(req.params.id, req.headers['x-user'] || 'Admin');
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/tests/reset-defaults', (req, res) => {
  try {
    const reset = db.resetTestsToDefault(req.headers['x-user'] || 'Admin');
    res.json({ success: true, data: reset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Reports & Version History
app.get('/api/reports', (req, res) => {
  try {
    const reports = db.getReports(req.query);
    res.json({ success: true, data: reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/reports/:id', (req, res) => {
  try {
    const report = db.getReport(req.params.id);
    if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/reports', (req, res) => {
  try {
    const saved = db.saveReport(req.body, req.headers['x-user'] || 'Staff');
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/reports/:id', (req, res) => {
  try {
    const ok = db.deleteReport(req.params.id, req.headers['x-user'] || 'Admin');
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Audit Logs
app.get('/api/audit-logs', (req, res) => {
  try {
    const logs = db.getAuditLogs();
    res.json({ success: true, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. Backup & Restore
app.get('/api/backup/export', (req, res) => {
  try {
    const backupData = db.data;
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Disposition', `attachment; filename=raza-lab-backup-${dateStr}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/backup/restore', (req, res) => {
  try {
    const ok = db.restoreData(req.body, req.headers['x-user'] || 'Admin');
    res.json({ success: ok, message: 'Database successfully restored.' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Serve static frontend in non-Vercel production environments
if (!process.env.VERCEL) {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  // Start standalone server
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` 🩺 RAZA CLINICAL LABORATORY REPORT SYSTEM RUNNING`);
    console.log(` 📡 Server listening on http://localhost:${PORT}`);
    console.log(`=======================================================`);
  });
}

export default app;
