import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Don't redirect on the login call itself
        if (!req.url.includes('/auth/login') && !req.url.includes('/auth/me')) {
          authService.handleUnauthorized();
        }
      } else if (error.status === 403) {
        console.error('Access denied: insufficient permissions');
      } else if (error.status === 0) {
        console.error('Network error: Unable to connect to server');
      }
      return throwError(() => error);
    })
  );
};
