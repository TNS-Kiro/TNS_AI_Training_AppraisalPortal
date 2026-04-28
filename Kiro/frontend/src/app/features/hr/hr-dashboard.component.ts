import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;font-family:sans-serif;background:#f8fafc;min-height:100vh;">

      <!-- Header -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
        <h1 style="margin:0;color:#1e293b;">HR Dashboard</h1>
        <span style="font-size:12px;color:#94a3b8;background:#e2e8f0;padding:4px 10px;border-radius:999px;">Live data · auto-refreshes every 10s</span>
        <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
          <label style="font-size:13px;color:#64748b;">Cycle:</label>
          <select [(ngModel)]="selectedCycleId" (ngModelChange)="onCycleChange()"
            style="padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
            <option [ngValue]="null">All Cycles</option>
            @for (c of cycles; track c.id) {
              <option [ngValue]="c.id">{{ c.name }}</option>
            }
          </select>
          <button class="btn-export" (click)="exportCsv()">⬇ Export CSV</button>
        </div>
      </div>

      @if (error) {
        <div style="background:#fee2e2;border:1px solid #fca5a5;color:#dc2626;padding:16px;border-radius:8px;margin-bottom:24px;">
          {{ error }}
        </div>
      }

      <!-- Aggregate Metrics -->
      @if (summary) {
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px;">
          <div class="stat-card">
            <div class="stat-label">Total Employees</div>
            <div class="stat-value">{{ employees.length }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Not Started</div>
            <div class="stat-value" style="color:#ef4444;">{{ countByStatus('NOT_STARTED') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Pending Review</div>
            <div class="stat-value" style="color:#f59e0b;">{{ countByStatus('SUBMITTED') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Completed</div>
            <div class="stat-value" style="color:#22c55e;">{{ countByStatus('REVIEWED_AND_COMPLETED') }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Overall Completion</div>
            <div class="stat-value" style="color:#6366f1;">{{ summary.overallCompletion | number:'1.0-0' }}%</div>
          </div>
        </div>
      }

      <!-- Tabs -->
      <div style="display:flex;gap:0;margin-bottom:24px;border-bottom:2px solid #e2e8f0;">
        @for (tab of tabs; track tab.id) {
          <button (click)="switchTab(tab.id)"
            [style.border-bottom]="activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent'"
            [style.color]="activeTab === tab.id ? '#6366f1' : '#64748b'"
            style="padding:10px 20px;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;font-size:14px;font-weight:500;margin-bottom:-2px;">
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab: Employee List -->
      <div [style.display]="activeTab === 'employees' ? 'block' : 'none'">
        <div class="card">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
            <input [(ngModel)]="searchText" placeholder="Search employee..."
              style="padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;width:240px;" />
            <select [(ngModel)]="filterStatus"
              style="padding:8px 10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;">
              <option value="">All Statuses</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="REVIEWED_AND_COMPLETED">Completed</option>
            </select>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th class="th">Employee</th>
                <th class="th">Department</th>
                <th class="th">Cycle</th>
                <th class="th">Status</th>
                <th class="th">Submitted</th>
                <th class="th">Reviewed</th>
                <th class="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (emp of filteredEmployees; track emp.formId) {
                <tr style="border-bottom:1px solid #f1f5f9;" [style.background]="selectedFormId === emp.formId ? '#f0f9ff' : 'white'">
                  <td class="td" style="font-weight:500;">{{ emp.employeeName }}</td>
                  <td class="td">{{ emp.department || '—' }}</td>
                  <td class="td" style="font-size:12px;color:#64748b;">{{ emp.cycleName }}</td>
                  <td class="td"><span [class]="'badge badge-' + emp.status">{{ statusLabel(emp.status) }}</span></td>
                  <td class="td" style="font-size:12px;">{{ emp.submittedAt ? (emp.submittedAt | date:'mediumDate') : '—' }}</td>
                  <td class="td" style="font-size:12px;">{{ emp.reviewedAt ? (emp.reviewedAt | date:'mediumDate') : '—' }}</td>
                  <td class="td">
                    <button class="btn-link" (click)="viewForm(emp.formId)">View Form</button>
                    @if (emp.pdfPath) {
                      <a [href]="'/api/forms/' + emp.formId + '/pdf'" target="_blank" class="btn-link" style="color:#22c55e;margin-left:8px;">📄 PDF</a>
                    }
                  </td>
                </tr>
              }
              @if (filteredEmployees.length === 0) {
                <tr><td colspan="7" style="padding:32px;text-align:center;color:#94a3b8;">No employees found</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Department Progress -->
      <div [style.display]="activeTab === 'departments' ? 'block' : 'none'">
        <div class="card">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th class="th">Department</th>
                <th class="th">Total</th>
                <th class="th">Completed</th>
                <th class="th">Completion %</th>
              </tr>
            </thead>
            <tbody>
              @for (stat of summary?.departmentStats; track stat.department) {
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td class="td" style="font-weight:500;">{{ stat.department || 'N/A' }}</td>
                  <td class="td">{{ stat.totalForms }}</td>
                  <td class="td">{{ stat.completedForms }}</td>
                  <td class="td">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <div style="flex:1;background:#e2e8f0;border-radius:999px;height:8px;min-width:80px;">
                        <div style="background:#6366f1;border-radius:999px;height:8px;"
                             [style.width.%]="stat.completionPercentage"></div>
                      </div>
                      <span style="font-size:13px;font-weight:600;color:#6366f1;min-width:40px;">{{ stat.completionPercentage | number:'1.0-0' }}%</span>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Historical Cycles -->
      <div [style.display]="activeTab === 'cycles' ? 'block' : 'none'">
        <div class="card">
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th class="th">Cycle Name</th>
                <th class="th">Status</th>
                <th class="th">Start Date</th>
                <th class="th">End Date</th>
                <th class="th">Total Forms</th>
                <th class="th">Completed</th>
                <th class="th">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (cycle of cycles; track cycle.id) {
                <tr style="border-bottom:1px solid #f1f5f9;">
                  <td class="td" style="font-weight:500;">{{ cycle.name }}</td>
                  <td class="td"><span [class]="'badge badge-cycle-' + cycle.status">{{ cycle.status }}</span></td>
                  <td class="td" style="font-size:12px;">{{ cycle.startDate | date:'mediumDate' }}</td>
                  <td class="td" style="font-size:12px;">{{ cycle.endDate | date:'mediumDate' }}</td>
                  <td class="td">{{ cycle.totalForms }}</td>
                  <td class="td">{{ cycle.completedForms }}</td>
                  <td class="td">
                    <button class="btn-link" (click)="selectedCycleId = cycle.id; switchTab('employees'); onCycleChange()">
                      View Employees
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Form Detail Modal -->
      @if (selectedForm) {
        <div style="position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;">
          <div style="background:white;border-radius:12px;width:100%;max-width:700px;max-height:85vh;overflow-y:auto;">
            <div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:white;">
              <div>
                <h2 style="margin:0;font-size:18px;color:#1e293b;">Appraisal Form — Read Only</h2>
                <p style="margin:4px 0 0;font-size:13px;color:#64748b;">{{ selectedForm.employeeName }} · {{ selectedForm.cycleName }}</p>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                @if (selectedForm.pdfPath) {
                  <a [href]="'/api/forms/' + selectedForm.formId + '/pdf'" target="_blank" class="btn-primary" style="text-decoration:none;font-size:13px;">📄 Download PDF</a>
                }
                <button (click)="selectedForm = null" style="background:#f1f5f9;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;">✕ Close</button>
              </div>
            </div>
            <div style="padding:24px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
                <div class="info-row"><span class="info-label">Employee</span><span>{{ selectedForm.employeeName }}</span></div>
                <div class="info-row"><span class="info-label">Department</span><span>{{ selectedForm.department }}</span></div>
                <div class="info-row"><span class="info-label">Manager</span><span>{{ selectedForm.managerName }}</span></div>
                <div class="info-row"><span class="info-label">Status</span><span [class]="'badge badge-' + selectedForm.status">{{ statusLabel(selectedForm.status) }}</span></div>
                <div class="info-row"><span class="info-label">Submitted</span><span>{{ selectedForm.submittedAt ? (selectedForm.submittedAt | date:'medium') : '—' }}</span></div>
                <div class="info-row"><span class="info-label">Reviewed</span><span>{{ selectedForm.reviewedAt ? (selectedForm.reviewedAt | date:'medium') : '—' }}</span></div>
              </div>
              @if (selectedForm.formData) {
                <div style="background:#f8fafc;border-radius:8px;padding:16px;">
                  <h3 style="margin:0 0 12px;font-size:14px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Form Data</h3>
                  @for (section of parsedFormSections; track section.key) {
                    <div style="margin-bottom:16px;">
                      <h4 style="margin:0 0 8px;font-size:14px;color:#1e293b;text-transform:capitalize;">{{ section.key.replace('_', ' ') }}</h4>
                      @for (field of section.fields; track field.key) {
                        <div style="margin-bottom:8px;padding:8px 12px;background:white;border-radius:6px;border:1px solid #e2e8f0;">
                          <div style="font-size:11px;color:#94a3b8;text-transform:uppercase;margin-bottom:4px;">{{ field.key.replace('_', ' ') }}</div>
                          <div style="font-size:14px;color:#334155;">{{ field.value }}</div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stat-card { background:white;border:1px solid #e2e8f0;border-radius:8px;padding:20px;text-align:center; }
    .stat-label { font-size:12px;color:#64748b;margin-bottom:6px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em; }
    .stat-value { font-size:32px;font-weight:700;color:#1e293b; }
    .card { background:white;border:1px solid #e2e8f0;border-radius:8px;padding:20px; }
    .th { text-align:left;padding:10px 12px;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em; }
    .td { padding:10px 12px;font-size:14px;color:#334155; }
    .btn-primary { background:#6366f1;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500; }
    .btn-export { background:#0f172a;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:500; }
    .btn-link { background:none;border:none;color:#6366f1;cursor:pointer;font-size:13px;padding:0;text-decoration:underline; }
    .info-row { display:flex;flex-direction:column;gap:4px; }
    .info-label { font-size:11px;color:#94a3b8;text-transform:uppercase;font-weight:600; }
    .badge { padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;display:inline-block; }
    .badge-NOT_STARTED { background:#fee2e2;color:#dc2626; }
    .badge-SUBMITTED { background:#fef9c3;color:#a16207; }
    .badge-REVIEWED_AND_COMPLETED { background:#dcfce7;color:#16a34a; }
    .badge-cycle-ACTIVE { background:#dbeafe;color:#1d4ed8; }
    .badge-cycle-CLOSED { background:#f1f5f9;color:#64748b; }
  `]
})
export class HrDashboardComponent implements OnInit, OnDestroy {
  summary: any = null;
  employees: any[] = [];
  cycles: any[] = [];
  selectedForm: any = null;
  selectedFormId: number | null = null;
  selectedCycleId: number | null = null;
  searchText = '';
  filterStatus = '';
  error = '';
  activeTab = 'employees';
  parsedFormSections: any[] = [];
  private refreshInterval: any;

  tabs = [
    { id: 'employees', label: 'Employee List' },
    { id: 'departments', label: 'Department Progress' },
    { id: 'cycles', label: 'Historical Cycles' }
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadAll();
    this.refreshInterval = setInterval(() => this.loadAll(), 10000);
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  switchTab(tabId: string): void {
    this.activeTab = tabId;
  }

  loadAll(): void {
    this.error = '';
    const empUrl = `/api/dashboard/hr/employees${this.selectedCycleId ? '?cycleId=' + this.selectedCycleId : ''}`;

    forkJoin({
      summary: this.http.get<any>('/api/dashboard/hr').pipe(catchError(() => of(null))),
      employees: this.http.get<any>(empUrl).pipe(catchError(() => of(null))),
      cycles: this.http.get<any>('/api/dashboard/hr/cycles').pipe(catchError(() => of(null)))
    }).subscribe(results => {
      if (results.summary?.data) this.summary = results.summary.data;
      else this.error = 'Could not load dashboard. Is the backend running?';

      this.employees = results.employees?.data ?? [];
      this.cycles = results.cycles?.data ?? [];
      this.cdr.detectChanges();
    });
  }

  onCycleChange(): void {
    const empUrl = `/api/dashboard/hr/employees${this.selectedCycleId ? '?cycleId=' + this.selectedCycleId : ''}`;
    this.http.get<any>(empUrl).subscribe({
      next: r => { this.employees = r.data ?? []; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  viewForm(formId: number): void {
    this.selectedFormId = formId;
    this.http.get<any>(`/api/dashboard/hr/forms/${formId}`).subscribe({
      next: r => {
        this.selectedForm = r.data;
        this.parsedFormSections = this.parseFormData(r.data?.formData);
      },
      error: () => {}
    });
  }

  parseFormData(json: string): any[] {
    if (!json) return [];
    try {
      const data = typeof json === 'string' ? JSON.parse(json) : json;
      return this.flattenSection('', data);
    } catch { return []; }
  }

  /** Recursively flatten a form data object into displayable key-value pairs grouped by section. */
  private flattenSection(prefix: string, obj: any): any[] {
    if (obj === null || obj === undefined) return [];

    // Array of objects (e.g. keyResponsibilities, idp, goals)
    if (Array.isArray(obj)) {
      return obj.map((item, idx) => ({
        key: prefix ? `${prefix} ${idx + 1}` : `Item ${idx + 1}`,
        fields: this.flattenFields(item)
      }));
    }

    // Plain object — group top-level keys as sections
    return Object.entries(obj).map(([key, val]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
      if (Array.isArray(val)) {
        return {
          key: label,
          fields: (val as any[]).flatMap((item, idx) =>
            this.flattenFields(item).map(f => ({ key: `Item ${idx + 1} — ${f.key}`, value: f.value }))
          )
        };
      }
      if (val && typeof val === 'object') {
        return { key: label, fields: this.flattenFields(val) };
      }
      return { key: label, fields: [{ key: label, value: val ?? '—' }] };
    });
  }

  /** Flatten a single object into key-value pairs, handling one level of nesting. */
  private flattenFields(obj: any): { key: string; value: any }[] {
    if (!obj || typeof obj !== 'object') return [{ key: 'value', value: obj ?? '—' }];
    return Object.entries(obj).map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        // One more level (e.g. hrPolicy: { managerRating: 9 })
        const inner = Object.entries(v as object)
          .map(([ik, iv]) => `${ik}: ${iv}`)
          .join(', ');
        return { key: label, value: inner };
      }
      return { key: label, value: v ?? '—' };
    });
  }

  exportCsv(): void {
    const url = `/api/dashboard/hr/export${this.selectedCycleId ? '?cycleId=' + this.selectedCycleId : ''}`;
    window.open(url, '_blank');
  }

  get filteredEmployees(): any[] {
    return this.employees.filter(e =>
      (!this.searchText || e.employeeName?.toLowerCase().includes(this.searchText.toLowerCase())) &&
      (!this.filterStatus || e.status === this.filterStatus)
    );
  }

  countByStatus(status: string): number {
    return this.employees.filter(e => e.status === status).length;
  }

  statusLabel(status: string): string {
    const map: any = {
      'NOT_STARTED': 'Not Started',
      'SUBMITTED': 'Pending Review',
      'REVIEWED_AND_COMPLETED': 'Completed'
    };
    return map[status] || status;
  }
}
