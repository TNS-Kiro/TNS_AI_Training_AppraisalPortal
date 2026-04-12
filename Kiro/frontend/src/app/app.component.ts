import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionTimeoutWarningComponent } from './shared/components/session-timeout-warning/session-timeout-warning.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SessionTimeoutWarningComponent],
  template: `
    <router-outlet></router-outlet>
    <app-session-timeout-warning></app-session-timeout-warning>
  `,
  styles: []
})
export class AppComponent {
  title = 'Employee Appraisal System';
}
