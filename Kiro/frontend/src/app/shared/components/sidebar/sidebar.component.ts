import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { User } from '../../../core/models/user.model';

interface MenuItemConfig {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
  template: `
    <p-menu [model]="visibleMenuItems" styleClass="sidebar-menu"></p-menu>
  `,
  styles: [`
    :host ::ng-deep .sidebar-menu {
      width: 100%;
      border: none;
    }
    :host ::ng-deep .sidebar-menu .p-menuitem-link {
      padding: 1rem;
    }
    :host ::ng-deep .sidebar-menu .p-menuitem-link.router-link-active {
      background-color: var(--primary-color);
      color: white;
    }
  `]
})
export class SidebarComponent {
  @Input() user: User | null = null;

  private menuItemsConfig: MenuItemConfig[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard', roles: ['EMPLOYEE', 'MANAGER', 'HR', 'ADMIN'] },
    { label: 'My Appraisal', icon: 'pi pi-file', route: '/employee/appraisal', roles: ['EMPLOYEE', 'MANAGER'] },
    { label: 'Team Reviews', icon: 'pi pi-users', route: '/manager/reviews', roles: ['MANAGER'] },
    { label: 'Cycle Management', icon: 'pi pi-calendar', route: '/hr/cycles', roles: ['HR'] },
    { label: 'User Management', icon: 'pi pi-user-edit', route: '/admin/users', roles: ['ADMIN'] },
    { label: 'Audit Logs', icon: 'pi pi-history', route: '/admin/audit', roles: ['ADMIN'] }
  ];

  get visibleMenuItems(): MenuItem[] {
    if (!this.user) return [];
    
    const userRoles = this.user.roles.map(r => r.name);
    return this.menuItemsConfig
      .filter(item => item.roles.some(role => userRoles.includes(role as any)))
      .map(item => ({
        label: item.label,
        icon: item.icon,
        routerLink: item.route,
        routerLinkActiveOptions: { exact: false }
      }));
  }
}
