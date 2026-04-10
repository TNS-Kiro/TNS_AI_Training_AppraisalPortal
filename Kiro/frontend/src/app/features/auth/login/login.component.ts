import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:linear-gradient(135deg,#667eea,#764ba2);">
      <div style="background:white;padding:2rem;border-radius:8px;width:100%;max-width:400px;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
        <h2 style="text-align:center;margin:0 0 0.5rem;color:#333;">Employee Appraisal System</h2>
        <p style="text-align:center;color:#666;margin:0 0 1.5rem;">Please login to continue</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div style="margin-bottom:1rem;">
            <label style="display:block;margin-bottom:0.4rem;font-weight:500;">Employee ID</label>
            <input formControlName="employeeId" placeholder="EMP001"
              style="width:100%;padding:0.6rem;border:1px solid #ccc;border-radius:4px;font-size:1rem;box-sizing:border-box;" />
            @if (loginForm.get('employeeId')?.invalid && loginForm.get('employeeId')?.touched) {
              <small style="color:red;">Employee ID is required</small>
            }
          </div>

          <div style="margin-bottom:1.5rem;">
            <label style="display:block;margin-bottom:0.4rem;font-weight:500;">Password</label>
            <input formControlName="password" type="password" placeholder="Password"
              style="width:100%;padding:0.6rem;border:1px solid #ccc;border-radius:4px;font-size:1rem;box-sizing:border-box;" />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <small style="color:red;">Password is required</small>
            }
          </div>

          @if (errorMessage) {
            <div style="background:#fee;border:1px solid #fcc;color:#c00;padding:0.75rem;border-radius:4px;margin-bottom:1rem;">
              {{ errorMessage }}
            </div>
          }

          <button type="submit" [disabled]="loginForm.invalid || loading"
            style="width:100%;padding:0.75rem;background:#667eea;color:white;border:none;border-radius:4px;font-size:1rem;cursor:pointer;">
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      employeeId: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      const { employeeId, password } = this.loginForm.value;

      this.authService.login({ email: employeeId, password }).subscribe({
        next: (response) => {
          this.loading = false;
          const user = response.user;
          const roles = user.roles.map(r => r.name);
          if (roles.includes('HR')) {
            this.router.navigate(['/hr/dashboard']);
          } else if (roles.includes('MANAGER')) {
            this.router.navigate(['/manager/dashboard']);
          } else if (roles.includes('ADMIN')) {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/employee/dashboard']);
          }
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        }
      });
    }
  }
}
