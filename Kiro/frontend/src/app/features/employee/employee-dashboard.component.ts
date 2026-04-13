import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { DashboardService } from '../../core/services/dashboard.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatIconModule,
    MatButtonModule, MatChipsModule, MatProgressSpinnerModule, MatTableModule
  ],
  template: `
    <div class="dashboard-container">
      <h2 class="page-title">
        <mat-icon>person</mat-icon>
        Employee Dashboard
      </h2>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading dashboard...</p>
      </div>

      <div *ngIf="!loading" class="dashboard-content">
        <!-- Current Appraisal Card -->
        <mat-card class="current-form-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>assignment</mat-icon>
            <mat-card-title>Current Appraisal</mat-card-title>
            <mat-card-subtitle>Your active appraisal form</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="currentForm" class="form-info">
              <div class="form-status-row">
                <span class="label">Status:</span>
                <span class="status-chip" [ngClass]="'status-' + currentForm.status">
                  {{ formatStatus(currentForm.status) }}
                </span>
              </div>
              <div class="form-detail-row" *ngIf="currentForm.managerName">
                <span class="label">Manager:</span>
                <span>{{ currentForm.managerName }}</span>
              </div>
              <div class="form-detail-row" *ngIf="currentForm.submittedAt">
                <span class="label">Submitted:</span>
                <span>{{ formatDate(currentForm.submittedAt) }}</span>
              </div>
              <div class="form-detail-row" *ngIf="currentForm.reviewedAt">
                <span class="label">Reviewed:</span>
                <span>{{ formatDate(currentForm.reviewedAt) }}</span>
              </div>
            </div>
            <div *ngIf="!currentForm" class="no-form">
              <mat-icon>info</mat-icon>
              <p>No active appraisal form found. Your HR will trigger the appraisal cycle when ready.</p>
            </div>
          </mat-card-content>
          <mat-card-actions *ngIf="currentForm">
            <button mat-raised-button color="primary"
                    *ngIf="canEdit(currentForm)"
                    (click)="openForm(currentForm.id)">
              <mat-icon>edit</mat-icon>
              {{ currentForm.status === 'NOT_STARTED' ? 'Start Appraisal' : 'Continue Editing' }}
            </button>
            <button mat-stroked-button
                    *ngIf="!canEdit(currentForm)"
                    (click)="openForm(currentForm.id, true)">
              <mat-icon>visibility</mat-icon>
              View Form
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- History Card -->
        <mat-card class="history-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>history</mat-icon>
            <mat-card-title>Appraisal History</mat-card-title>
            <mat-card-subtitle>All your appraisal records</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="historicalForms.length === 0" class="no-form">
              <p>No appraisal records found yet.</p>
            </div>
            <table mat-table [dataSource]="historicalForms" *ngIf="historicalForms.length > 0" class="history-table">
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let form">
                  <span class="status-chip" [ngClass]="'status-' + form.status">
                    {{ formatStatus(form.status) }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="submittedAt">
                <th mat-header-cell *matHeaderCellDef>Submitted</th>
                <td mat-cell *matCellDef="let form">{{ formatDate(form.submittedAt) }}</td>
              </ng-container>
              <ng-container matColumnDef="reviewedAt">
                <th mat-header-cell *matHeaderCellDef>Reviewed</th>
                <td mat-cell *matCellDef="let form">{{ formatDate(form.reviewedAt) }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let form">
                  <button mat-icon-button color="primary" (click)="openForm(form.id, true)"
                          matTooltip="View">
                    <mat-icon>visibility</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="historyColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: historyColumns;"></tr>
            </table>
          </mat-card-content>
          <mat-card-actions *ngIf="historicalForms.length > 0">
            <button mat-stroked-button routerLink="/employee/history">
              <mat-icon>list</mat-icon>
              View Full History
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 960px; margin: 0 auto; }
    .page-title { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; color: #333; }
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .dashboard-content { display: flex; flex-direction: column; gap: 24px; }
    .form-info { padding: 16px 0; }
    .form-status-row, .form-detail-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
    .label { font-weight: 500; color: #666; min-width: 100px; }
    .status-chip {
      padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; text-transform: uppercase;
    }
    .status-NOT_STARTED { background: #e0e0e0; color: #616161; }
    .status-DRAFT_SAVED { background: #fff3e0; color: #e65100; }
    .status-SUBMITTED { background: #e3f2fd; color: #1565c0; }
    .status-UNDER_REVIEW { background: #e8f5e9; color: #2e7d32; }
    .status-REVIEW_DRAFT_SAVED { background: #f3e5f5; color: #7b1fa2; }
    .status-REVIEWED_AND_COMPLETED { background: #e8f5e9; color: #1b5e20; }
    .no-form { display: flex; align-items: center; gap: 8px; padding: 24px 0; color: #888; }
    .history-table { width: 100%; }
    mat-card-actions { padding: 8px 16px; }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  loading = true;
  currentForm: any = null;
  historicalForms: any[] = [];
  historyColumns = ['status', 'submittedAt', 'reviewedAt', 'actions'];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dashboardService.getEmployeeDashboard().subscribe({
      next: (response: any) => {
        const data = response.data;
        this.currentForm = data?.currentForm || null;
        this.historicalForms = data?.historicalForms || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  canEdit(form: any): boolean {
    return form.status === 'NOT_STARTED' || form.status === 'DRAFT_SAVED';
  }

  openForm(formId: number, readonly = false): void {
    this.router.navigate(['/employee/appraisal', formId], {
      queryParams: readonly ? { readonly: true } : {}
    });
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.replace(/_/g, ' ').toLowerCase()
      .split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
