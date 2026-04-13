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
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatIconModule,
    MatButtonModule, MatChipsModule, MatProgressSpinnerModule, MatTableModule
  ],
  template: `
    <div class="dashboard-container">
      <h2 class="page-title">
        <mat-icon>supervisor_account</mat-icon>
        Manager Dashboard
      </h2>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading dashboard...</p>
      </div>

      <div *ngIf="!loading" class="dashboard-content">
        <!-- Stats Row -->
        <div class="stats-row">
          <mat-card class="stat-card">
            <div class="stat-value">{{ pendingReviews }}</div>
            <div class="stat-label">Pending Reviews</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-value">{{ completedReviews }}</div>
            <div class="stat-label">Completed</div>
          </mat-card>
          <mat-card class="stat-card">
            <div class="stat-value">{{ completionPercentage }}%</div>
            <div class="stat-label">Completion</div>
          </mat-card>
        </div>

        <!-- Own Appraisal Card -->
        <mat-card class="own-form-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>assignment_ind</mat-icon>
            <mat-card-title>Your Self-Appraisal</mat-card-title>
            <mat-card-subtitle>Your own appraisal form</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="ownForm" class="form-info">
              <div class="form-status-row">
                <span class="label">Status:</span>
                <span class="status-chip" [ngClass]="'status-' + ownForm.status">
                  {{ formatStatus(ownForm.status) }}
                </span>
              </div>
            </div>
            <div *ngIf="!ownForm" class="no-form">
              <mat-icon>info</mat-icon>
              <p>No active self-appraisal form found.</p>
            </div>
          </mat-card-content>
          <mat-card-actions *ngIf="ownForm">
            <button mat-raised-button color="primary"
                    *ngIf="canEditOwn(ownForm)"
                    (click)="openOwnForm(ownForm.id)">
              <mat-icon>edit</mat-icon>
              {{ ownForm.status === 'NOT_STARTED' ? 'Start Appraisal' : 'Continue Editing' }}
            </button>
            <button mat-stroked-button
                    *ngIf="!canEditOwn(ownForm)"
                    (click)="openOwnForm(ownForm.id, true)">
              <mat-icon>visibility</mat-icon>
              View Form
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Team Forms Card -->
        <mat-card class="team-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>group</mat-icon>
            <mat-card-title>Team Appraisals</mat-card-title>
            <mat-card-subtitle>Direct reportees' appraisal status</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="teamForms.length === 0" class="no-form">
              <p>No team appraisal forms found.</p>
            </div>
            <table mat-table [dataSource]="teamForms" *ngIf="teamForms.length > 0" class="team-table">
              <ng-container matColumnDef="employeeName">
                <th mat-header-cell *matHeaderCellDef>Employee</th>
                <td mat-cell *matCellDef="let form">{{ form.employeeName || 'Employee #' + form.employeeId }}</td>
              </ng-container>
              <ng-container matColumnDef="employeeCode">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let form">{{ form.employeeCode || '-' }}</td>
              </ng-container>
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
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let form">
                  <button mat-raised-button color="primary" *ngIf="canReview(form)"
                          (click)="reviewForm(form.id)">
                    <mat-icon>rate_review</mat-icon> Review
                  </button>
                  <button mat-stroked-button *ngIf="!canReview(form)"
                          (click)="viewTeamForm(form.id)">
                    <mat-icon>visibility</mat-icon> View
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="teamColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: teamColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-title { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; color: #333; }
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .dashboard-content { display: flex; flex-direction: column; gap: 24px; }
    .stats-row { display: flex; gap: 16px; }
    .stat-card { flex: 1; text-align: center; padding: 24px; }
    .stat-value { font-size: 32px; font-weight: 700; color: #1976d2; }
    .stat-label { font-size: 14px; color: #666; margin-top: 4px; }
    .form-info { padding: 16px 0; }
    .form-status-row { display: flex; align-items: center; gap: 12px; padding: 6px 0; }
    .label { font-weight: 500; color: #666; min-width: 80px; }
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
    .team-table { width: 100%; }
    mat-card-actions { padding: 8px 16px; }
  `]
})
export class ManagerDashboardComponent implements OnInit {
  loading = true;
  ownForm: any = null;
  teamForms: any[] = [];
  pendingReviews = 0;
  completedReviews = 0;
  completionPercentage = 0;
  teamColumns = ['employeeName', 'employeeCode', 'status', 'submittedAt', 'actions'];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.dashboardService.getManagerDashboard().subscribe({
      next: (response: any) => {
        const data = response.data;
        this.ownForm = data?.ownForm || null;
        this.teamForms = data?.teamForms || [];
        this.pendingReviews = data?.pendingReviews || 0;
        this.completedReviews = data?.completedReviews || 0;
        this.completionPercentage = data?.completionPercentage || 0;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  canEditOwn(form: any): boolean {
    return form.status === 'NOT_STARTED' || form.status === 'DRAFT_SAVED';
  }

  canReview(form: any): boolean {
    return form.status === 'SUBMITTED' ||
           form.status === 'UNDER_REVIEW' ||
           form.status === 'REVIEW_DRAFT_SAVED';
  }

  openOwnForm(formId: number, readonly = false): void {
    this.router.navigate(['/manager/appraisal', formId], {
      queryParams: readonly ? { readonly: true } : {}
    });
  }

  reviewForm(formId: number): void {
    this.router.navigate(['/manager/review', formId]);
  }

  viewTeamForm(formId: number): void {
    this.router.navigate(['/manager/review', formId], {
      queryParams: { readonly: true }
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
