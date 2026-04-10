import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { environment } from '../environments/environment';

export const routes: Routes = [
  {
    path: '',
    redirectTo: environment.devBypassAuth ? '/hr/dashboard' : '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'hr/dashboard',
    loadComponent: () => import('./features/hr/hr-dashboard.component').then(m => m.HrDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'hr/notifications/logs',
    loadComponent: () => import('./features/hr/notification-log-viewer.component').then(m => m.NotificationLogViewerComponent),
    canActivate: [authGuard]
  },
  {
    path: 'hr/notifications/templates',
    loadComponent: () => import('./features/hr/notification-template-list.component').then(m => m.NotificationTemplateListComponent),
    canActivate: [authGuard]
  }
];
