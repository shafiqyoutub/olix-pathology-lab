import { LabProfile, Category, TestItem, Patient, Report, AuditLog, DashboardStats } from '../types';

const BASE_URL = '/api';

export const api = {
  // Stats
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${BASE_URL}/stats`);
    const data = await res.json();
    return data.data;
  },

  // Lab Profile
  async getProfile(): Promise<LabProfile> {
    const res = await fetch(`${BASE_URL}/profile`);
    const data = await res.json();
    return data.data;
  },

  async updateProfile(updates: Partial<LabProfile>, user = 'Admin'): Promise<LabProfile> {
    const res = await fetch(`${BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user': user },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    return data.data;
  },

  // Patients
  async getPatients(search = ''): Promise<Patient[]> {
    const res = await fetch(`${BASE_URL}/patients?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    return data.data;
  },

  async getPatient(id: string): Promise<Patient> {
    const res = await fetch(`${BASE_URL}/patients/${id}`);
    const data = await res.json();
    return data.data;
  },

  async savePatient(patient: Partial<Patient>, user = 'Staff'): Promise<Patient> {
    const res = await fetch(`${BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user': user },
      body: JSON.stringify(patient)
    });
    const data = await res.json();
    return data.data;
  },

  async deletePatient(id: string, user = 'Admin'): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/patients/${id}`, {
      method: 'DELETE',
      headers: { 'x-user': user }
    });
    const data = await res.json();
    return data.success;
  },

  // Categories & Tests
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    return data.data;
  },

  async saveCategory(category: Partial<Category>): Promise<Category> {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    const data = await res.json();
    return data.data;
  },

  async getTests(categoryId?: string): Promise<TestItem[]> {
    const url = categoryId ? `${BASE_URL}/tests?categoryId=${encodeURIComponent(categoryId)}` : `${BASE_URL}/tests`;
    const res = await fetch(url);
    const data = await res.json();
    return data.data;
  },

  async saveTest(test: Partial<TestItem>, user = 'Admin'): Promise<TestItem> {
    const res = await fetch(`${BASE_URL}/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user': user },
      body: JSON.stringify(test)
    });
    const data = await res.json();
    return data.data;
  },

  async deleteTest(id: string, user = 'Admin'): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/tests/${id}`, {
      method: 'DELETE',
      headers: { 'x-user': user }
    });
    const data = await res.json();
    return data.success;
  },

  async resetTests(user = 'Admin'): Promise<{ categories: Category[]; tests: TestItem[] }> {
    const res = await fetch(`${BASE_URL}/tests/reset-defaults`, {
      method: 'POST',
      headers: { 'x-user': user }
    });
    const data = await res.json();
    return data.data;
  },

  // Reports
  async getReports(params: { search?: string; status?: string } = {}): Promise<Report[]> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    const res = await fetch(`${BASE_URL}/reports?${query.toString()}`);
    const data = await res.json();
    return data.data;
  },

  async getReport(id: string): Promise<Report> {
    const res = await fetch(`${BASE_URL}/reports/${id}`);
    const data = await res.json();
    return data.data;
  },

  async saveReport(report: Partial<Report> & { isReissueApproved?: boolean; reissueReason?: string }, user = 'Staff'): Promise<Report> {
    const res = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user': user },
      body: JSON.stringify(report)
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to save report');
    }
    return data.data;
  },

  async deleteReport(id: string, user = 'Admin'): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/reports/${id}`, {
      method: 'DELETE',
      headers: { 'x-user': user }
    });
    const data = await res.json();
    return data.success;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${BASE_URL}/audit-logs`);
    const data = await res.json();
    return data.data;
  },

  // Backup & Restore
  getExportUrl(): string {
    return `${BASE_URL}/backup/export`;
  },

  async restoreDatabase(jsonData: any, user = 'Admin'): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/backup/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user': user },
      body: JSON.stringify(jsonData)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Restore failed');
    return true;
  }
};
