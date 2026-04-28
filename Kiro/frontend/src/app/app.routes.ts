import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [

  // Default redirect
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Public: Login
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },

  // ── Employee ──────────────────────────────────────────────────────────────
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
    loadComponent: () => import('./features/employee/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
  },
  {
    path: 'employee/appraisal/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
    loadComponent: () => import('./features/employee/self-appraisal-form.component').then(m => m.SelfAppraisalFormComponent)
  },
  {
    path: 'employee/history',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
    loadComponent: () => import('./features/employee/historical-forms-viewer.component').then(m => m.HistoricalFormsViewerComponent)
  },

  // ── Manager ───────────────────────────────────────────────────────────────
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] },
    loadComponent: () => import('./features/manager/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
  },
  {
    path: 'manager/appraisal/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] },
    loadComponent: () => import('./features/manager/manager-self-appraisal.component').then(m => m.ManagerSelfAppraisalComponent)
  },
  {
    path: 'manager/review/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] },
    loadComponent: () => import('./features/manager/review-form.component').then(m => m.ReviewFormComponent)
  },
  {
    path: 'manager/team',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] },
    loadComponent: () => import('./features/manager/team-appraisal-list.component').then(m => m.TeamAppraisalListComponent)
  },

  // ── HR ────────────────────────────────────────────────────────────────────
  {
    path: 'hr',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/hr-dashboard.component').then(m => m.HrDashboardComponent)
  },
  {
    path: 'hr/cycles',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/cycle-dashboard/cycle-dashboard.component').then(m => m.CycleDashboardComponent)
  },
  {
    path: 'hr/cycles/create',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR'] },
    loadComponent: () => import('./features/hr/cycle-create/cycle-create.component').then(m => m.CycleCreateComponent)
  },
  {
    path: 'hr/cycles/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/cycle-details/cycle-details.component').then(m => m.CycleDetailsComponent)
  },
  {
    path: 'hr/cycles/:id/trigger',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR'] },
    loadComponent: () => import('./features/hr/cycle-trigger/cycle-trigger.component').then(m => m.CycleTriggerComponent)
  },
  {
    path: 'hr/templates',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/template-list/template-list.component').then(m => m.TemplateListComponent)
  },
  {
    path: 'hr/templates/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/template-viewer/template-viewer.component').then(m => m.TemplateViewerComponent)
  },

  // ── Phase 4: HR Notification & Reporting ─────────────────────────────────
  {
    path: 'hr/notifications/logs',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/notification-log-viewer.component').then(m => m.NotificationLogViewerComponent)
  },
  {
    path: 'hr/notifications/templates',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/notification-template-list.component').then(m => m.NotificationTemplateListComponent)
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  {
    path: 'admin/users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/admin/user-management-dashboard.component').then(m => m.UserManagementDashboardComponent)
  },
  {
    path: 'admin/audit-logs',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/admin/audit-log-viewer.component').then(m => m.AuditLogViewerComponent)
  },

  // Catch-all — MUST be last
  {
    path: '**',
    redirectTo: '/login'
  }
];
