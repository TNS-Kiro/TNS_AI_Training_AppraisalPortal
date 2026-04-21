import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { UserProfile } from '../../../core/models/user.model';

interface NavSection {
  heading?: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  icon: string;
  route: string;
  /** Roles that can see this item. Empty = all authenticated users. */
  roles: string[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    heading: 'My Appraisal',
    items: [
      { label: 'My Dashboard',      icon: 'person',              route: '/employee',         roles: ['EMPLOYEE'] },
      { label: 'My Appraisal',      icon: 'person',              route: '/employee',         roles: ['MANAGER'] },
      { label: 'Appraisal History', icon: 'history',             route: '/employee/history', roles: ['EMPLOYEE', 'MANAGER'] },
    ]
  },
  {
    heading: 'Team',
    items: [
      { label: 'Manager Dashboard', icon: 'supervisor_account',  route: '/manager',          roles: ['MANAGER'] },
      { label: 'Team Appraisals',   icon: 'group',               route: '/manager/team',     roles: ['MANAGER'] },
    ]
  },
  {
    heading: 'HR',
    items: [
      { label: 'HR Dashboard',      icon: 'groups',              route: '/hr',               roles: ['HR'] },
      { label: 'Cycle Management',  icon: 'event',               route: '/hr/cycles',        roles: ['HR', 'ADMIN'] },
      { label: 'Templates',         icon: 'description',         route: '/hr/templates',     roles: ['HR', 'ADMIN'] },
      { label: 'View Appraisals',   icon: 'assignment',          route: '/employee/history', roles: ['HR'] },
    ]
  },
  {
    heading: 'Administration',
    items: [
      { label: 'User Management',   icon: 'admin_panel_settings', route: '/admin/users',      roles: ['ADMIN'] },
      { label: 'Audit Logs',        icon: 'history',              route: '/admin/audit-logs', roles: ['ADMIN'] },
      { label: 'Cycle Management',  icon: 'event',                route: '/hr/cycles',        roles: ['ADMIN'] },
      { label: 'Templates',         icon: 'description',          route: '/hr/templates',     roles: ['ADMIN'] },
    ]
  }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatDividerModule],
  template: `
    <nav class="sidebar-nav">
      <div class="nav-header">
        <mat-icon class="nav-logo">assessment</mat-icon>
        <span class="nav-brand">TNS Appraisal</span>
      </div>

      @for (section of visibleSections(); track section.heading) {
        @if (section.heading) {
          <div class="nav-section-heading">{{ section.heading }}</div>
        }
        <mat-nav-list class="nav-section-list">
          @for (item of section.items; track item.route) {
            <a mat-list-item
               [routerLink]="item.route"
               routerLinkActive="active"
               [routerLinkActiveOptions]="{ exact: item.route === '/employee' || item.route === '/manager' || item.route === '/hr' }">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
        <mat-divider class="section-divider"></mat-divider>
      }
    </nav>
  `,
  styles: [`
    .sidebar-nav {
      height: 100%;
      background: linear-gradient(180deg, var(--color-primary-900, #0A1628) 0%, var(--color-primary-800, #0F2240) 100%);
      color: white;
      overflow-y: auto;
    }

    .nav-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .nav-logo {
      color: var(--color-accent-400, #FBBF24);
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .nav-brand {
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: -0.02em;
      color: #fff;
    }

    .nav-section-heading {
      padding: 0.75rem 1rem 0.25rem;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.4);
    }

    .nav-section-list {
      padding: 0 !important;
    }

    .section-divider {
      border-color: rgba(255,255,255,0.07) !important;
      margin: 4px 0;
    }

    :host ::ng-deep .mat-mdc-nav-list {
      --mdc-list-list-item-label-text-color: rgba(255,255,255,0.78);
    }

    :host ::ng-deep a.mat-mdc-list-item {
      color: rgba(255,255,255,0.78) !important;
      margin: 1px 8px;
      border-radius: 8px;
      text-decoration: none;
    }

    :host ::ng-deep a.mat-mdc-list-item:hover {
      background-color: rgba(255,255,255,0.08);
      color: #fff !important;
    }

    :host ::ng-deep a.mat-mdc-list-item.active {
      background-color: rgba(245,158,11,0.15);
      color: var(--color-accent-400, #FBBF24) !important;
      border-left: 3px solid var(--color-accent-500, #F59E0B);
    }

    :host ::ng-deep a.mat-mdc-list-item .mat-icon,
    :host ::ng-deep a.mat-mdc-list-item .mdc-list-item__primary-text,
    :host ::ng-deep a.mat-mdc-list-item .mat-mdc-list-item-title,
    :host ::ng-deep a.mat-mdc-list-item .mdc-list-item__start {
      color: inherit !important;
    }
  `]
})
export class SidebarComponent {
  user = input<UserProfile | null>(null);

  visibleSections = computed(() => {
    const currentUser = this.user();
    if (!currentUser) return [];

    const userRoles = currentUser.roles;

    return NAV_SECTIONS
      .map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.roles.length === 0 || item.roles.some(r => userRoles.includes(r))
        )
      }))
      .filter(section => section.items.length > 0);
  });
}
