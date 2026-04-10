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
  {
    path: 'admin',
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
  {
    path: 'hr',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/hr-dashboard.component').then(m => m.HrDashboardComponent)
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
  {
    path: 'hr/cycles',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/cycle-dashboard/cycle-dashboard.component').then(m => m.CycleDashboardComponent)
  },
  {
    path: 'hr/cycles/create',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/cycle-create/cycle-create.component').then(m => m.CycleCreateComponent)
  },
  {
    path: 'hr/cycles/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    loadComponent: () => import('./features/hr/cycle-details/cycle-details.component').then(m => m.CycleDetailsComponent)
  },
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER', 'ADMIN'] },
    loadComponent: () => import('./features/manager/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
  },
  {
    path: 'employee',
    canActivate: [authGuard],
    loadComponent: () => import('./features/employee/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
