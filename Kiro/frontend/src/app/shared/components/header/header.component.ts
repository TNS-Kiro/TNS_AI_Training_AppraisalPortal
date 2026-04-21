import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { UserProfile } from '../../../core/models/user.model';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  user = input<UserProfile | null>(null);
  menuToggle = output<void>();
  logout = output<void>();

  getPrimaryRole(): string {
    const u = this.user();
    if (!u || !u.roles || u.roles.length === 0) return '';
    const priority = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
    for (const role of priority) {
      if (u.roles.includes(role)) return role;
    }
    return u.roles[0];
  }

  getRoleBadges(): string[] {
    const u = this.user();
    return u?.roles || [];
  imports: [CommonModule, ToolbarModule, ButtonModule, MenuModule],
  template: `
    <p-toolbar styleClass="header-toolbar">
      <ng-template pTemplate="start">
        <p-button icon="pi pi-bars" (onClick)="menuToggle.emit()" 
                  [text]="true" [rounded]="true"></p-button>
        <span class="title">Employee Appraisal System</span>
      </ng-template>
      <ng-template pTemplate="end">
        @if (user) {
          <p-button [label]="user.fullName" icon="pi pi-user" 
                    (onClick)="userMenu.toggle($event)" 
                    [text]="true"></p-button>
          <p-menu #userMenu [model]="menuItems" [popup]="true"></p-menu>
        }
      </ng-template>
    </p-toolbar>
  `,
  styles: [`
    .title {
      font-size: 1.2rem;
      margin-left: 1rem;
      font-weight: 500;
    }
    :host ::ng-deep .header-toolbar {
      background: var(--primary-color);
      color: white;
    }
    :host ::ng-deep .header-toolbar .p-button {
      color: white;
    }
  `]
})
export class HeaderComponent {
  @Input() user: User | null = null;
  @Output() menuToggle = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  get menuItems(): MenuItem[] {
    if (!this.user) return [];
    
    return [
      {
        label: this.user.designation,
        icon: 'pi pi-id-card',
        disabled: true
      },
      {
        label: this.user.department,
        icon: 'pi pi-building',
        disabled: true
      },
      { separator: true },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout.emit()
      }
    ];
  }
}
