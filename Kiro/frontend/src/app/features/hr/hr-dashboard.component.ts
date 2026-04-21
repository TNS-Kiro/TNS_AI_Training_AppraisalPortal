import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hr-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="dashboard-container">
      <h2 class="page-title">
        <mat-icon>groups</mat-icon>
        HR Dashboard
      </h2>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Loading...</p>
      </div>

      <div *ngIf="!loading" class="dashboard-grid">
        <!-- Cycle Management Card -->
        <mat-card class="action-card" routerLink="/hr/cycles">
          <mat-card-header>
            <mat-icon mat-card-avatar color="primary">event</mat-icon>
            <mat-card-title>Cycle Management</mat-card-title>
            <mat-card-subtitle>Create and manage appraisal cycles</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-row">
              <span class="stat-value">{{ stats.totalCycles }}</span>
              <span class="stat-label">Total Cycles</span>
            </div>
            <div class="stat-row">
              <span class="stat-value active">{{ stats.activeCycles }}</span>
              <span class="stat-label">Active</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" routerLink="/hr/cycles">
              <mat-icon>open_in_new</mat-icon> Manage Cycles
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Templates Card -->
        <mat-card class="action-card" routerLink="/hr/templates">
          <mat-card-header>
            <mat-icon mat-card-avatar color="accent">description</mat-icon>
            <mat-card-title>Appraisal Templates</mat-card-title>
            <mat-card-subtitle>Manage form templates</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-row">
              <span class="stat-value">{{ stats.totalTemplates }}</span>
              <span class="stat-label">Templates</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="accent" routerLink="/hr/templates">
              <mat-icon>open_in_new</mat-icon> View Templates
            </button>
          </mat-card-actions>
        </mat-card>

        <!-- Appraisal Overview Card -->
        <mat-card class="action-card" routerLink="/employee/history">
          <mat-card-header>
            <mat-icon mat-card-avatar>assignment</mat-icon>
            <mat-card-title>Appraisal Overview</mat-card-title>
            <mat-card-subtitle>View all employee appraisals</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-row">
              <span class="stat-value">{{ stats.totalForms }}</span>
              <span class="stat-label">Total Forms</span>
            </div>
            <div class="stat-row">
              <span class="stat-value completed">{{ stats.completedForms }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-stroked-button routerLink="/employee/history">
              <mat-icon>visibility</mat-icon> View All
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .page-title { display: flex; align-items: center; gap: 8px; margin-bottom: 24px; color: #333; }
    .loading-container { display: flex; flex-direction: column; align-items: center; padding: 48px; gap: 16px; }
    .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
    .action-card { cursor: pointer; transition: box-shadow 0.2s; }
    .action-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
    .stat-row { display: flex; align-items: baseline; gap: 8px; padding: 4px 0; }
    .stat-value { font-size: 28px; font-weight: 700; color: #1976d2; }
    .stat-value.active { color: #f59e0b; }
    .stat-value.completed { color: #4caf50; }
    .stat-label { font-size: 14px; color: #666; }
    mat-card-actions { padding: 8px 16px 16px; }
  `]
})
export class HrDashboardComponent implements OnInit {
  loading = true;
  stats = { totalCycles: 0, activeCycles: 0, totalTemplates: 0, totalForms: 0, completedForms: 0 };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Load summary stats in parallel
    Promise.all([
      this.http.get<any>(`${environment.apiUrl}/cycles`).toPromise().catch(() => ({ data: [] })),
      this.http.get<any>(`${environment.apiUrl}/templates`).toPromise().catch(() => ({ data: [] })),
      this.http.get<any>(`${environment.apiUrl}/forms/history`).toPromise().catch(() => ({ data: [] }))
    ]).then(([cycles, templates, forms]) => {
      const cycleList = cycles?.data || [];
      const templateList = templates?.data || [];
      const formList = forms?.data || [];
      this.stats = {
        totalCycles: cycleList.length,
        activeCycles: cycleList.filter((c: any) => c.status === 'ACTIVE').length,
        totalTemplates: templateList.length,
        totalForms: formList.length,
        completedForms: formList.filter((f: any) => f.status === 'REVIEWED_AND_COMPLETED').length
      };
      this.loading = false;
    });
  }
}
