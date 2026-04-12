import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card-wrapper">
        <mat-card class="login-card">
          <mat-card-header>
            <div class="logo-section">
              <h1 class="app-title">TNS Appraisal Portal</h1>
              <p class="app-subtitle">Employee Performance Management System</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Email or Employee ID</mat-label>
                <input matInput formControlName="loginIdentifier"
                       type="text" autocomplete="username">
                <mat-icon matPrefix>person</mat-icon>
                <mat-error *ngIf="loginForm.get('loginIdentifier')?.hasError('required')">
                  Email or Employee ID is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Password</mat-label>
                <input matInput formControlName="password"
                       [type]="hidePassword ? 'password' : 'text'"
                       autocomplete="current-password">
                <mat-icon matPrefix>lock</mat-icon>
                <button mat-icon-button matSuffix type="button"
                        (click)="togglePasswordVisibility()">
                  <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  Password is required
                </mat-error>
              </mat-form-field>

              <div class="error-message" *ngIf="errorMessage">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <button mat-raised-button color="primary" type="submit"
                      class="login-button"
                      [disabled]="loginForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
                <span *ngIf="!isLoading">Sign In</span>
              </button>

            </form>
          </mat-card-content>
        </mat-card>

        <div class="login-footer">
          <p>&copy; 2025 Think n Solutions. All rights reserved.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0A1628 0%, #0F2240 50%, #152E54 100%);
    }

    .login-card-wrapper {
      width: 100%;
      max-width: 420px;
      padding: 16px;
    }

    .login-card {
      border-radius: 12px !important;
      box-shadow: 0 20px 48px rgba(10,22,40,.4) !important;
      overflow: hidden;
    }

    mat-card-header {
      justify-content: center;
      padding: 28px 24px 8px;
      background: linear-gradient(135deg, #0A1628, #1B3A68);
    }

    .logo-section {
      text-align: center;
      width: 100%;
    }

    .app-title {
      font-size: 1.6rem;
      font-weight: 700;
      color: #F59E0B;
      margin: 0 0 4px;
      letter-spacing: -0.02em;
    }

    .app-subtitle {
      font-size: 0.875rem;
      color: rgba(255,255,255,.7);
      margin: 0;
    }

    mat-card-content {
      padding: 20px 24px 24px !important;
    }

    .full-width {
      width: 100%;
      margin-bottom: 4px;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #DC2626;
      font-size: 0.875rem;
      margin-bottom: 12px;
      padding: 8px 12px;
      background: #FEE2E2;
      border-radius: 6px;

      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .login-button {
      width: 100%;
      height: 44px;
      font-size: 1rem;
      font-weight: 600;
      margin-top: 8px;
      background: #F59E0B !important;
      color: #0A1628 !important;
      border-radius: 8px !important;
    }

    .login-footer {
      text-align: center;
      margin-top: 16px;
      color: rgba(255,255,255,.6);
      font-size: 0.8rem;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      loginIdentifier: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        // roles is now RoleName[] (plain strings) from the backend
        const roles = response.data?.roles ?? [];

        if (roles.includes('ADMIN')) {
          this.router.navigate(['/admin/users']);
        } else if (roles.includes('HR')) {
          this.router.navigate(['/hr/templates']);
        } else if (roles.includes('MANAGER')) {
          this.router.navigate(['/manager']);
        } else {
          this.router.navigate(['/employee']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid credentials. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
