import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },

  // Employee routes
  {
    path: 'employee',
    loadComponent: () => import('./features/employee/employee-dashboard.component').then(m => m.EmployeeDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYEE', 'MANAGER'] }
  },
  {
    path: 'employee/appraisal/:id',
    loadComponent: () => import('./features/employee/self-appraisal-form.component').then(m => m.SelfAppraisalFormComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] }
  },
  {
    path: 'employee/history',
    loadComponent: () => import('./features/employee/historical-forms-viewer.component').then(m => m.HistoricalFormsViewerComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] }
  },

  // Manager routes
  {
    path: 'manager',
    loadComponent: () => import('./features/manager/manager-dashboard.component').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] }
  },
  {
    path: 'manager/appraisal/:id',
    loadComponent: () => import('./features/manager/manager-self-appraisal.component').then(m => m.ManagerSelfAppraisalComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] }
  },
  {
    path: 'manager/review/:id',
    loadComponent: () => import('./features/manager/review-form.component').then(m => m.ReviewFormComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] }
  },

  // Admin routes
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/user-management-dashboard.component').then(m => m.UserManagementDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/audit-logs',
    loadComponent: () => import('./features/admin/audit-log-viewer.component').then(m => m.AuditLogViewerComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },

  // Phase 2: HR template routes
  {
    path: 'hr/templates',
    loadComponent: () => import('./features/hr/template-list/template-list.component').then(m => m.TemplateListComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] }
  },
  {
    path: 'hr/templates/:id',
    loadComponent: () => import('./features/hr/template-viewer/template-viewer.component').then(m => m.TemplateViewerComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] }
  },

  // Phase 2: HR cycle routes
  {
    path: 'hr/cycles',
    loadComponent: () => import('./features/hr/cycle-dashboard/cycle-dashboard.component').then(m => m.CycleDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] }
  },
  {
    path: 'hr/cycles/create',
    loadComponent: () => import('./features/hr/cycle-create/cycle-create.component').then(m => m.CycleCreateComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR'] }
  },
  {
    path: 'hr/cycles/:id',
    loadComponent: () => import('./features/hr/cycle-details/cycle-details.component').then(m => m.CycleDetailsComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] }
  },
  {
    path: 'hr/cycles/:id/trigger',
    loadComponent: () => import('./features/hr/cycle-trigger/cycle-trigger.component').then(m => m.CycleTriggerComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR'] }
  },

  // Catch-all redirect
  {
    path: '**',
    redirectTo: '/login'
  }
];
