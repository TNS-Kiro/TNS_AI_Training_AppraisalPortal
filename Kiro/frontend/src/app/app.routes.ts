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
  {
    path: 'manager',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['MANAGER'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/manager/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'review/:id',
        loadComponent: () => import('./features/manager/review-form.component').then(m => m.ReviewFormComponent)
      },
      {
        path: 'appraisal/:id',
        loadComponent: () => import('./features/manager/manager-self-appraisal.component').then(m => m.ManagerSelfAppraisalComponent)
      }
    ]
  },
  {
    path: 'employee',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['EMPLOYEE'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/employee/employee-dashboard.component').then(m => m.EmployeeDashboardComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/employee/historical-forms-viewer.component').then(m => m.HistoricalFormsViewerComponent)
      },
      {
        path: 'appraisal/:id',
        loadComponent: () => import('./features/employee/self-appraisal-form.component').then(m => m.SelfAppraisalFormComponent)
      }
    ]
  }
];
