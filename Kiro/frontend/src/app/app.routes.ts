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
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // HR section — wrapped in shell layout with sidebar
  {
    path: 'hr',
    loadComponent: () => import('./features/hr/hr-shell.component').then(m => m.HrShellComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['HR', 'ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'templates',
        pathMatch: 'full'
      },
      {
        path: 'templates',
        loadComponent: () => import('./features/hr/template-list/template-list.component').then(m => m.TemplateListComponent)
      },
      {
        path: 'templates/:id',
        loadComponent: () => import('./features/hr/template-viewer/template-viewer.component').then(m => m.TemplateViewerComponent)
      },
      {
        path: 'cycles',
        loadComponent: () => import('./features/hr/cycle-dashboard/cycle-dashboard.component').then(m => m.CycleDashboardComponent)
      },
      {
        path: 'cycles/create',
        loadComponent: () => import('./features/hr/cycle-create/cycle-create.component').then(m => m.CycleCreateComponent)
      },
      {
        path: 'cycles/:id/trigger',
        loadComponent: () => import('./features/hr/cycle-trigger/cycle-trigger.component').then(m => m.CycleTriggerComponent)
      },
      {
        path: 'cycles/:id',
        loadComponent: () => import('./features/hr/cycle-details/cycle-details.component').then(m => m.CycleDetailsComponent)
      }
    ]
  },

  // Admin section — wrapped in shell layout with sidebar
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-shell.component').then(m => m.AdminShellComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/user-management-dashboard.component').then(m => m.UserManagementDashboardComponent)
      },
      {
        path: 'audit',
        loadComponent: () => import('./features/admin/audit-log-viewer.component').then(m => m.AuditLogViewerComponent)
      }
    ]
  }
];
