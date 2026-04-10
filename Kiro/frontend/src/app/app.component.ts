import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    @if (devMode) {
      <div style="background:#f59e0b;color:#000;padding:6px 16px;font-size:12px;font-weight:600;text-align:center;">
        ⚡ DEV MODE — Auth bypassed | Logged in as: Amit Shingankar (HR)
        &nbsp;|&nbsp;
        <a href="javascript:void(0)" style="color:#000;text-decoration:underline;" (click)="toggleBypass()">Disable bypass</a>
      </div>
    }
    @if (devMode) {
      <nav style="background:#1e293b;padding:10px 20px;display:flex;gap:16px;align-items:center;">
        <span style="color:white;font-weight:700;margin-right:16px;">Appraisal Portal</span>
        <a routerLink="/hr/dashboard" routerLinkActive="active-link"
           style="color:#94a3b8;text-decoration:none;padding:6px 12px;border-radius:4px;">HR Dashboard</a>
        <a routerLink="/hr/notifications/templates" routerLinkActive="active-link"
           style="color:#94a3b8;text-decoration:none;padding:6px 12px;border-radius:4px;">Notification Templates</a>
        <a routerLink="/hr/notifications/logs" routerLinkActive="active-link"
           style="color:#94a3b8;text-decoration:none;padding:6px 12px;border-radius:4px;">Notification Logs</a>
      </nav>
    }
    <router-outlet></router-outlet>
  `,
  styles: [`.active-link { background: #334155 !important; color: white !important; }`]
})
export class AppComponent {
  devMode = environment.devBypassAuth;

  toggleBypass(): void {
    alert('To disable bypass, set devBypassAuth: false in frontend/src/environments/environment.ts');
  }
}
