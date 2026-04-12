import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User, LoginResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;

  readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Emits true when session is about to expire (used by SessionTimeoutWarningComponent)
  readonly sessionWarningSubject = new BehaviorSubject<boolean>(false);
  public sessionWarning$ = this.sessionWarningSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkAuthStatus();
  }

  /** Check current session by calling /api/auth/me */
  checkAuthStatus(): void {
    this.http.get<LoginResponse>(`${this.API_URL}/me`).subscribe({
      next: (response) => {
        // Backend returns ApiResponse<UserProfileResponse> — user is in `data`
        const user = response?.data ?? null;
        this.currentUserSubject.next(user);
      },
      error: () => this.currentUserSubject.next(null)
    });
  }

  /** Login with loginIdentifier (email or employee ID) + password */
  login(credentials: { loginIdentifier: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.currentUserSubject.next(response.data))
    );
  }

  /** Logout and clear session */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => {
        this.currentUserSubject.next(null);
        this.sessionWarningSubject.next(false);
      })
    );
  }

  /** Refresh session to reset the 15-minute inactivity timer */
  refreshSession(): void {
    // A simple GET to /api/auth/me is enough to reset the session timer
    this.http.get(`${this.API_URL}/me`).subscribe({
      next: () => this.sessionWarningSubject.next(false),
      error: () => this.handleUnauthorized()
    });
  }

  /** Handle 401 — clear state and redirect to login */
  handleUnauthorized(): void {
    this.currentUserSubject.next(null);
    this.sessionWarningSubject.next(false);
    this.router.navigate(['/login']);
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.some(r => r === roleName) : false;
  }

  hasAnyRole(roleNames: string[]): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.some(r => roleNames.includes(r)) : false;
  }
}
