import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification-log-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:24px;font-family:sans-serif;">
      <h1 style="margin:0 0 24px;color:#1e293b;">Email Notification Logs</h1>

      <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:20px;margin-bottom:24px;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;">
          <div>
            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:500;color:#374151;">Recipient Email</label>
            <input [(ngModel)]="filters.recipientEmail" placeholder="Search by email"
              style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;box-sizing:border-box;" />
          </div>
          <div>
            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:500;color:#374151;">Trigger Event</label>
            <select [(ngModel)]="filters.triggerEvent"
              style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;">
              <option [ngValue]="null">All Events</option>
              <option value="CYCLE_TRIGGERED">Cycle Triggered</option>
              <option value="FORM_SUBMITTED">Form Submitted</option>
              <option value="REVIEW_COMPLETED">Review Completed</option>
            </select>
          </div>
          <div>
            <label style="display:block;margin-bottom:6px;font-size:13px;font-weight:500;color:#374151;">Status</label>
            <select [(ngModel)]="filters.status"
              style="width:100%;padding:8px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;">
              <option [ngValue]="null">All Statuses</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div style="display:flex;align-items:flex-end;gap:8px;">
            <button (click)="search()" style="background:#6366f1;color:white;border:none;padding:9px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Search</button>
            <button (click)="clearFilters()" style="background:#f1f5f9;color:#374151;border:1px solid #e2e8f0;padding:9px 20px;border-radius:6px;cursor:pointer;font-size:14px;">Clear</button>
          </div>
        </div>
      </div>

      <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#f8fafc;">
              <th style="text-align:left;padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Recipient</th>
              <th style="text-align:left;padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Event</th>
              <th style="text-align:left;padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Subject</th>
              <th style="text-align:left;padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Status</th>
              <th style="text-align:left;padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;border-bottom:1px solid #e2e8f0;">Sent At</th>
            </tr>
          </thead>
          <tbody>
            @for (log of logs; track log.id) {
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 16px;font-size:14px;color:#334155;">{{ log.recipientEmail }}</td>
                <td style="padding:12px 16px;font-size:14px;color:#334155;">{{ log.triggerEvent }}</td>
                <td style="padding:12px 16px;font-size:14px;color:#334155;">{{ log.subject }}</td>
                <td style="padding:12px 16px;">
                  <span [style.background]="log.status === 'SENT' ? '#dcfce7' : '#fee2e2'"
                        [style.color]="log.status === 'SENT' ? '#16a34a' : '#dc2626'"
                        style="padding:3px 10px;border-radius:999px;font-size:12px;font-weight:600;">
                    {{ log.status }}
                  </span>
                </td>
                <td style="padding:12px 16px;font-size:14px;color:#334155;">{{ log.sentAt | date:'short' }}</td>
              </tr>
            }
            @if (logs.length === 0) {
              <tr><td colspan="5" style="padding:32px;text-align:center;color:#94a3b8;">No logs found</td></tr>
            }
          </tbody>
        </table>
        <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e2e8f0;font-size:13px;color:#64748b;">
          <span>Total: {{ totalElements }} records</span>
          <div style="display:flex;gap:8px;">
            <button (click)="prevPage()" [disabled]="pageIndex === 0"
              style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:white;">← Prev</button>
            <span style="padding:6px 14px;">Page {{ pageIndex + 1 }}</span>
            <button (click)="nextPage()" [disabled]="(pageIndex + 1) * pageSize >= totalElements"
              style="padding:6px 14px;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;background:white;">Next →</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationLogViewerComponent implements OnInit {
  logs: any[] = [];
  filters = { recipientEmail: null as string | null, triggerEvent: null as string | null, status: null as string | null };
  pageSize = 25;
  pageIndex = 0;
  totalElements = 0;

  constructor(private notificationService: NotificationService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.search(); }

  search(): void {
    this.notificationService.searchNotificationLogs(
      this.filters.recipientEmail, this.filters.triggerEvent, this.filters.status, this.pageIndex, this.pageSize
    ).subscribe({
      next: (r) => { this.logs = r.data?.content ?? []; this.totalElements = r.data?.totalElements ?? 0; this.cdr.detectChanges(); },
      error: () => { this.logs = []; this.cdr.detectChanges(); }
    });
  }

  clearFilters(): void {
    this.filters = { recipientEmail: null, triggerEvent: null, status: null };
    this.pageIndex = 0;
    this.search();
  }

  prevPage(): void { if (this.pageIndex > 0) { this.pageIndex--; this.search(); } }
  nextPage(): void { this.pageIndex++; this.search(); }
}
