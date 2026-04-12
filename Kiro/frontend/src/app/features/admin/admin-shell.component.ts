import { Component, inject } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { AsyncPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    AsyncPipe,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule
  ],
  template: `
    <mat-sidenav-container class="shell-container">

      <!-- Sidebar -->
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon class="brand-icon">admin_panel_settings</mat-icon>
          <span class="brand-name">TNS Appraisal</span>
        </div>

        <mat-divider></mat-divider>

        <mat-nav-list class="nav-list">
          @for (item of navItems; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active-link"
               [routerLinkActiveOptions]="{ exact: false }">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">

        <!-- Top toolbar -->
        <mat-toolbar color="primary" class="toolbar">
          <span class="toolbar-title">Admin Portal</span>
          <span class="spacer"></span>

          @if (currentUser$ | async; as user) {
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
              <mat-icon>account_circle</mat-icon>
              <span class="user-name">{{ user.fullName }}</span>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item disabled>
                <mat-icon>badge</mat-icon>
                <span>{{ user.employeeId }}</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="onLogout()">
                <mat-icon>logout</mat-icon>
                <span>Logout</span>
              </button>
            </mat-menu>
          } @else {
            <button mat-icon-button (click)="onLogout()" matTooltip="Logout">
              <mat-icon>logout</mat-icon>
            </button>
          }
        </mat-toolbar>

        <!-- Routed page content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>

      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container {
      height: 100vh;
    }

    .sidenav {
      width: 220px;
      background: #0A1628;
      color: white;
    }

    .sidenav-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 16px 16px;

      .brand-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #F59E0B;
      }

      .brand-name {
        font-size: 1.1rem;
        font-weight: 600;
        color: white;
        letter-spacing: 0.3px;
      }
    }

    .nav-list {
      padding-top: 8px;

      a {
        color: rgba(255, 255, 255, 0.8);
        border-radius: 0 24px 24px 0;
        margin-right: 12px;
        margin-bottom: 2px;

        mat-icon {
          color: rgba(255, 255, 255, 0.7);
        }

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          mat-icon { color: white; }
        }

        &.active-link {
          background: rgba(245, 158, 11, 0.2);
          color: #F59E0B;
          font-weight: 600;
          mat-icon { color: #F59E0B; }
        }
      }
    }

    .main-content {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      flex-shrink: 0;
      background: #0F2240 !important;

      .toolbar-title {
        font-size: 1rem;
        font-weight: 500;
      }

      .spacer { flex: 1; }

      .user-btn {
        display: flex;
        align-items: center;
        gap: 6px;

        .user-name {
          font-size: 0.875rem;
        }
      }
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      background: #F8FAFD;
    }
  `]
})
export class AdminShellComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser$ = this.authService.currentUser$;

  navItems: NavItem[] = [
    { label: 'User Management', icon: 'people',              route: '/admin/users' },
    { label: 'Audit Logs',      icon: 'history',             route: '/admin/audit' },
  ];

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
