import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { User, LoginRequest, LoginResponse } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    if (environment.devBypassAuth) {
      // DEV KILL SWITCH: inject mock user directly, skip login
      this.currentUserSubject.next(environment.devMockUser as User);
    } else {
      this.checkAuthStatus();
    }
  }

  private checkAuthStatus(): void {
    this.http.get<User>(`${this.API_URL}/me`).subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null)
    });
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    if (environment.devBypassAuth) {
      const mockResponse: LoginResponse = { user: environment.devMockUser as User, message: 'dev bypass' };
      this.currentUserSubject.next(environment.devMockUser as User);
      return of(mockResponse);
    }
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap(response => this.currentUserSubject.next(response.user))
    );
  }

  logout(): Observable<void> {
    if (environment.devBypassAuth) {
      return of(void 0);
    }
    return this.http.post<void>(`${this.API_URL}/logout`, {}).pipe(
      tap(() => this.currentUserSubject.next(null))
    );
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.some(r => r.name === roleName) : false;
  }

  hasAnyRole(roleNames: string[]): boolean {
    const user = this.currentUserValue;
    return user ? user.roles.some(r => roleNames.includes(r.name)) : false;
  }
}
